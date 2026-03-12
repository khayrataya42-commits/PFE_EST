#calendar.py
from fastapi import APIRouter, HTTPException , Depends
from app.schemas.schemas import CalendarEvent , CalendarEventCreate
from app.services.services import save_calendar_event 
from app.utils.keycloak import verify_token_with_auth_service
from fastapi.security import OAuth2PasswordBearer
import traceback
from datetime import datetime
from uuid import uuid4

# OAuth2PasswordBearer pour extraire le token depuis l'header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()

@router.post("/calendar")
async def create_event(
    event: CalendarEventCreate, 
    token: str = Depends(oauth2_scheme)  # Récupération du token via OAuth2
):
    try:
        token_info = await verify_token_with_auth_service(token)
        created_by = token_info["user_id"]
        
        # Tu peux fixer le course_id automatiquement ici si besoin
        default_course_id = uuid4()

        event = CalendarEvent(
            **event.dict(),
            course_id=default_course_id,
            created_by=created_by,
        )

        return save_calendar_event(event)
        return {"message": "Événement ajouté avec succès"}
    except HTTPException as e:
        traceback.print_exc()
        raise HTTPException(status_code=e.status_code, detail=e.detail)


# @router.post("/calendar")
# async def create_event(
#     event: CalendarEvent,
#     token: str = Depends(oauth2_scheme) 
# ):
#     try:
#         # Vérifier le token et récupérer les informations de l'utilisateur
#         token_info = await verify_token_with_auth_service(token)
#         created_by = token_info["user_id"]  # Utiliser l'user_id extrait du token

#         # Définir les dates de début et de fin si non spécifiées
#         if not event.start_time:
#             event.start_time = datetime.utcnow()
#         if not event.end_time:
#             event.end_time = event.start_time  # Par exemple, fin = début si non précisé
#         save_calendar_event(event)
#         return {"message": "Événement ajouté avec succès"}
#     except Exception as e:
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))
