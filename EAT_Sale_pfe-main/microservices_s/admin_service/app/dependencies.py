from fastapi import Depends, Header, HTTPException
from jose import jwt
import httpx
from app.config import settings


def get_public_key():
    url = f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.KEYCLOAK_REALM}"
    print("KEYCLOAK REALM URL:", url)
    response = httpx.get(url, timeout=30.0)
    response.raise_for_status()
    public_key = response.json()["public_key"]
    return f"-----BEGIN PUBLIC KEY-----\n{public_key}\n-----END PUBLIC KEY-----"


def get_current_user(authorization: str = Header(None)):
    print("AUTH HEADER:", authorization)

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token manquant ou invalide")

    token = authorization.split(" ")[1]

    try:
        payload = jwt.decode(
            token,
            get_public_key(),
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        print("TOKEN PAYLOAD:", payload)
        return payload
    except Exception as e:
        print("TOKEN ERROR:", repr(e))
        raise HTTPException(status_code=401, detail=f"Token invalide: {str(e)}")


def get_current_admin(user=Depends(get_current_user)):
    roles = user.get("realm_access", {}).get("roles", [])
    print("ROLES FROM TOKEN:", roles)

    normalized_roles = [str(role).lower() for role in roles]

    if "admin" not in normalized_roles:
        raise HTTPException(status_code=403, detail=f"Accès admin requis. Roles trouvés: {roles}")

    return user