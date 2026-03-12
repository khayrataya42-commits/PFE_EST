from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List

# Schéma pour la réponse de fichier (validation)
class FileResponse(BaseModel):
    file_id: UUID
    file_name: str
    file_type: str
    file_url: str
    course_id: str
    file_size: int
    uploaded_by: str
    uploaded_at: datetime

    class Config:
        orm_mode = True  # Permet de convertir les objets cassandra en dict et vice-versa

# Schéma pour la réponse des événements de calendrier
class CalendarEventResponse(BaseModel):
    event_id: UUID
    title: str
    description: str
    course_id: UUID
    created_by: UUID
    location: str
    event_type: str
    start_time: datetime
    end_time: datetime

    class Config:
        orm_mode = True  # Permet de convertir les objets cassandra en dict et vice-versa

# Schéma pour la réponse des notifications
class NotificationResponse(BaseModel):
    notification_id: UUID
    user_id: UUID
    message: str
    status: str
    created_at: datetime

    class Config:
        orm_mode = True  # Permet de convertir les objets cassandra en dict et vice-versa


class FileOut(BaseModel):
    file_id: UUID
    file_name: str
    file_url: str
    uploaded_at: datetime
    course_id: UUID

    # class Config:
    #     orm_mode = True
    #     json_encoders = {
    #         UUID: lambda v: str(v),
    #         datetime: lambda v: v.isoformat()
    #     }

class StudentBase(BaseModel):
    student_id: UUID
    username: str
    email: str
    department: str
    status: str