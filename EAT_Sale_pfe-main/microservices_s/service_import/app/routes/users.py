# router.py
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer
from app.utils.keycloak import verify_token_with_auth_service
from app.services.services import get_all_users
from app.config import get_cassandra_connection
from cassandra.query import dict_factory
from uuid import UUID

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()

from fastapi import HTTPException

@router.get("/users/list")
async def get_users(token: str = Depends(oauth2_scheme)):
    try:
        print("📦 Token reçu dans /users/list:", token)
        token_info = await verify_token_with_auth_service(token)
        # Extraire les rôles depuis realm_access
        roles = token_info.get("realm_access", {}).get("roles", [])
        print("🎓 Rôles détectés :", roles)

        if "admin" not in roles:
            raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")

        users = get_all_users()
        print(f"📁 {len(users)} utilisateurs récupérés.")
        return JSONResponse(content=users)

    except HTTPException as http_err:
        # ✅ Laisser FastAPI gérer les HTTPException
        raise http_err

    except Exception as e:
        print("❌ Erreur interne :", str(e))
        raise HTTPException(status_code=500, detail=f"Erreur interne : {str(e)}")

@router.get("/users/me")
async def get_current_user_info(token: str = Depends(oauth2_scheme)):
    # 🔐 Vérifie et décode le token
    print("📦 Token reçu dans /users/me:", token)
    token_info = await verify_token_with_auth_service(token)

    user_id = token_info.get("user_id")
    roles = token_info.get("realm_access", {}).get("roles", [])

    print("🎓 Rôles détectés :", roles)
    print("👤 ID Utilisateur :", user_id)

    if not user_id:
        raise HTTPException(status_code=401, detail="Utilisateur non authentifié.")

    try:
        session = get_cassandra_connection()
        session.row_factory = dict_factory

        query = """
        SELECT user_id, department, email, profile_picture, role, student_number, username
        FROM users WHERE user_id = %s;
        """
        result = session.execute(query, (UUID(user_id),)).one()

        if not result:
            raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

        user_data = dict(result)
        user_data['user_id'] = str(user_data['user_id'])  # UUID → string
        print("les données :", user_data )
        return JSONResponse(content=user_data)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Cassandra : {str(e)}")
