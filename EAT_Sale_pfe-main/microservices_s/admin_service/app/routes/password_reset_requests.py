from fastapi import APIRouter, HTTPException
from app.schemas.password_reset_schema import PasswordResetRequestCreate
from app.services.password_reset_service import (
    create_password_reset_request,
    list_password_reset_requests,
    approve_password_reset_request,
    reject_password_reset_request,
)

router = APIRouter()


@router.post("/password-reset-requests")
def create_new_password_reset_request(payload: PasswordResetRequestCreate):
    return create_password_reset_request(payload)


@router.get("/password-reset-requests")
def get_all_password_reset_requests():
    return list_password_reset_requests()


@router.post("/password-reset-requests/{request_id}/approve")
def approve_one_password_reset_request(request_id: str):
    result = approve_password_reset_request(request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return result


@router.post("/password-reset-requests/{request_id}/reject")
def reject_one_password_reset_request(request_id: str):
    result = reject_password_reset_request(request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return result