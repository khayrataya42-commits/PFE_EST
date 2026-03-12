import os
from dotenv import load_dotenv
from cassandra.cluster import Cluster
from minio import Minio

# Charger les variables d'environnement
load_dotenv()

# Configuration Cassandra
CASSANDRA_HOST = os.getenv("CASSANDRA_HOST")
CASSANDRA_PORT = os.getenv("CASSANDRA_PORT")
CASSANDRA_KEYSPACE = os.getenv("CASSANDRA_KEYSPACE")
# -----------------------------------------------

class CassandraConfig:
    """Classe pour configurer Cassandra à partir des variables d'environnement"""
    def __init__(self):
        self.host = os.getenv("CASSANDRA_HOST")
        self.port = os.getenv("CASSANDRA_PORT")
        self.keyspace = os.getenv("CASSANDRA_KEYSPACE")

        # Vérification des variables d'environnement
        if not self.host or not self.port or not self.keyspace:
            raise ValueError("Les variables d'environnement de Cassandra ne sont pas correctement définies.")

    def get_connection(self):
        """Retourne une connexion à la base de données Cassandra"""
        cluster = Cluster([self.host], port=int(self.port))
        session = cluster.connect(self.keyspace)
        return session
    
# Configuration MinIO
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY")
MINIO_HOST = os.getenv("MINIO_HOST")
MINIO_PORT = os.getenv("MINIO_PORT")
MINIO_URL = f"{MINIO_HOST}:{MINIO_PORT}"

class MinIOConfig:
    """Classe pour configurer MinIO à partir des variables d'environnement"""
    def __init__(self):
        self.access_key = os.getenv("MINIO_ACCESS_KEY")
        self.secret_key = os.getenv("MINIO_SECRET_KEY")
        self.host = os.getenv("MINIO_HOST")
        self.port = os.getenv("MINIO_PORT")
        self.url = f"{self.host}:{self.port}"

        # Vérification des variables d'environnement
        if not self.access_key or not self.secret_key or not self.host or not self.port:
            raise ValueError("Les variables d'environnement de MinIO ne sont pas correctement définies.")

    def get_client(self):
        """Retourne un client MinIO configuré"""
        client = Minio(
            self.url,  # Utilise l'hôte et le port sans le protocole "http://"
            access_key=self.access_key,
            secret_key=self.secret_key,
            secure=False  # False pour HTTP, True pour HTTPS si nécessaire
        )
        return client
    
# -----------------------------------------------
# Initialisation des configurations
# -----------------------------------------------

cassandra_config = CassandraConfig()
minio_config = MinIOConfig()

# Retour des objets de connexion
def get_cassandra_connection():
    return cassandra_config.get_connection()

def get_minio_client():
    return minio_config.get_client()
#--------------------
class Settings:
    KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")
    KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM")
    KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID")
    KEYCLOAK_CLIENT_SECRET = os.getenv("KEYCLOAK_CLIENT_SECRET")
    KEYCLOAK_ADMIN_USERNAME = os.getenv("KEYCLOAK_ADMIN_USERNAME")
    KEYCLOAK_ADMIN_PASSWORD = os.getenv("KEYCLOAK_ADMIN_PASSWORD")

settings = Settings()