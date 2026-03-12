upload_service/
├──app
│ ├── routes/ # Dossier pour les routes FastAPI ✅
│ │ ├── **init**.py  
│ │ ├── upload.py # Routes pour l'upload des fichiers  
│ │ ├── health.py # Route pour vérifier l'état du service  
│ │ │ ├── middlewares/ │ │ ├── **init**.py │ │ ├──
│ ├── utils/  
│ │ ├──  
│ │ ├── **init**.py  
│ │
│ ├── models  
│ │ ├── models.py # Modèles de données │ │ ├──**init**.py │ ├── schemas │ │ ├── schemas.py # Schémas Pydantic │ │ ├──**init**.py  
│ ├── services  
│ │ ├── services.py │ │ ├──**init**.py
│ ├── main.py # Point d'entrée FastAPI (utilise APIRouter) │ ├── config.py │ ├── **init**.py ├── venv ├── docker-compose.yml ├── Dockerfile ├── README.md ├── requirements.txt ├── .env
