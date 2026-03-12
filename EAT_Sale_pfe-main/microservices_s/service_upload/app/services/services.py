# service.py
import uuid
from datetime import datetime
from app.config import get_cassandra_connection, get_minio_client
from fastapi import HTTPException, UploadFile
from app.schemas.schemas import CalendarEvent
from app.models.models import Notification
from uuid import UUID
from cassandra.cluster import Session
from typing import List

# Configuration de la connexion à Cassandra et MinIO
cassandra_session = get_cassandra_connection()
minio_client = get_minio_client()

#recuperaction des users
def get_user_by_id(user_id: uuid.UUID):
    try:
        result = cassandra_session.execute(
            "SELECT username FROM users WHERE user_id = %s", (user_id,)
        ).one()

        if result:
            return result.username  # Retourne le nom d'utilisateur
        else:
            return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de l'utilisateur: {e}")


# Fonction pour enregistrer le fichier dans MinIO
def upload_to_minio(file: UploadFile, file_id: uuid.UUID):
    file_location = f"files/{file_id}/{file.filename}"
    file.file.seek(0)  # Réinitialiser le pointeur du fichier au début
    file_size = len(file.file.read())  # Lire le fichier pour obtenir la taille
    file.file.seek(0)  # Réinitialiser de nouveau le pointeur du fichier pour l'upload

    try:
        minio_client.put_object(
            bucket_name="course-files",  # Assurez-vous d'avoir créé un bucket dans MinIO
            object_name=file_location,
            data=file.file,
            length=file_size
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'upload vers MinIO: {e}")

    return file_location

# Fonction pour enregistrer les métadonnées dans Cassandra
def save_file_metadata(file_id: uuid.UUID, course_id: uuid.UUID, file: UploadFile, file_url: str, uploaded_by: uuid.UUID):
    uploaded_at = datetime.now()
    
    try:
        # Lire le contenu pour obtenir la taille
        file_size = len(file.file.read())  # Lecture pour obtenir la taille
        file.file.seek(0)  # Réinitialiser le pointeur de fichier après la lecture
        #file_size = obj.size

        session = cassandra_session
        session.execute("""
        INSERT INTO files (file_id, course_id, file_name, file_url, file_type, file_size, uploaded_by, uploaded_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (file_id, course_id, file.filename, file_url, file.content_type, file_size, uploaded_by, uploaded_at))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement dans Cassandra: {e}")

import logging

# Configurer le logging
logging.basicConfig(level=logging.INFO)
# Fonction pour gérer l'upload du fichier
def process_file_upload(uploaded_by: str, file: UploadFile, course_id: str):
    try:
        # Convertir uploaded_by et course_id en UUID
        uploaded_by = uuid.UUID(uploaded_by)
        course_id = uuid.UUID(course_id)
        logging.info(f"UUID validés: uploaded_by={uploaded_by}, course_id={course_id}")
    except ValueError:
        logging.error("Format UUID invalide.")
        raise HTTPException(status_code=400, detail="Invalid UUID format.")

    # Récupérer le nom de l'utilisateur
    username = get_user_by_id(uploaded_by)
    if not username:
        logging.error(f"Utilisateur non trouvé pour uploaded_by={uploaded_by}")
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
    
    logging.info(f"Utilisateur trouvé: {username}")

    # Préparer le message de notification
    notification_message = f"Le fichier '{file.filename}' a été téléchargé par le prof {username}."
    logging.info(f"Message de notification préparé: {notification_message}")

    # Générer un identifiant unique pour le fichier
    file_id = uuid.uuid4()

    try:
        # Upload du fichier dans MinIO
        file_url = upload_to_minio(file, file_id)
        logging.info(f"Fichier téléchargé avec succès. URL : {file_url}")
    except Exception as e:
        logging.error(f"Erreur lors de l'upload dans MinIO: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'upload du fichier.")

    # Enregistrer les métadonnées dans Cassandra
    try:
        save_file_metadata(file_id, course_id, file, file_url, uploaded_by)
        logging.info(f"Métadonnées du fichier enregistrées dans Cassandra.")
    except Exception as e:
        logging.error(f"Erreur lors de l'enregistrement dans Cassandra: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement des métadonnées.")

    # Créer et enregistrer la notification
    try:
        save_notification(uploaded_by, notification_message, "nread")
        logging.info(f"Notification créée pour uploaded_by={uploaded_by}.")
    except Exception as e:
        logging.error(f"Erreur lors de la création de la notification: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la création de la notification.")

    # # Notifier les étudiants (optionnellement, à lier à un cours ou département)
    # try:
    #     session = get_cassandra_connection()
    #     notify_students_of_department(session, uploaded_by, notification_message)
    #     logging.info(f"Notification envoyée aux étudiants.")
    # except Exception as e:
    #     logging.error(f"Erreur lors de la notification aux étudiants: {e}")
    #     raise HTTPException(status_code=500, detail="Erreur lors de la notification aux étudiants.")
    # Notifier les étudiants (optionnellement, à lier à un cours ou département)
    try:
        # Utilisation de la session globale déjà définie
        notify_students_of_department(cassandra_session, uploaded_by, notification_message)
        logging.info(f"Notification envoyée aux étudiants.")
    except Exception as e:
        logging.error(f"Erreur lors de la notification aux étudiants: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la notification aux étudiants.")

    return {"file_id": file_id, "file_url": file_url, "message": "Fichier téléchargé avec succès"}
# Fonction principale pour traiter l'upload du fichier
# Fonction principale pour traiter l'upload du fichier
# def process_file_upload(uploaded_by: str, file: UploadFile, course_id: str):
#     try:
#         # Convertir le course_id et uploaded_by en UUID
#         uploaded_by = uuid.UUID(uploaded_by)
#         course_id = uuid.UUID(course_id)  # Convertir le course_id en UUID
#     except ValueError:
#         raise HTTPException(status_code=400, detail="Invalid UUID format.")

#     username = get_user_by_id(uploaded_by)

#     if not username:
#         raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

#     notification_message = f"Le fichier '{file.filename}' a été téléchargé par le prof {username}."

#     # Générer un identifiant unique pour le fichier
#     file_id = uuid.uuid4()

#     # Upload du fichier dans MinIO
#     file_url = upload_to_minio(file, file_id)

#     # Enregistrer les métadonnées dans Cassandra
#     save_file_metadata(file_id, course_id, file, file_url, uploaded_by)

#     # Créer la notification
#     save_notification(uploaded_by, notification_message, "nread")
#     # Notifier les étudiants (optionnellement, à lier à un cours ou département)
#     session = get_cassandra_connection()
#     notify_students_of_department(session, uploaded_by, notification_message)

#     return {"file_id": file_id, "file_url": file_url, "message": "File uploaded successfully"}

# #Fonction pour enregistrer un événement
# def save_calendar_event(event):
#     # Récupérer la date et l'heure actuelle pour created_at
#     created_at = datetime.utcnow()
    
#     # Si les dates de début et de fin ne sont pas fournies, définir une valeur par défaut
#     if not event.start_time:
#         event.start_time = created_at  # Si non précisé, démarrer l'événement maintenant
#     if not event.end_time:
#         event.end_time = created_at  # Si non précisé, mettre une heure de fin par défaut
    
#     # Générer un UUID pour l'event_id
#     event_id = uuid.uuid4()
    
#     # Ajouter l'événement dans la base de données
#     try:
#         session = cassandra_session
#         session.execute("""
#             INSERT INTO calendar (event_id, title, description, course_id, created_by,
#                                  start_time, end_time, location, event_type, created_at)
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
#         """, (
#             event_id, event.title, event.description, event.course_id, event.created_by,
#             event.start_time, event.end_time, event.location, event.event_type, created_at
#         ))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement dans Cassandra: {e}")
    
#     # Ajouter une notification après la création de l'événement
#     notification_message = f"Un événement intitulé '{event.title}' a été créé pour le cours '{event.course_id}'."
#     save_notification(event.created_by, notification_message, "non lu")  # Créer la notification
#     return {"message": "Événement créé avec succès", "event_id": str(event_id)}

# Fonction pour enregistrer un événement
def save_calendar_event(event):
    created_at = datetime.utcnow()

    # Défaut : si les dates sont manquantes, utiliser created_at
    start_time = event.start_time or created_at
    end_time = event.end_time or created_at

    event_id = uuid.uuid4()

    try:
        session = cassandra_session
        session.execute("""
            INSERT INTO calendar (
                event_id, title, description, course_id, created_by,
                start_time, end_time, location, event_type, created_at
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            event_id, event.title, event.description, event.course_id,
            event.created_by, start_time, end_time,
            event.location, event.event_type, created_at
        ))
    except Exception as e:
        logging.error(f"Erreur Cassandra lors de la sauvegarde de l'événement : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement dans Cassandra")

    # Récupérer le nom de l'utilisateur
    username = get_user_by_id(event.created_by)
    if not username:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Formuler et enregistrer la notification
    notification_message = f"Un événement intitulé '{event.title}' a été créé par le prof {username}."
    try:
        save_notification(event.created_by, notification_message, "nread")
    except Exception as e:
        logging.error(f"Erreur lors de l'enregistrement de la notification : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'enregistrement de la notification")

    # Notifier les étudiants
    try:
        notify_students_of_department(session, event.created_by, notification_message)
    except Exception as e:
        logging.error(f"Erreur lors de la notification aux étudiants : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la notification aux étudiants")

    return {"message": "Événement créé avec succès", "event_id": str(event_id)}
# def save_calendar_event(event):
#     created_at = datetime.utcnow()
    
#     # Si les dates de début et de fin ne sont pas fournies, définir une valeur par défaut
#     if not event.start_time:
#         event.start_time = created_at  # Si non précisé, démarrer l'événement maintenant
#     if not event.end_time:
#         event.end_time = created_at  # Si non précisé, mettre une heure de fin par défaut
    
#     event_id = uuid.uuid4()
    
#     try:
#         session = cassandra_session
#         session.execute("""
#             INSERT INTO calendar (event_id, title, description, course_id, created_by,
#                                  start_time, end_time, location, event_type, created_at)
#             VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
#         """, (
#             event_id, event.title, event.description, event.course_id, event.created_by,
#             event.start_time, event.end_time, event.location, event.event_type, created_at
#         ))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement dans Cassandra: {e}")
    
#     # Récupérer le nom de l'utilisateur
#     username = get_user_by_id(event.created_by)
#     if not username:
#         raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

#     # # Formuler et enregistrer la notification
#     # notification_message = f"Un événement intitulé '{event.title}' a été créé par le prof {username}."
#     # save_notification(event.created_by, notification_message, "nread")
#     # Formuler et enregistrer la notification
#     notification_message = f"Un événement intitulé '{event.title}' a été créé par le prof {username}."
#     save_notification(event.created_by, notification_message, "nread")
    
#     # Notifier les étudiants (par exemple, tous les étudiants d'un cours ou département)
#     notify_students_of_department(session, event.created_by)

#     return {"message": "Événement créé avec succès", "event_id": str(event_id)}


# def save_notification(user_id: uuid.UUID, message: str, status: str):
#     notification_id = uuid.uuid4()  # Génère un ID unique pour la notification
#     created_at = datetime.now()  # La date et l'heure de la création

#     try:
#         # Enregistrer la notification dans la base de données Cassandra
#         cassandra_session.execute("""
#         INSERT INTO notifications (notification_id, user_id, message, status, created_at)
#         VALUES (%s, %s, %s, %s, %s)
#         """, (notification_id, user_id, message, status, created_at))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement de la notification: {e}")

#     # Retourner l'objet Notification
#     return Notification(notification_id=notification_id, user_id=user_id, message=message, status=status, created_at=created_at)

# def save_notification(created_by: uuid.UUID, message: str, status: str):
#     notification_id = uuid.uuid4()
#     created_at = datetime.now()
#     try:
#         # Enregistrement dans la table notifications
#         cassandra_session.execute("""
#         INSERT INTO notifications (notification_id, created_by, message, status, created_at)
#         VALUES (%s, %s, %s, %s, %s)
#         """, (notification_id, created_by, message, status, created_at))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement de la notification: {e}")

#     return {
#         "notification_id": notification_id,
#         "created_by": created_by,
#         "message": message,
#         "status": status,
#         "created_at": created_at
#     }

# def get_students_of_same_department(session: Session, teacher_id: UUID) -> List[UUID]:
#     try:
#         # 1. Récupérer le département du professeur
#         print(f"🔍 Récupération du département du professeur avec ID : {teacher_id}")
#         teacher_row = session.execute("""
#             SELECT department FROM users WHERE user_id=%s AND role='Teacher'
#         """, [teacher_id]).one()

#         if not teacher_row:
#             print(f"⚠️ Le professeur avec ID {teacher_id} n'a pas été trouvé ou ne fait pas partie des enseignants.")
#             return []

#         teacher_dept = teacher_row.department
#         print(f"🔍 Département du professeur : {teacher_dept}")

#         # 2. Vérification du département (si aucune donnée récupérée)
#         if not teacher_dept:
#             print("⚠️ Aucun département trouvé pour ce professeur.")
#             return []

#         # 3. Récupérer les étudiants du même département
#         print(f"🔍 Récupération des étudiants du département {teacher_dept}...")
#         rows = session.execute("""
#             SELECT user_id FROM users WHERE role='student' AND department=%s ALLOW FILTERING
#         """, [teacher_dept])

#         # Si aucun étudiant n'est trouvé, afficher un message
#         student_ids = [row.user_id for row in rows]
#         if not student_ids:
#             print(f"⚠️ Aucun étudiant trouvé dans le département {teacher_dept}.")
#             return []

#         print(f"✅ Étudiants trouvés dans le même département : {student_ids}")
#         return student_ids

#     except Exception as e:
#         print(f"❌ Erreur dans get_students_of_same_department : {e}")
#         return []


# def notify_students_of_department(session, created_by, notif):
#     # Vérifier si 'notif' est un dictionnaire
#     if not isinstance(notif, dict):
#         raise HTTPException(status_code=400, detail="Notification invalide. Un dictionnaire est attendu.")

#     # 1. Récupérer les étudiants du même département que le professeur
#     student_ids = get_students_of_same_department(session, created_by)
#     if not student_ids:
#         raise HTTPException(status_code=404, detail="Aucun étudiant trouvé dans le même département.")

#     # 2. Notifier les étudiants du même département
#     for student_id in student_ids:
#         try:
#             session.execute("""
#                 INSERT INTO user_notifications (user_id, notification_id, nread)
#                 VALUES (%s, %s, %s)
#             """, (student_id, notif["notification_id"], True))
#         except Exception as e:
#             print(f"❌ Erreur lors de l'envoi de la notification à l'étudiant {student_id}: {e}")
#             continue  # Continuer même si une notification échoue pour un étudiant particulier

#     print(f"📬 Envoi de la notification à {len(student_ids)} étudiant(s)")

# def save_notification(created_by: uuid.UUID, message: str, status: str):
#     notification_id = uuid.uuid4()
#     created_at = datetime.now()
#     try:
#         # Enregistrement dans la table notifications
#         notification_id = str(uuid.uuid4())
#         cassandra_session.execute("""
#         INSERT INTO notifications (notification_id, created_by, message, status, created_at)
#         VALUES (%s, %s, %s, %s, %s)
#         """, (notification_id, created_by, message, status, created_at))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement de la notification: {e}")

#     return {
#         "notification_id": notification_id,
#         "created_by": created_by,
#         "message": message,
#         "status": status,
#         "created_at": created_at
#     }







# Fonction pour enregistrer une notification dans Cassandra
def save_notification(created_by: UUID, message: str, status: str):
    notification_id = uuid.uuid4()
    created_at = datetime.now()

    try:
        # Préparer la notification sous forme de dictionnaire
        notif = {
            "notification_id": notification_id,
            "message": message,
            "created_by": created_by,
            "status": status,
            "created_at": created_at
        }

        # Assurez-vous que la notification est un dictionnaire
        if not isinstance(notif, dict):
            raise HTTPException(status_code=400, detail="Notification invalide. Un dictionnaire est attendu.")

        # Enregistrement dans la base de données (Cassandra)
        cassandra_session.execute("""
        INSERT INTO notifications (notification_id, created_by, message, status, created_at)
        VALUES (%s, %s, %s, %s, %s)
        """, (notification_id, created_by, message, status, created_at))

        return notif

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement de la notification: {e}")

# Fonction pour récupérer les étudiants du même département qu'un professeur
def get_students_of_same_department(session: Session, teacher_id: UUID) -> List[UUID]:
    try:
        # 1. Récupérer le département du professeur
        print(f"🔍 Récupération du département du professeur avec ID : {teacher_id}")
        teacher_row = session.execute("""
            SELECT department FROM users WHERE user_id=%s AND role='Teacher'
        """, [teacher_id]).one()
        
        if not teacher_row:
            print(f"⚠️ Le professeur avec ID {teacher_id} n'a pas été trouvé ou ne fait pas partie des enseignants.")
            return []

        teacher_dept = teacher_row.department
        print(f"🔍 Département du professeur : {teacher_dept}")

        # 2. Vérification du département (si aucune donnée récupérée)
        if not teacher_dept:
            print("⚠️ Aucun département trouvé pour ce professeur.")
            return []

        # 3. Récupérer les étudiants du même département
        print(f"🔍 Récupération des étudiants du département {teacher_dept}...")
        rows = session.execute("""
            SELECT user_id FROM users WHERE role='student' AND department=%s ALLOW FILTERING
        """, [teacher_dept])

        # Si aucun étudiant n'est trouvé, afficher un message
        student_ids = [row.user_id for row in rows]
        if not student_ids:
            print(f"⚠️ Aucun étudiant trouvé dans le département {teacher_dept}.")
            return []

        print(f"✅ Étudiants trouvés dans le même département : {student_ids}")
        return student_ids

    except Exception as e:
        print(f"❌ Erreur dans get_students_of_same_department : {e}")
        return []

# Fonction pour envoyer des notifications aux étudiants du même département
# Fonction de notification
# def notify_students_of_department(session, uploaded_by: UUID, notification_message: str):
#     try:
#         # Insertion de la notification dans Cassandra avec message
#         session.execute("""
#         INSERT INTO user_notifications (notification_id, user_id, message, nread)
#         VALUES (uuid(), %s, %s, %s)
#         """, (uploaded_by, notification_message, True))  # False pour nread initialement
#         logging.info(f"Notification envoyée aux étudiants pour l'utilisateur {uploaded_by}")
#     except Exception as e:
#         logging.error(f"Erreur lors de la notification dans Cassandra: {e}")
#         raise HTTPException(status_code=500, detail="Erreur lors de la notification dans Cassandra.")

def notify_students_of_department(session, uploaded_by: UUID, notification_message: str):
    try:
        # 1. Récupérer les étudiants du même département que le prof
        student_ids = get_students_of_same_department(session, uploaded_by)

        if not student_ids:
            logging.warning("Aucun étudiant trouvé pour la notification.")
            return

        # 2. Pour chaque étudiant, créer une notification
        for student_id in student_ids:
            session.execute("""
                INSERT INTO user_notifications (notification_id, user_id, message, nread)
                VALUES (%s, %s, %s, %s)
            """, (uuid.uuid4(), student_id, notification_message, False))  # False = non lu

        logging.info(f"✅ Notification envoyée à {len(student_ids)} étudiants du département.")

    except Exception as e:
        logging.error(f"❌ Erreur lors de la notification dans Cassandra : {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la notification dans Cassandra.")
