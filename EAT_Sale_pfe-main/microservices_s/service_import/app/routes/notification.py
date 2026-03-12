# GET route pour notifications
from fastapi import APIRouter, HTTPException , Depends
from uuid import UUID
from fastapi.security import OAuth2PasswordBearer
from app.utils.keycloak import verify_token_with_auth_service
from app.services.services import get_notifications_for_student, mark_notification_as_read

# OAuth2PasswordBearer pour l'extraction du token depuis le header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()

# @router.get("/notifications/{user_id}")
# def get_user_notifications(user_id: UUID):
#     try:
#         session = get_cassandra_connection()
#         rows = session.execute("SELECT * FROM notifications WHERE user_id=%s ALLOW FILTERING", [user_id])
#         notifications = [dict(row._asdict()) for row in rows]
#         return notifications
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.get("/notifications/etudiant")
# async def get_notifs_for_student(token: str = Depends(oauth2_scheme)):
#     try:
#         print(f"📥 Reçu token: {token}")
#         token_info = await verify_token_with_auth_service(token)
#         print(f"🔐 Token valide. Infos utilisateur : {token_info}")
#         student_user_id = token_info['sub'] or token_info.get("user_id")
#         student_id = UUID(student_user_id)
#         notifs = get_nottifcations_for_student(student_id)
#         print(f" Notificaions récupérés pour les étudaint: {notifs}")
#         return notifs

#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

@router.get("/notifications/etudiant")
async def get_notifs_for_student(token: str = Depends(oauth2_scheme)):
    try:
        print(f"📥 Reçu token: {token}")
        token_info = await verify_token_with_auth_service(token)
        print(f"🔐 Token valide. Infos utilisateur : {token_info}")
        student_user_id = token_info['sub'] or token_info.get("user_id")
        student_id = UUID(student_user_id)

        # Appel de la fonction corrigée
        notifs = get_notifications_for_student(student_id)
        print(f"🔔 Notifications récupérées pour l'étudiant: {notifs}")

        return notifs

    except Exception as e:
        print(f"Erreur dans la récupération des notifications: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur dans la récupération des notifications: {str(e)}")


@router.patch("/notifications/{notification_id}/read")
async def mark_as_read(notification_id: UUID, token: str = Depends(oauth2_scheme)):
    try:
        print(f"📥 Token reçu: {token}")
        token_info = await verify_token_with_auth_service(token)
        print(f"🔐 Token validé: {token_info}")
        student_user_id = UUID(token_info['sub'] or token_info.get("user_id"))

        mark_notification_as_read(notification_id, student_user_id)
        return {"message": "✅ Notification marquée comme lue"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur serveur : {str(e)}")
