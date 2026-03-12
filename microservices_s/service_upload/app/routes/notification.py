#notification.py
from fastapi import APIRouter, HTTPException , Depends
from uuid import UUID
from datetime import datetime
from app.schemas.schemas import NotificationRequest, NotificationResponse
from app.services.services import save_notification, get_students_of_same_department
from app.utils.keycloak import verify_token_with_auth_service  # Importer la fonction de validation
from fastapi.security import OAuth2PasswordBearer
from app.config import get_cassandra_connection
from cassandra.cluster import Session
from typing import List
# OAuth2PasswordBearer pour extraire le token depuis l'header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()
@router.post("/notifications", response_model=NotificationResponse)
async def create_notification(
    notification: NotificationRequest,
    token: str = Depends(oauth2_scheme)
):
    try:
        # Vérification du token et récupération des informations de l'utilisateur
        token_info = await verify_token_with_auth_service(token)
        teacher_user_id = token_info['sub'] or token_info.get("user_id")
        created_by = UUID(teacher_user_id)

        # Créer la notification
        notif = save_notification(
            created_by=created_by,
            message=notification.message,
            status=notification.status
        )

        return notif

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.post("/notifications", response_model=NotificationResponse)
# async def create_notification(
#     notification: NotificationRequest,
#     token: str = Depends(oauth2_scheme)
# ):
#     try:
#         token_info = await verify_token_with_auth_service(token)
#         created_by = uuid.UUID(token_info["user_id"])
#         session = get_cassandra_connection()
#         # 1. Créer la notification
#         notif = save_notification(
#             created_by=created_by,
#             message=notification.message,
#             status=notification.status
#         )

#         # 2. Récupérer tous les étudiants
#         student_ids = get_all_students(session)
        
#         # 3. Associer la notif à chaque étudiant
#         for student_id in student_ids:
#             session.execute("""
#                 INSERT INTO user_notifications (user_id, notification_id, nread)
#                 VALUES (%s, %s, %s)
#             """, (student_id, notif["notification_id"], False))

#         return NotificationResponse(**notif)

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.post("/notifications", response_model=NotificationResponse)
# async def create_notification(
#     notification: NotificationRequest, 
#     token: str = Depends(oauth2_scheme)  # Récupération du token via OAuth2
# ):
#     try:
#         # Vérifier le token et obtenir les informations de l'utilisateur
#         token_info = await verify_token_with_auth_service(token)
#         user_id = token_info["user_id"]  # Utiliser l'user_id extrait du token
        
#         # Créer la notification en utilisant le service
#         notification_created = save_notification(
#             user_id=user_id,
#             message=notification.message,
#             status=notification.status
#         )
        
#         return notification_created
#     except HTTPException as e:
#         raise HTTPException(status_code=e.status_code, detail=f"Erreur lors de la création de la notification: {e}")

# # Route pour créer une notification
# @router.post("/notifications", response_model=NotificationResponse)
# async def create_notification(notification: NotificationRequest):
#     try:
#         # Appeler le service pour enregistrer la notification dans la base de données
#         notification_created = save_notification(
#             user_id=notification.user_id,
#             message=notification.message,
#             status=notification.status
#         )
#         return notification_created
#     except Exception as e:
#         # Si une erreur se produit, renvoyer un message d'erreur HTTP
#         raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la notification: {e}")


@router.get("/students/same-department/{teacher_id}", response_model=List[UUID])
def get_students_by_teacher_department(teacher_id: UUID, session: Session = Depends(get_cassandra_connection)):
    return get_students_of_same_department(session, teacher_id)