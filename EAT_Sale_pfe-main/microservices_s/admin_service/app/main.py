from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.admin import router as admin_router
from app.routes.users import router as users_router
from app.routes.roles import router as roles_router
from app.routes.registration_requests import router as registration_requests_router
from app.routes.password_reset_requests import router as password_reset_requests_router

from app.config import settings
from app.database import Base, engine
from app.models.registration_request import RegistrationRequest
from app.models.password_reset_request import PasswordResetRequest

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

# Création automatique des tables dans la base
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Admin service is running"}


app.include_router(admin_router, prefix="/admin", tags=["Admin"])
app.include_router(users_router, prefix="/admin/users", tags=["Users"])
app.include_router(roles_router, prefix="/admin/roles", tags=["Roles"])
app.include_router(registration_requests_router, tags=["Registration Requests"])
app.include_router(password_reset_requests_router, tags=["Password Reset Requests"])