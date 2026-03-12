from uuid import uuid4
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.registration_request import RegistrationRequest
from app.services.admin_service import create_user


def create_registration_request(data):
    db: Session = SessionLocal()
    try:
        item = RegistrationRequest(
            id=str(uuid4()),
            first_name=data.first_name,
            last_name=data.last_name,
            academic_email=data.academic_email,
            birth_date=data.birth_date.isoformat(),
            apogee_code=data.apogee_code,
            password=data.password,
            status="pending",
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return {
            "id": item.id,
            "first_name": item.first_name,
            "last_name": item.last_name,
            "academic_email": item.academic_email,
            "birth_date": item.birth_date,
            "apogee_code": item.apogee_code,
            "password": item.password,
            "status": item.status,
        }
    finally:
        db.close()


def list_registration_requests():
    db: Session = SessionLocal()
    try:
        items = db.query(RegistrationRequest).all()
        return [
            {
                "id": item.id,
                "first_name": item.first_name,
                "last_name": item.last_name,
                "academic_email": item.academic_email,
                "birth_date": item.birth_date,
                "apogee_code": item.apogee_code,
                "password": item.password,
                "status": item.status,
            }
            for item in items
        ]
    finally:
        db.close()


def get_registration_request_by_id(request_id: str):
    db: Session = SessionLocal()
    try:
        item = db.query(RegistrationRequest).filter(RegistrationRequest.id == request_id).first()
        return item
    finally:
        db.close()


def approve_registration_request(request_id: str):
    db: Session = SessionLocal()
    try:
        item = db.query(RegistrationRequest).filter(RegistrationRequest.id == request_id).first()

        if not item:
            return None

        if item.status != "pending":
            return {"message": f"Demande déjà traitée: {item.status}"}

        class FakeUserCreate:
            username = item.academic_email
            email = item.academic_email
            first_name = item.first_name
            last_name = item.last_name
            password = item.password
            roles = ["student"]

        created_user = create_user(FakeUserCreate())
        item.status = "accepted"
        db.commit()

        return {
            "message": "Demande acceptée et utilisateur créé avec succès",
            "user": created_user,
        }
    finally:
        db.close()


def reject_registration_request(request_id: str):
    db: Session = SessionLocal()
    try:
        item = db.query(RegistrationRequest).filter(RegistrationRequest.id == request_id).first()

        if not item:
            return None

        if item.status != "pending":
            return {"message": f"Demande déjà traitée: {item.status}"}

        item.status = "rejected"
        db.commit()
        return {"message": "Demande rejetée avec succès"}
    finally:
        db.close()