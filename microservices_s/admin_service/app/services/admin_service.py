from typing import List, Optional
import httpx
from fastapi import HTTPException
from app.config import settings


def _admin_token() -> str:
    url = f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.KEYCLOAK_ADMIN_REALM}/protocol/openid-connect/token"

    data = {
        "grant_type": "password",
        "client_id": settings.KEYCLOAK_CLIENT_ID,
        "username": settings.KEYCLOAK_ADMIN_USERNAME,
        "password": settings.KEYCLOAK_ADMIN_PASSWORD,
    }

    response = httpx.post(url, data=data, timeout=30.0)

    if response.status_code != 200:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur token admin Keycloak: {response.text}",
        )

    return response.json()["access_token"]


def _headers() -> dict:
    token = _admin_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


def _realm_users_url() -> str:
    return f"{settings.KEYCLOAK_SERVER_URL}/admin/realms/{settings.KEYCLOAK_REALM}/users"


def _realm_roles_url() -> str:
    return f"{settings.KEYCLOAK_SERVER_URL}/admin/realms/{settings.KEYCLOAK_REALM}/roles"


def _get_user_roles(user_id: str) -> List[str]:
    url = f"{_realm_users_url()}/{user_id}/role-mappings/realm"
    response = httpx.get(url, headers=_headers(), timeout=30.0)
    response.raise_for_status()
    return [role["name"] for role in response.json()]


def create_user(data):
    # Vérifier si user existe déjà
    existing_users = get_users(username=data.username)
    if existing_users:
        raise HTTPException(
            status_code=400,
            detail=f"Utilisateur déjà existant dans Keycloak: {data.username}",
        )

    payload = {
        "username": data.username,
        "email": data.email,
        "firstName": data.first_name,
        "lastName": data.last_name,
        "enabled": True,
        "credentials": [
            {
                "type": "password",
                "value": data.password,
                "temporary": False,
            }
        ],
    }

    response = httpx.post(
        _realm_users_url(),
        headers=_headers(),
        json=payload,
        timeout=30.0,
    )

    if response.status_code not in [201, 204]:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur création utilisateur Keycloak: {response.text}",
        )

    users = get_users(username=data.username)
    user = users[0] if users else None

    if not user:
        raise HTTPException(
            status_code=500,
            detail="Utilisateur créé dans Keycloak mais introuvable après création",
        )

    if getattr(data, "roles", None):
        assign_roles(user["id"], data.roles)
        user["roles"] = data.roles

    return user


def get_users(username: Optional[str] = None):
    params = {}
    if username:
        params["username"] = username

    response = httpx.get(
        _realm_users_url(),
        headers=_headers(),
        params=params,
        timeout=30.0,
    )
    response.raise_for_status()

    users = []
    for user in response.json():
        users.append(
            {
                "id": user["id"],
                "username": user.get("username"),
                "email": user.get("email"),
                "first_name": user.get("firstName"),
                "last_name": user.get("lastName"),
                "roles": _get_user_roles(user["id"]),
            }
        )
    return users


def get_user_by_id(user_id: str):
    response = httpx.get(
        f"{_realm_users_url()}/{user_id}",
        headers=_headers(),
        timeout=30.0,
    )

    if response.status_code == 404:
        return None

    response.raise_for_status()
    user = response.json()

    return {
        "id": user["id"],
        "username": user.get("username"),
        "email": user.get("email"),
        "first_name": user.get("firstName"),
        "last_name": user.get("lastName"),
        "roles": _get_user_roles(user_id),
    }


def update_user(user_id: str, data):
    current = get_user_by_id(user_id)

    if not current:
        return None

    payload = {
        "username": current["username"],
        "email": data.email if data.email is not None else current["email"],
        "firstName": data.first_name if data.first_name is not None else current["first_name"],
        "lastName": data.last_name if data.last_name is not None else current["last_name"],
        "enabled": True,
    }

    response = httpx.put(
        f"{_realm_users_url()}/{user_id}",
        headers=_headers(),
        json=payload,
        timeout=30.0,
    )
    response.raise_for_status()

    if data.roles is not None:
        assign_roles(user_id, data.roles)

    return get_user_by_id(user_id)


def delete_user(user_id: str):
    current = get_user_by_id(user_id)

    if not current:
        return None

    response = httpx.delete(
        f"{_realm_users_url()}/{user_id}",
        headers=_headers(),
        timeout=30.0,
    )
    response.raise_for_status()

    return current


def get_roles():
    response = httpx.get(
        _realm_roles_url(),
        headers=_headers(),
        timeout=30.0,
    )
    response.raise_for_status()

    return [role["name"] for role in response.json()]


def assign_roles(user_id: str, roles: List[str]):
    available_roles_response = httpx.get(
        _realm_roles_url(),
        headers=_headers(),
        timeout=30.0,
    )
    available_roles_response.raise_for_status()

    role_map = {role["name"]: role for role in available_roles_response.json()}
    selected_roles = [role_map[role] for role in roles if role in role_map]

    current_roles_url = f"{_realm_users_url()}/{user_id}/role-mappings/realm"

    current_roles_response = httpx.get(
        current_roles_url,
        headers=_headers(),
        timeout=30.0,
    )
    current_roles_response.raise_for_status()
    current_roles = current_roles_response.json()

    if current_roles:
        httpx.request(
            "DELETE",
            current_roles_url,
            headers=_headers(),
            json=current_roles,
            timeout=30.0,
        ).raise_for_status()

    if selected_roles:
        httpx.post(
            current_roles_url,
            headers=_headers(),
            json=selected_roles,
            timeout=30.0,
        ).raise_for_status()

    return get_user_by_id(user_id)