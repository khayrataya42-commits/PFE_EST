from config import get_minio_client, get_cassandra_connection
from uuid import UUID
from datetime import datetime
import uuid

# Connexions
minio = get_minio_client()
session = get_cassandra_connection()

# Liste des objets dans le bucket 'course-files'
objects = minio.list_objects("course-files", prefix="files/", recursive=True)

for obj in objects:
    if obj.is_dir:
        continue  # Ignore les dossiers

    file_url = obj.object_name  # ex: files/uuid/filename.pdf
    parts = file_url.split("/")
    
    # On attend le format files/<course_id>/<filename>
    if len(parts) < 3:
        print(f"Chemin inattendu : {file_url}")
        continue

    file_id = uuid.uuid4()  # Nouveau UUID pour l'ID du fichier
    course_id = UUID(parts[1])
    file_name = parts[-1]
    file_size = obj.size
    file_type = "application/pdf"  # Ou dynamiquement, selon extension
    uploaded_at = datetime.utcnow()
    uploaded_by = course_id  # Ici on utilise le course_id comme user_id pour l'exemple

    # Insertion dans Cassandra
    session.execute("""
        INSERT INTO files (file_id, course_id, file_name, file_size, file_type, file_url, uploaded_at, uploaded_by)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        file_id,
        course_id,
        file_name,
        file_size,
        file_type,
        file_url,
        uploaded_at,
        uploaded_by
    ))

    print(f"Fichier inséré : {file_name} ({file_id})")
