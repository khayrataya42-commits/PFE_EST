# GET route pour calendrier
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from app.utils.keycloak import verify_token_with_auth_service
from app.config import get_cassandra_connection
from uuid import UUID
from app.services.services import get_event_for_student

# OAuth2PasswordBearer pour l'extraction du token depuis le header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()

# @router.get("/calendar/{course_id}")
# def get_calendar_events(course_id: UUID):
#     try:
#         session = get_cassandra_connection()
#         rows = session.execute("SELECT * FROM calendar WHERE course_id=%s", [course_id])
#         events = [dict(row._asdict()) for row in rows]
#         return events
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


@router.get("/calendar/professor/{professor_id}/events")
async def get_events_by_professor(professor_id: UUID, token: str = Depends(oauth2_scheme)):
    try:
        print(f"📥 Reçu token: {token}")
        token_info = await verify_token_with_auth_service(token)
        print(f"🔐 Token valide. Infos utilisateur : {token_info}")

        session = get_cassandra_connection()
        query = "SELECT * FROM calendar WHERE created_by=%s ALLOW FILTERING"
        rows = session.execute(query, [professor_id])

        events = [dict(row._asdict()) for row in rows]
        print(f"📅 Événements récupérés pour le professeur {professor_id}: {events}")
        return events

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/calendar/etudiant/events")
async def get_events_for_student(token: str = Depends(oauth2_scheme)):
    try:
        print(f"📥 Reçu token: {token}")
        token_info = await verify_token_with_auth_service(token)
        print(f"🔐 Token valide. Infos utilisateur : {token_info}")
        student_id = UUID(token_info['sub'])

        events = get_event_for_student(student_id)
        print(f"📅 Événements récupérés pour les étudaint: {events}")
        return events

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
