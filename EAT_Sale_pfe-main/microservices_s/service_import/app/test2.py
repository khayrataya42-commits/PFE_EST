from uuid import uuid4, UUID
from datetime import datetime
from config import get_cassandra_connection

session = get_cassandra_connection()

notification_id = uuid4()
created_at = datetime.utcnow()
message = "Un événement intitulé 'Présentation Projet Final' a été créé pour le cours 'course-id-test'."
status = "non lu"
user_id = UUID("ab133176-1f0d-412c-841c-3070d8ca8308")

query = """
INSERT INTO notifications (notification_id, created_at, message, status, user_id)
VALUES (%s, %s, %s, %s, %s)
"""

session.execute(query, (notification_id, created_at, message, status, user_id))

print("✅ Notification insérée !")
