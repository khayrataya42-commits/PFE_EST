from fastapi import APIRouter, HTTPException , Depends 
from fastapi.responses import StreamingResponse, JSONResponse
from app.utils.keycloak import verify_token_with_auth_service 
from fastapi.security import OAuth2PasswordBearer
from uuid import UUID

from app.services.services import get_list_professor  # Appelle le service centralisé
# OAuth2PasswordBearer pour l'extraction du token depuis le header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()

# Route pour récupérer la liste des fichiers d'un professeur spécifique
@router.get("/teachers/list/{department}")
async def get_professor_by_department(department: str, token: str = Depends(oauth2_scheme)):
    try:
        # Vérifier le token et obtenir les informations de l'utilisateur
        print(f"📥 Reçu token: {token}")
        # Authentifier l'utilisateur
        token_info = await verify_token_with_auth_service(token)
        print(f"🔐 Token valide. Infos utilisateur : {token_info}")
        # Appeler la fonction pour ce département
        profs = await get_list_professor(department)
        print(f"📁 Récupérés les professeur selent departmenet: {profs}")
        clean_profs = [{
        "user_id": str(prof["user_id"]),  # Convertir UUID en string
        "username": prof["username"],
        "role": prof["role"],
        } for prof in profs]

        return JSONResponse(content=clean_profs)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching professors: {str(e)}")

