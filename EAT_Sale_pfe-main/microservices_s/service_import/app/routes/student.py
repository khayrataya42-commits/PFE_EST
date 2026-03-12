from fastapi import APIRouter, HTTPException , Depends 
from fastapi.responses import StreamingResponse, JSONResponse
from app.utils.keycloak import verify_token_with_auth_service 
from fastapi.security import OAuth2PasswordBearer
from uuid import UUID

from app.services.services import get_list_etudiant_with_semester,get_list_etudiant  # Appelle le service centralisé
# OAuth2PasswordBearer pour l'extraction du token depuis le header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()

# Route pour récupérer la liste des etudant
@router.get("/student/list")
async def get_student_with_semester(token: str = Depends(oauth2_scheme)):
    try:
        # Vérifier le token et obtenir les informations de l'utilisateur
        print(f"📥 Reçu token: {token}")
        # Authentifier l'utilisateur
        token_info = await verify_token_with_auth_service(token)
        print(f"🔐 Token valide. Infos utilisateur : {token_info}")
        # Appeler la fonction pour ce département
        students = get_list_etudiant()
        print(f"📁 Récupérés les étudiant: {students}")

        return JSONResponse(content=students)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération : {str(e)}")

# Route pour récupérer la liste des etudant
@router.get("/student/list/students-with-semesters")
async def get_student_with_semester(token: str = Depends(oauth2_scheme)):
    try:
        # Vérifier le token et obtenir les informations de l'utilisateur
        print(f"📥 Reçu token: {token}")
        # Authentifier l'utilisateur
        token_info = await verify_token_with_auth_service(token)
        print(f"🔐 Token valide. Infos utilisateur : {token_info}")
        # Appeler la fonction pour ce département
        students_semetre = get_list_etudiant_with_semester()
        print(f"📁 Récupérés les étudiant qu'on semetre: {students_semetre}")

        return JSONResponse(content=students_semetre)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération : {str(e)}")

