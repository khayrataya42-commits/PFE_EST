import json
import pika
from app.database import SessionLocal
from app.models import Notification

RABBITMQ_HOST = "rabbitmq"
QUEUE_NAME = "notifications"


def save_notification(payload: dict):
    db = SessionLocal()
    try:
        notification = Notification(
            user_id=payload["user_id"],
            title=payload["title"],
            message=payload["message"],
            is_read=False
        )
        db.add(notification)
        db.commit()
    finally:
        db.close()


def callback(ch, method, properties, body):
    payload = json.loads(body)
    print("Notification reçue:", payload)
    save_notification(payload)


def start_consumer():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBITMQ_HOST)
    )
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME)

    channel.basic_consume(
        queue=QUEUE_NAME,
        on_message_callback=callback,
        auto_ack=True
    )

    print("Consumer RabbitMQ démarré...")
    channel.start_consuming()