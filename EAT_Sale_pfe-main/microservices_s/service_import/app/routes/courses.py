from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.utils.keycloak import verify_token_with_auth_service
from app.config import get_cassandra_connection
from cassandra.query import dict_factory
from uuid import UUID

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
router = APIRouter()

@router.get("/courses/me")
async def get_courses_for_teacher(token: str = Depends(oauth2_scheme)):
    try:
        # Vérifier et décoder le token pour obtenir les informations de l'utilisateur
        print(f"📥.... Reçu token: {token}")
        token_info = await verify_token_with_auth_service(token)
        teacher_id = token_info["user_id"]  # Utilisation de la syntaxe correcte pour accéder au dictionnaire
        print(f"🔐.... Token valide. Infos utilisateur : {token_info} et {teacher_id}")
        if not teacher_id:
            raise HTTPException(status_code=400, detail="Teacher ID not found in token")

        # Connexion à Cassandra
        session = get_cassandra_connection()
        session.row_factory = dict_factory

        # Requête pour récupérer les cours du professeur
        query = "SELECT * FROM courses WHERE teacher_id = %s ALLOW FILTERING"
        rows = session.execute(query, (UUID(teacher_id),))

        # Retourner les résultats sous forme de liste
        return list(rows)

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des cours: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des cours")

# recper les courses pour admin 
@router.get("/courses/admin")
async def get_courses_for_admin(token: str = Depends(oauth2_scheme)):
    try:
        print(f"📥.... Reçu token: {token}")
        token_info = await verify_token_with_auth_service(token)
        print("🔐 Token info:", token_info)

        # Extraire les rôles depuis realm_access
        roles = token_info.get("realm_access", {}).get("roles", [])
        print("🎓 Rôles détectés :", roles)

        if "admin" not in roles:
            raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")

        session = get_cassandra_connection()
        session.row_factory = dict_factory

        # Récupère tous les cours
        course_query = "SELECT * FROM courses ALLOW FILTERING"
        courses = list(session.execute(course_query))

        # Récupère tous les enseignants
        user_query = "SELECT user_id, username, email FROM users WHERE role = 'Teacher' ALLOW FILTERING"
        users = list(session.execute(user_query))

        # Crée un dictionnaire {user_id: {username, email}}
        user_dict = {str(user["user_id"]): user for user in users}

        # Fusionne cours + prof info
        for course in courses:
            teacher_id = str(course["teacher_id"])
            teacher = user_dict.get(teacher_id, {})
            course["teacher"] = {
                "username": teacher.get("username", "Inconnu"),
                "email": teacher.get("email", "")
            }

        return courses

    except Exception as e:
        print(f"❌ Erreur lors de la récupération des cours: {e}")
        raise HTTPException(status_code=500, detail="Erreur lors de la récupération des cours")