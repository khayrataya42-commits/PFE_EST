from fastapi import APIRouter, HTTPException, Depends
import httpx
from app.schemas.admin_schema import UserCreate, UserUpdate
from app.services.admin_service import (
    create_user,
    get_users,
    get_user_by_id,
    update_user,
    delete_user,
)
from app.dependencies import get_current_admin

router = APIRouter()


@router.post("/", status_code=201)
def create_new_user(payload: UserCreate, admin=Depends(get_current_admin)):
    try:
        user = create_user(payload)
        if not user:
            raise HTTPException(status_code=500, detail="Erreur lors de la création de l'utilisateur")
        return user
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 409:
            raise HTTPException(status_code=409, detail="Utilisateur ou email existe déjà")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Erreur Keycloak: {e.response.text}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def list_users(admin=Depends(get_current_admin)):
    return get_users()


@router.get("/{user_id}")
def get_one_user(user_id: str, admin=Depends(get_current_admin)):
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user


@router.put("/{user_id}")
def update_one_user(user_id: str, payload: UserUpdate, admin=Depends(get_current_admin)):
    user = update_user(user_id, payload)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user


@router.delete("/{user_id}")
def delete_one_user(user_id: str, admin=Depends(get_current_admin)):
    user = delete_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur supprimé avec succès"}