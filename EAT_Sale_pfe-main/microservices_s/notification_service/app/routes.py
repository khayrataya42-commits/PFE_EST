from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Notification
from app.schemas import NotificationCreate, NotificationResponse

router = APIRouter()


@router.post("/notifications", response_model=NotificationResponse)
def create_notification(payload: NotificationCreate, db: Session = Depends(get_db)):
    notification = Notification(
        user_id=payload.user_id,
        title=payload.title,
        message=payload.message,
        is_read=False
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


@router.get("/notifications/{user_id}", response_model=list[NotificationResponse])
def get_notifications(user_id: str, db: Session = Depends(get_db)):
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == user_id)
        .order_by(Notification.id.desc())
        .all()
    )
    return notifications


@router.put("/notifications/{notification_id}/read")
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")

    notification.is_read = True
    db.commit()

    return {"message": "Notification marquée comme lue"}


@router.delete("/notifications/{notification_id}")
def delete_notification(notification_id: int, db: Session = Depends(get_db)):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()

    if not notification:
        raise HTTPException(status_code=404, detail="Notification non trouvée")

    db.delete(notification)
    db.commit()

    return {"message": "Notification supprimée"}