from uuid import uuid4, UUID
from datetime import datetime
from config import get_cassandra_connection

session = get_cassandra_connection()

event_id = uuid4()
course_id = UUID("75bd6a15-b05d-4fa3-adf9-5ecf32ea61ae")
created_at = datetime.utcnow()
created_by = UUID("ab133176-1f0d-412c-841c-3070d8ca8308")
description = "Présentation finale du projet Python ML"
start_time = datetime(2025, 4, 10, 10, 0)
end_time = datetime(2025, 4, 10, 12, 0)
event_type = "présentation"
location = "Salle 101"
title = "Présentation Projet Python ML"

query = """
INSERT INTO calendar (
    event_id, course_id, created_at, created_by,
    description, start_time, end_time, event_type, location, title
)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
"""

session.execute(query, (
    event_id, course_id, created_at, created_by,
    description, start_time, end_time, event_type, location, title
))

print("✅ Événement inséré !")
