# Fonctions pour accéder à Cassandra/MinIO
from app.config import get_cassandra_connection, get_minio_client
from app.schemas.schemas import FileResponse
from uuid import UUID
import io
from fastapi import HTTPException
from cassandra.query import dict_factory

def get_file_from_storage(file_id: UUID):
    session = get_cassandra_connection()
    result = session.execute("SELECT file_name, file_url, file_type FROM files WHERE file_id=%s", [file_id])
    row = result.one()
    if not row:
        raise HTTPException(status_code=404, detail="Fichier non trouvé")

    minio = get_minio_client()
    response = minio.get_object("course-files", row.file_url)
    content = io.BytesIO(response.read())
    response.close()

    return FileResponse(file_id=file_id, file_name=row.file_name, file_type=row.file_type, file_url=row.file_url), content
def get_files_by_professor(user_id: UUID):
    session = get_cassandra_connection()
    rows = session.execute("SELECT file_id, file_name, file_type, file_url FROM files WHERE uploaded_by=%s ALLOW FILTERING", [user_id])
    
    files = []
    for row in rows:
        files.append({
            "file_id": row.file_id,
            "file_name": row.file_name,
            "file_type": row.file_type,
            "file_url": row.file_url
        })
    return files

# monioin recupération
from minio import Minio
from minio.error import S3Error
import uuid
# Initialisation du client MinIO
minio_client = get_minio_client()

# Fonction pour récupérer un fichier depuis MinIO
def download_from_minio(file_id: uuid.UUID, filename: str):
    # Construire le chemin du fichier dans MinIO
    file_location = f"files/{file_id}/{filename}"
    
    try:
        # Log du chemin de fichier pour débogage
        print(f"📁 Tentative de récupération du fichier à l'emplacement : {file_location}")

        # Télécharger le fichier depuis MinIO
        response = minio_client.get_object(
            bucket_name="course-files",  # Assurez-vous que ce nom de bucket est correct
            object_name=file_location
        )

        # Retourner le fichier comme réponse
        return response
    except S3Error as e:
        print(f"❌ Erreur lors de l'accès au fichier MinIO : {e}")
        raise HTTPException(status_code=404, detail=f"Fichier non trouvé : {e}")
# filer étudient selen depatement
from uuid import UUID
from cassandra.cluster import Session
from typing import List, Dict

def get_files_for_student(student_id: UUID) -> List[Dict]:
    # Connexion à Cassandra
    session: Session = get_cassandra_connection()

    # Récupération du département de l'étudiant
    student_row = session.execute("""
        SELECT department FROM users WHERE user_id=%s AND role='student'
    """, [student_id]).one()

    if not student_row:
        return []

    student_dept = student_row.department

    # Récupérer les professeurs du même département
    professors = session.execute("""
    SELECT user_id FROM users WHERE role='Teacher' AND department=%s ALLOW FILTERING
""", [student_dept])

    files = []

    for professor in professors:
        professor_id = professor.user_id

        # Récupérer les fichiers du professeur
        result = session.execute("""
            SELECT file_id, file_name, file_type, file_url, uploaded_at
            FROM files
            WHERE uploaded_by=%s ALLOW FILTERING
        """, [professor_id])

        for row in result:
            files.append({
                "file_id": str(row.file_id),
                "file_name": row.file_name,
                "file_type": row.file_type,
                "file_url": row.file_url,
                "uploaded_at": row.uploaded_at.isoformat()
            })

    return files

# Fonction pour récupérer la liste des fichiers d'un professeur à partir de la base de données
async def get_file_list_for_professor(uploaded_by: str):
    try:
        # Convertir l'ID de l'utilisateur en UUID
        uploaded_by_uuid = UUID(uploaded_by)
        
        # Se connecter à Cassandra
        session = get_cassandra_connection()
        session.row_factory = dict_factory  # Pour obtenir les résultats sous forme de dictionnaires
        
        # Requête pour récupérer les fichiers téléchargés par le professeur
        query = "SELECT file_id, file_name, file_url, uploaded_at, course_id FROM files WHERE uploaded_by = %s ALLOW FILTERING"
        rows = session.execute(query, (uploaded_by_uuid,))
        
        # Retourner la liste des fichiers
        return [dict(row) for row in rows]  # Convertir les résultats en liste de dictionnaires
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching file list from database: " + str(e))
    

# Fonction pour récuper les profs sulent departement
async def get_list_professor(department: str):
    try:
        session = get_cassandra_connection()
        session.row_factory = dict_factory
        query = "SELECT user_id, role, username FROM users WHERE role = 'Teacher' AND department = %s ALLOW FILTERING  "
        rows = session.execute(query, (department,))
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professors list: {str(e)}")

# Fonction pour récuper les etudiant
def get_list_etudiant():
    try:
        session = get_cassandra_connection()
        session.row_factory = dict_factory
        query = "SELECT user_id, role, username, email, department, status FROM users WHERE role = 'student' ALLOW FILTERING"
        rows = session.execute(query)
        # Conversion des UUID en string avant de renvoyer
        result = []
        for row in rows:
            row_dict = dict(row)
            row_dict['user_id'] = str(row_dict['user_id'])  # Conversion de UUID en string
            result.append(row_dict)

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des étudiants : {str(e)}")

from datetime import datetime
# Fonction pour convertir les objets non sérialisables en JSON (UUID, datetime)
def serialize_data(data):
    if isinstance(data, dict):
        return {k: serialize_data(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [serialize_data(v) for v in data]
    elif isinstance(data, datetime):
        return data.isoformat()  # Convertir en format ISO string
    elif isinstance(data, UUID):
        return str(data)  # Convertir en chaîne de caractères
    return data

# Fonction pour récuper les etudiant slemnt semestre 
def get_list_etudiant_with_semester():
    try:
        session = get_cassandra_connection()
        session.row_factory = dict_factory

        query_users = "SELECT user_id, username, email, department, status FROM users WHERE role = 'student' ALLOW FILTERING"
        users = session.execute(query_users)
        user_list = [dict(u) for u in users]

        query_enrollments = "SELECT student_id, semester, enrolled_at FROM enrollments ALLOW FILTERING"
        enrollments = session.execute(query_enrollments)
        enrollment_list = [dict(e) for e in enrollments]

        # Associer les étudiants à leurs semestres
        result = []
        for u in user_list:
            for e in enrollment_list:
                if e["student_id"] == u["user_id"]:
                    result.append({
                        "student_id": str(u["user_id"]),  # Convertir UUID en string
                        "username": u["username"],
                        "email": u.get("email", ""),
                        "department": u.get("department", ""),
                        "status": u.get("status", ""),
                        "semester": e["semester"],
                        "enrolled_at": e["enrolled_at"].strftime('%Y-%m-%d %H:%M:%S')  # Format de la date
                    })

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des étudiants avec semestres : {str(e)}")

# Fonction pour récuper les users
def get_all_users():
    try:
        session = get_cassandra_connection()
        session.row_factory = dict_factory

        query = """
        SELECT user_id, department, email, profile_picture, role, student_number, username
        FROM users;
        """
        rows = session.execute(query)
        users = [dict(row) for row in rows]

        # Convertir les UUID en chaînes de caractères
        for user in users:
            if 'user_id' in user and isinstance(user['user_id'], UUID):
                user['user_id'] = str(user['user_id'])  # Conversion du UUID en chaîne de caractères

        return users

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des utilisateurs : {str(e)}")



# affichier les evenetment ajouter par des ensigent pour chaque departement '# filer étudient selen depatement'
def get_event_for_student(student_id: UUID) -> List[Dict]:
    session: Session = get_cassandra_connection()

    # Récupération du département de l'étudiant
    student_row = session.execute("""
        SELECT department FROM users WHERE user_id=%s AND role='student'
    """, [student_id]).one()

    if not student_row:
        return []

    student_dept = student_row.department

    # Récupérer les professeurs du même département
    professors = session.execute("""
        SELECT user_id FROM users WHERE role='Teacher' AND department=%s ALLOW FILTERING
    """, [student_dept])

    events = []

    for professor in professors:
        professor_id = professor.user_id

        results = session.execute("""
            SELECT event_id, course_id, created_at, created_by, description, end_time,
                   event_type, location, start_time, title
            FROM calendar
            WHERE created_by=%s ALLOW FILTERING
        """, [professor_id])

        for row in results:
            events.append({
                "event_id": row.event_id,
                "course_id": row.course_id,
                "created_at": row.created_at,
                "created_by": row.created_by,
                "description": row.description,
                "end_time": row.end_time,
                "event_type": row.event_type,
                "location": row.location,
                "start_time": row.start_time,
                "title": row.title
            })

    return events

# affichier les notification ajouter par des ensigent pour chaque departement '# filer étudient selen depatement'
# def get_nottifcations_for_student(student_id: UUID) -> List[Dict]:
#     session: Session = get_cassandra_connection()

#     # Récupération du département de l'étudiant
#     student_row = session.execute("""
#         SELECT department FROM users WHERE user_id=%s AND role='student'
#     """, [student_id]).one()

#     if not student_row:
#         return []

#     student_dept = student_row.department

#     # Récupérer les professeurs du même département
#     professors = session.execute("""
#         SELECT user_id FROM users WHERE role='Teacher' AND department=%s ALLOW FILTERING
#     """, [student_dept])

#     notifs = []

#     for professor in professors:
#         professor_id = professor.user_id

#         results = session.execute("""
#             SELECT notification_id, created_at, message, status, user_id
#             FROM notifications
#             WHERE user_id=%s ALLOW FILTERING
#         """, [professor_id])

#         for row in results:
#             if row.status == 'non lu':
#                 notif = {
#                     'notification_id': str(row.notification_id),
#                     'created_at': row.created_at.isoformat() if isinstance(row.created_at, datetime) else str(row.created_at),
#                     'message': row.message,
#                     'status': row.status,
#                     'user_id': str(row.user_id)
#                 }
#                 notifs.append(notif)

#     return notifs

def get_notifications_for_student(student_id: UUID) -> List[Dict]:
    session: Session = get_cassandra_connection()

    # Récupérer les notifications non lues pour cet étudiant
    rows = session.execute("""
        SELECT notification_id, message, nread 
        FROM user_notifications
        WHERE user_id = %s ALLOW FILTERING
    """, [student_id])

    notifs = []
    for row in rows:
        if row.nread is False:  # notification non lue
            notif = {
                'notification_id': str(row.notification_id),
                'message': row.message,
                'nread': row.nread
            }
            notifs.append(notif)

    return notifs


def mark_notification_as_read(notification_id: UUID, user_id: UUID):
    session = get_cassandra_connection()

    session.execute("""
        UPDATE user_notifications 
        SET nread = %s 
        WHERE user_id = %s AND notification_id = %s
    """, (True, user_id, notification_id))
