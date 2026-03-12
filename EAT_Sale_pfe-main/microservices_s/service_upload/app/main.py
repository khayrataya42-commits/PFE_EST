from fastapi import FastAPI
from app.routes.upload import router as upload_router
from app.routes.health import router as health_router
from app.routes import calendar
from app.routes.notification import router as notification_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Ajouter les routes avec APIRouter
app.include_router(upload_router, prefix="/files", tags=["uploadfile"])
app.include_router(health_router, prefix="/status", tags=["Health Check"])
app.include_router(calendar.router, prefix="/api")
app.include_router(notification_router, prefix="/api", tags=["notifications"])

# Configuration des CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permet à toutes les origines d'accéder à l'API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)