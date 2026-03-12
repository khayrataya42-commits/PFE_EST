#schemas.py
from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
import uuid

# Schéma Pydantic pour le téléchargement de fichiers (validation)
class UploadFileRequest(BaseModel):
    course_id: str
    uploaded_by: str
    file: str  # Nom du fichier

# class CalendarEvent(BaseModel):
#     title: str
#     description: str
#     course_id: uuid.UUID
#     created_by: uuid.UUID
#     location: str
#     event_type: str
#     start_time: datetime = None  # Si non précisé, prendra une valeur par défaut
#     end_time: datetime = None    # Si non précisé, prendra une valeur par défaut

class CalendarEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_type: Optional[str] = None
    start_time: datetime
    end_time: datetime

class CalendarEvent(CalendarEventCreate):
    course_id: uuid.UUID
    created_by: uuid.UUID

# Schéma Pydantic pour la requête de notification (lors de la création)
class NotificationRequest(BaseModel):
    user_id: UUID
    message: str
    status: str  # Exemple de status : 'unread', 'read'

# Schéma de réponse (ce que l'API renvoie après avoir créé la notification)
class NotificationResponse(NotificationRequest):
    notification_id: UUID
    created_at: datetime
