#models.py
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime

# Modèle Pydantic pour la validation des données
class FileMetadata(BaseModel):
    file_id: UUID
    course_id: str
    file_name: str
    file_url: str
    file_type: str
    file_size: int
    uploaded_by: str
    uploaded_at: datetime


# Modèle Pydantic pour la validation des notifications
class Notification(BaseModel):
    notification_id: UUID
    user_id: UUID
    message: str
    status: str  # Exemple de status : 'unread', 'read'
    created_at: datetime

class Config:
    orm_mode = True  # Permet de convertir les objets cassandra en dict et vice-versa