from fastapi import APIRouter, HTTPException
from app.schemas.admin_schema import RoleAssign
from app.services.admin_service import assign_roles, get_roles

router = APIRouter()


@router.get("/")
def list_roles():
    return {"roles": get_roles()}


@router.post("/assign")
def assign_user_roles(payload: RoleAssign):
    user = assign_roles(payload.user_id, payload.roles)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user