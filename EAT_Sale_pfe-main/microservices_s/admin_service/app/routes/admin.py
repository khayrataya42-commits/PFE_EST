from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "ok", "service": "admin_service"}


@router.get("/dashboard")
def admin_dashboard():
    return {
        "message": "Bienvenue dans le dashboard admin",
        "modules": ["users", "roles", "settings"]
    }