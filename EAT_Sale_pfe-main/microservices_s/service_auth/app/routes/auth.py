#auth.py
from fastapi import APIRouter, HTTPException
from app.schemas.auth_schema import LoginRequest
from app.services.auth_service import get_token, decode_token ,handle_user_login , refresh_token_from_keycloak
from app.models.token import Token
from fastapi import Depends
from app.utils.keycloak import verify_token, check_user_role, oauth2_scheme

router = APIRouter()

# @router.post("/login", response_model=Token)
# async def login(login_request: LoginRequest):
#     try:
#         token = await get_token(login_request.username, login_request.password)
#         return token
#     except Exception as e:
#         raise HTTPException(status_code=401, detail=str(e))
# auth_service - route login
# @router.post("/login", response_model=Token)
# async def login(login_request: LoginRequest):
#     try:
#         token = await get_token(login_request.username, login_request.password)
#         return token  # Le token est généré ici
#     except Exception as e:
#         raise HTTPException(status_code=401, detail=str(e))

@router.post("/login", response_model=Token)
async def login(form_data: LoginRequest):
    username = form_data.username
    password = form_data.password
# async def login(form_data: dict):
#     username = form_data["username"]
#     password = form_data["password"]
    
    # 1. Récupère le token depuis Keycloak
    token = await get_token(username, password)

    # 2. Décode les infos depuis le token JWT
    payload = await verify_token(token.access_token)
    user_info = decode_token(payload)

    # 3. Gérer l'insertion de l'utilisateur dans Cassandra si nécessaire
    await handle_user_login(user_info)

    # 4. Retourne token + info utilisateur
    return {
        "access_token": token.access_token,
        "token_type": token.token_type,
        "user_info": user_info
    }

@router.post("/refresh", response_model=Token)
async def refresh_token_endpoint(form_data: dict):
    refresh_token = form_data.get("refresh_token")

    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token is required")

    token = await refresh_token_from_keycloak(refresh_token)
    user_info = decode_token(token.access_token)
    return {
        "access_token": token.access_token,
        "token_type": token.token_type,
        "user_info": user_info
    }


# admin route
@router.get("/admin", dependencies=[Depends(verify_token)])
async def admin_route(token: str = Depends(oauth2_scheme)):
    # Check if user has the admin role
    await check_user_role(token, ["Admin"])
    return {"message": "Welcome, Admin!"}
# student route 
@router.get("/student", dependencies=[Depends(verify_token)])
async def student_route(token: str = Depends(oauth2_scheme)):
    # Check if user has the student role
    await check_user_role(token, ["Student"])
    return {"message": "Welcome, Student!"}
# teacher route
@router.get("/teacher", dependencies=[Depends(verify_token)])
async def teacher_route(token: str = Depends(oauth2_scheme)):
    # Check if user has the teacher role
    await check_user_role(token, ["Teacher"])
    return {"message": "Welcome, Teacher!"}

@router.get("/protected", dependencies=[Depends(verify_token)])
async def protected_route():
    return {"message": "You have access to this protected route!"}