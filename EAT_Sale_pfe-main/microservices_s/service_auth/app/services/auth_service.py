#auth_service.py
import httpx
from app.config import settings , get_cassandra_connection
from cassandra.query import SimpleStatement
from app.models.token import Token
from datetime import datetime
from uuid import UUID

async def get_token(username: str, password: str) -> Token:
    token_url = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/token"
    data = {
        "client_id": settings.KEYCLOAK_CLIENT_ID,
        "client_secret": settings.KEYCLOAK_CLIENT_SECRET,
        "grant_type": "password",
        "username": username,
        "password": password,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)

        if response.status_code != 200:
           raise Exception(f"Keycloak error: {response.status_code} - {response.text}")


        token_data = response.json()
        return Token(access_token=token_data["access_token"], token_type=token_data["token_type"])

import jwt  # pip install PyJWT
from fastapi import HTTPException
import logging
# def decode_token(token: str):
#     try:
#        
#         payload = jwt.decode(token, options={"verify_signature": False})
#         print("✅ Payload décodé :", payload)
#         return {
#             "username": payload.get("preferred_username"),
#             "email": payload.get("email"),
#             "role": payload.get("realm_access", {}).get("roles", []),
#             "user_id": payload.get("sub")
#         }
#     except Exception as e:
#         print("❌ Erreur de décodage :", str(e))
#         raise HTTPException(status_code=401, detail="Invalid token")

async def refresh_token_from_keycloak(refresh_token: str) -> Token:
    token_url = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/token"
    data = {
        "client_id": settings.KEYCLOAK_CLIENT_ID,
        "client_secret": settings.KEYCLOAK_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=data)

        if response.status_code != 200:
            raise Exception(f"Keycloak refresh error: {response.status_code} - {response.text}")

        token_data = response.json()
        return Token(access_token=token_data["access_token"], token_type=token_data["token_type"])


def extract_main_role(roles: list[str]) -> str:
    # Liste des rôles applicables dans ton système
    valid_roles = {"Student", "Teacher", "Administrator", "Admin"}

    for role in roles:
        if role in valid_roles:
            return role  # Retourne le premier rôle principal trouvé

    return "Unknown"  # Si aucun rôle connu n’est trouvé
def decode_token(payload: dict):
    try:
        raw_roles = payload.get("realm_access", {}).get("roles", [])
        main_role = extract_main_role(raw_roles)

        user_info = {
            "username": payload.get("preferred_username"),
            "email": payload.get("email"),
            "role": main_role,
            "user_id": payload.get("sub")
        }

        logger = logging.getLogger(__name__)
        logger.info("Informations extraites du token pour user=%s", user_info["username"])
        return user_info

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token payload: {str(e)}")

# Fonction pour vérifier si l'utilisateur existe dans Cassandra
async def check_user_exists(user_id: UUID) -> bool:
    session = get_cassandra_connection()
    query = SimpleStatement("SELECT user_id FROM users WHERE user_id = %s")
    rows = session.execute(query, (user_id,))
    return bool(rows.current_rows)

# Fonction pour insérer un utilisateur dans Cassandra
async def insert_user(user_info: dict):
    session = get_cassandra_connection()

    # Récupérer le rôle et initialiser les valeurs par défaut
    role = user_info.get("role")
    student_number = user_info.get("student_number")
    department = user_info.get("department")

    # Si l'utilisateur est un étudiant, générer un matricule
    if role == "Student":
        student_number = student_number or f"STU-{user_info['username'][:3].upper()}-{str(user_info['user_id'])[:4]}"
    elif role == "Teacher":
        # Si c'est un enseignant, assigner un département par défaut ou utiliser celui fourni
        department = department or "Informatique"
    elif role == "Admin":
        # Pour un admin, on peut ne pas avoir besoin de student_number ni de department
        student_number = None
        department = None

    # Insertion dans Cassandra
    query = SimpleStatement("""
        INSERT INTO users (user_id, username, email, role, student_number, department, profile_picture, status, created_at)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
    """)

    # Exécution de la requête avec les valeurs fournies
    session.execute(query, (
        UUID(user_info["user_id"]),
        user_info["username"],
        user_info["email"],
        role,
        student_number,
        department,
        user_info.get("profile_picture", None),
        "active",  # Statut par défaut
        datetime.utcnow()
    ))

# Fonction principale de gestion de la connexion et insertion dans la base de données
import logging

logger = logging.getLogger(__name__)

async def handle_user_login(user_info: dict):
    try:
        user_id = UUID(user_info["user_id"])

        if not await check_user_exists(user_id):
            await insert_user(user_info)
            logger.info("Utilisateur %s ajouté dans Cassandra", user_info["username"])
        else:
            logger.info("Utilisateur %s existe déjà dans Cassandra", user_info["username"])

    except Exception as e:
        logger.warning("Cassandra indisponible ou keyspace manquant: %s", str(e))