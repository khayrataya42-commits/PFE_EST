from fastapi import APIRouter, HTTPException
from app.schemas.registration_schema import RegistrationRequestCreate
from app.services.registration_service import (
    create_registration_request,
    list_registration_requests,
    approve_registration_request,
    reject_registration_request,
)

router = APIRouter()


@router.post("/registration-requests")
def create_new_registration_request(payload: RegistrationRequestCreate):
    return create_registration_request(payload)


@router.get("/registration-requests")
def get_all_registration_requests():
    return list_registration_requests()


@router.post("/registration-requests/{request_id}/approve")
def approve_one_request(request_id: str):
    result = approve_registration_request(request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return result


@router.post("/registration-requests/{request_id}/reject")
def reject_one_request(request_id: str):
    result = reject_registration_request(request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return result