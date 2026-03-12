from pydantic import BaseModel
from typing import List, Dict
# Définir un modèle d'utilisateur (Pydantic)
class User(BaseModel):
    user_id: str
    username: str
    email: str
    password: str
    roles: List[str]

# Définir un modèle pour le jeton JWT
class Token(BaseModel):
    access_token: str
    token_type: str