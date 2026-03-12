from fastapi import APIRouter, HTTPException , Depends 
from fastapi.responses import StreamingResponse, JSONResponse
from app.utils.keycloak import verify_token_with_auth_service 
from fastapi.security import OAuth2PasswordBearer
from uuid import UUID
import io
from typing import List
from app.schemas.schemas import FileOut
from app.services.services import get_file_from_storage, get_files_for_student, get_file_list_for_professor ,download_from_minio # Appelle le service centralisé

from uuid import UUID
from typing import List, Dict
from io import BytesIO
from fastapi.responses import StreamingResponse


# OAuth2PasswordBearer pour l'extraction du token depuis le header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()

@router.get("/files/{file_id}")
async def get_file(file_id: UUID):
    """
    Télécharger un fichier à partir de son ID
    """
    try:
        file_metadata, content = get_file_from_storage(file_id)
        return StreamingResponse(
            content,
            media_type=file_metadata.file_type,
            headers={"Content-Disposition": f"attachment; filename={file_metadata.file_name}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# @router.get("/professors/{user_id}/files")
# async def get_professor_files(user_id: UUID, token: str = Depends(oauth2_scheme)):
#     try:
#         print(f"📥 Reçu token: {token}")
#         token_info = await verify_token_with_auth_service(token)
#         print(f"🔐 Token valide. Infos utilisateur : {token_info}")

#         files = get_files_by_professor(user_id)
#         print(f"📁 Fichiers récupérés pour le professeur {user_id}: {files}")
#         return files
#     except Exception as e:
#         print(f"❌ Erreur dans /professors/{user_id}/files : {e}")
#         raise HTTPException(status_code=500, detail=str(e))

# Route pour récupérer la liste des fichiers d'un professeur spécifique
@router.get("/files/professors/list")
async def get_file_list(token: str = Depends(oauth2_scheme)):
    try:
        # Vérifier le token et obtenir les informations de l'utilisateur
        print(f"📥 Reçu token: {token}")
        token_info = await verify_token_with_auth_service(token)
        print(f"🔐 Token valide. Infos utilisateur : {token_info}")
        uploaded_by = token_info["user_id"]  # Extraire l'user_id du token
        
        # Appeler la fonction de service pour obtenir la liste des fichiers pour ce professeur
        files = await get_file_list_for_professor(uploaded_by)
        print(f"📁 Fichiers récupérés pour le professeur {uploaded_by}: {files}")
        # # Retourner la liste des fichiers
        # return {"files": files}
        
        # Nettoyage pour JSON
        clean_files = []
        for file in files:
            clean_files.append({
                "file_id": str(file["file_id"]),
                "file_name": file["file_name"],
                "file_url": file["file_url"],
                "uploaded_at": file["uploaded_at"].isoformat(),  # ou .strftime(...)
                "course_id": str(file["course_id"]),
            })

        return JSONResponse(content=clean_files)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error fetching file list: " + str(e))



# Route pour récupérer les fichiers de l'étudiant et les télécharger depuis MinIO
@router.get("/students/me/files", response_model=List[Dict])
async def get_files_for_current_student(token: str = Depends(oauth2_scheme)):
    try:
        # Vérification du token et extraction de l'ID de l'étudiant
        print(f"📥 Reçu token: {token}")
        token_info = await verify_token_with_auth_service(token)
        
        # Extraction de l'ID de l'étudiant depuis le token (à adapter selon votre système d'authentification)
        student_user_id = token_info.get("sub") or token_info.get("user_id")
        student_id = UUID(student_user_id)
        
        print(f"🔐 Token valide. ID étudiant: {student_id}")
        
        # Récupération des fichiers associés à l'étudiant depuis Cassandra
        files_info = get_files_for_student(student_id)
        
        print(f"📁 Fichiers récupérés pour l'étudiant : {files_info}")
        
        # Préparer les fichiers avec leurs URL de téléchargement depuis MinIO
        file_urls = []
        for file_info in files_info:
            # Pour chaque fichier, on crée un dictionnaire contenant les informations du fichier et l'URL pour télécharger
            file_url = f"/students/me/files/{file_info['file_id']}/{file_info['file_name']}"
            file_info['download_url'] = file_url
            file_urls.append(file_info)
        
        # Retourner les informations des fichiers avec l'URL de téléchargement
        return file_urls
        
    except Exception as e:
        # Si une erreur se produit, renvoyer une erreur HTTP
        print(f"❌ Erreur : {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Route pour télécharger un fichier spécifique

@router.get("/students/me/files/{file_id}/{filename}")
async def download_file(file_id: UUID, filename: str, token: str = Depends(oauth2_scheme)):
    try:
        print(f"📥 Reçu token: {token}")
        token_info = await verify_token_with_auth_service(token)
        
        # Vérification du chemin du fichier dans MinIO
        file_location = f"files/{file_id}/{filename}"
        print(f"📁 Chemin du fichier demandé : {file_location}")
        
        # Appeler la fonction pour télécharger depuis MinIO
        file_content = download_from_minio(file_id, filename)
        
        # Retourner le fichier sous forme de réponse de téléchargement
        return StreamingResponse(file_content, media_type="application/octet-stream", headers={
            "Content-Disposition": f"attachment; filename={filename}"
        })
        
    except Exception as e:
        # Si une erreur se produit, renvoyer une erreur HTTP
        print(f"❌ Erreur lors du téléchargement du fichier : {e}")
        raise HTTPException(status_code=404, detail=f"Fichier non trouvé : {e}")