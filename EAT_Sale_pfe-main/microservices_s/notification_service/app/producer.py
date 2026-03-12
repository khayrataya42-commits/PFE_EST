import json
import pika

RABBITMQ_HOST = "rabbitmq"
QUEUE_NAME = "notifications"


def send_notification(payload: dict):
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=RABBITMQ_HOST)
    )
    channel = connection.channel()
    channel.queue_declare(queue=QUEUE_NAME)

    channel.basic_publish(
        exchange="",
        routing_key=QUEUE_NAME,
        body=json.dumps(payload)
    )

    connection.close()