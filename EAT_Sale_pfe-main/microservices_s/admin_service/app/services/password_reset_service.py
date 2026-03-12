from uuid import uuid4
from app.services.admin_service import get_users, update_user

# stockage temporaire en mémoire
password_reset_requests = []


def create_password_reset_request(data):
    item = {
        "id": str(uuid4()),
        "academic_email": data.academic_email,
        "apogee_code": data.apogee_code,
        "birth_date": data.birth_date.isoformat(),
        "status": "pending",
    }
    password_reset_requests.append(item)
    return item


def list_password_reset_requests():
    return password_reset_requests


def get_password_reset_request_by_id(request_id: str):
    for item in password_reset_requests:
        if item["id"] == request_id:
            return item
    return None


def approve_password_reset_request(request_id: str):
    item = get_password_reset_request_by_id(request_id)
    if not item:
        return None

    if item["status"] != "pending":
        return {"message": f"Demande déjà traitée: {item['status']}"}

    users = get_users()
    target_user = None

    for user in users:
        if user.get("email") == item["academic_email"]:
            target_user = user
            break

    if not target_user:
        raise Exception("Utilisateur introuvable avec cet email dans Keycloak")

    temporary_password = "123456"

    class FakeUpdateUser:
        email = target_user.get("email")
        first_name = target_user.get("first_name")
        last_name = target_user.get("last_name")
        roles = target_user.get("roles")

    update_user(target_user["id"], FakeUpdateUser())

    from app.services.admin_service import _realm_users_url, _headers
    import httpx

    reset_password_payload = {
        "type": "password",
        "value": temporary_password,
        "temporary": False,
    }

    response = httpx.put(
        f"{_realm_users_url()}/{target_user['id']}/reset-password",
        headers=_headers(),
        json=reset_password_payload,
        timeout=30.0,
    )
    response.raise_for_status()

    item["status"] = "accepted"

    return {
        "message": "Mot de passe réinitialisé avec succès",
        "temporary_password": temporary_password,
        "user_email": item["academic_email"],
    }


def reject_password_reset_request(request_id: str):
    item = get_password_reset_request_by_id(request_id)
    if not item:
        return None

    if item["status"] != "pending":
        return {"message": f"Demande déjà traitée: {item['status']}"}

    item["status"] = "rejected"
    return {"message": "Demande refusée avec succès"}