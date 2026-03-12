import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    APP_NAME = os.getenv("APP_NAME", "Admin Service")
    APP_VERSION = os.getenv("APP_VERSION", "1.0.0")

    KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080")
    KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "est-sale")
    KEYCLOAK_ADMIN_REALM = os.getenv("KEYCLOAK_ADMIN_REALM", "master")
    KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "admin-cli")
    KEYCLOAK_ADMIN_USERNAME = os.getenv("KEYCLOAK_ADMIN_USERNAME", "admin")
    KEYCLOAK_ADMIN_PASSWORD = os.getenv("KEYCLOAK_ADMIN_PASSWORD", "admin")
    KEYCLOAK_FRONT_CLIENT_ID = os.getenv("KEYCLOAK_FRONT_CLIENT_ID", "frontend-client")


settings = Settings()