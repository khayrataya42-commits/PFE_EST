from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from threading import Thread

from app.database import Base, engine
from app.routes import router
from app.consumer import start_consumer

app = FastAPI(title="Notification Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(router)


@app.get("/")
def root():
    return {"message": "Notification service running"}


@app.on_event("startup")
def startup_event():
    thread = Thread(target=start_consumer, daemon=True)
    thread.start()