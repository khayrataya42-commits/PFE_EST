from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database import SessionLocal
from app.models import Message
from app.schemas import MessageCreate
from app.producer import send_notification

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/messages")
def create_message(payload: MessageCreate, db: Session = Depends(get_db)):
    message = Message(
        sender=payload.sender,
        receiver=payload.receiver,
        content=payload.content
    )
    db.add(message)
    db.commit()
    db.refresh(message)

    send_notification({
        "user_id": payload.receiver,
        "title": "Nouveau message",
        "message": f"{payload.sender} vous a envoyé un message"
    })

    return {
        "message": "Message envoyé avec succès",
        "data": {
            "id": message.id,
            "sender": message.sender,
            "receiver": message.receiver,
            "content": message.content
        }
    }


@router.get("/messages/{username}")
def get_user_messages(username: str, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(
        or_(Message.sender == username, Message.receiver == username)
    ).all()
    return messages