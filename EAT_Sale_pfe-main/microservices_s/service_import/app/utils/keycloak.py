# Authentification Keycloak (token)
import httpx
import jwt
from jwt import PyJWKClient
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from fastapi import HTTPException
from app.config import settings

# URL du serveur Keycloak pour récupérer la clé publique
KEYCLOAK_CERTS_URL = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_REALM}/protocol/openid-connect/certs"

# Fonction pour vérifier et décoder un token JWT avec la clé publique de Keycloak
async def verify_token_with_auth_service(token: str):
    print(f"Received token: {token}")

    jwks_client = PyJWKClient(KEYCLOAK_CERTS_URL)
    
    try:
        # Extraire l'en-tête du token pour récupérer le "kid"
        signing_key = jwks_client.get_signing_key_from_jwt(token).key

        # Décoder le token en utilisant la clé publique correcte
        decoded_token = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            audience="account"
        )
        
        print(f"Decoded Token: {decoded_token}")

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = decoded_token.get("sub")  # L'ID de l'utilisateur est généralement sous "sub" ou "user_id"

    if not user_id:
        raise HTTPException(status_code=401, detail="Token does not contain user ID")

    return decoded_token
