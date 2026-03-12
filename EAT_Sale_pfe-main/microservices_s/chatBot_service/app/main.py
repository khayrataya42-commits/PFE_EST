from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
import json
from datetime import datetime

from app.producer import send_notification

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_NAME = "/app/chat.db"
connections = []


def get_connection():
    return sqlite3.connect(DB_NAME)


def create_messages_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            receiver TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)


def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT name
        FROM sqlite_master
        WHERE type='table' AND name='messages'
    """)
    table_exists = cursor.fetchone()

    if table_exists:
        cursor.execute("PRAGMA table_info(messages)")
        columns = [row[1] for row in cursor.fetchall()]

        if "receiver" not in columns:
            cursor.execute("DROP TABLE IF EXISTS messages")
            create_messages_table(cursor)
    else:
        create_messages_table(cursor)

    conn.commit()
    conn.close()


def save_message(sender: str, receiver: str, content: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO messages (sender, receiver, content, created_at)
        VALUES (?, ?, ?, ?)
        """,
        (sender, receiver, content, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()


def get_all_messages():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT sender, receiver, content, created_at
        FROM messages
        ORDER BY id ASC
    """)
    rows = cursor.fetchall()
    conn.close()

    messages = []
    for row in rows:
        messages.append({
            "sender": row[0],
            "receiver": row[1],
            "content": row[2],
            "created_at": row[3]
        })
    return messages


def get_user_messages(username: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT sender, receiver, content, created_at
        FROM messages
        WHERE sender = ? OR receiver = ?
        ORDER BY id ASC
    """, (username, username))
    rows = cursor.fetchall()
    conn.close()

    messages = []
    for row in rows:
        messages.append({
            "sender": row[0],
            "receiver": row[1],
            "content": row[2],
            "created_at": row[3]
        })
    return messages


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
async def root():
    return {"message": "Chat service is running"}


@app.get("/messages")
async def fetch_messages():
    return get_all_messages()


@app.get("/messages/{username}")
async def fetch_user_messages(username: str):
    return get_user_messages(username)


@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            parsed = json.loads(data)

            sender = parsed.get("sender", "Utilisateur")
            receiver = parsed.get("receiver", "student1")
            content = parsed.get("content", "").strip()

            if content == "":
                continue

            message = {
                "sender": sender,
                "receiver": receiver,
                "content": content,
                "created_at": datetime.now().isoformat()
            }

            save_message(sender, receiver, content)

            try:
                send_notification({
                    "user_id": receiver,
                    "title": "Nouveau message",
                    "message": f"{sender} vous a envoyé un message"
                })
            except Exception as e:
                print("Erreur RabbitMQ notification:", e)

            disconnected = []
            for connection in connections:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception:
                    disconnected.append(connection)

            for dc in disconnected:
                if dc in connections:
                    connections.remove(dc)

    except WebSocketDisconnect:
        if websocket in connections:
            connections.remove(websocket)