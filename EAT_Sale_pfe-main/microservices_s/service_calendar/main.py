from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
from typing import Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "calendar.db"


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    date: str
    start_time: str
    end_time: str
    event_type: str
    teacher: Optional[str] = ""
    target_group: Optional[str] = ""


def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            event_type TEXT NOT NULL,
            teacher TEXT,
            target_group TEXT
        )
    """)
    conn.commit()
    conn.close()


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def root():
    return {"message": "Calendar service is running"}


@app.get("/events")
def get_events():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, description, date, start_time, end_time, event_type, teacher, target_group
        FROM events
        ORDER BY date ASC, start_time ASC
    """)
    rows = cursor.fetchall()
    conn.close()

    events = []
    for row in rows:
        events.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "date": row[3],
            "start_time": row[4],
            "end_time": row[5],
            "event_type": row[6],
            "teacher": row[7],
            "target_group": row[8],
        })
    return events


@app.post("/events")
def create_event(event: EventCreate):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO events (title, description, date, start_time, end_time, event_type, teacher, target_group)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        event.title,
        event.description,
        event.date,
        event.start_time,
        event.end_time,
        event.event_type,
        event.teacher,
        event.target_group,
    ))
    conn.commit()
    conn.close()

    return {"message": "Event created successfully"}


@app.put("/events/{event_id}")
def update_event(event_id: int, event: EventCreate):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE events
        SET title = ?, description = ?, date = ?, start_time = ?, end_time = ?, event_type = ?, teacher = ?, target_group = ?
        WHERE id = ?
    """, (
        event.title,
        event.description,
        event.date,
        event.start_time,
        event.end_time,
        event.event_type,
        event.teacher,
        event.target_group,
        event_id,
    ))
    conn.commit()
    conn.close()

    return {"message": "Event updated successfully"}


@app.delete("/events/{event_id}")
def delete_event(event_id: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM events WHERE id = ?", (event_id,))
    conn.commit()
    conn.close()

    return {"message": "Event deleted successfully"}