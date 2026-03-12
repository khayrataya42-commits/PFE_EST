import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth

load_dotenv()

app = FastAPI(title=os.getenv("APP_NAME", "Authentication Microservice"))

app.include_router(auth.router, prefix="/auth", tags=["Auth"])

frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

origins = [frontend_url]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Authentication Microservice"}

@app.get("/health")
async def health():
    return {"status": "ok"}