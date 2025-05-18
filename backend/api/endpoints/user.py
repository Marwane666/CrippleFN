"""
Routes API pour la gestion des utilisateurs et l'authentification.
"""

from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.responses import JSONResponse
from typing import Dict, Any
from pydantic import BaseModel, Field

from services.supabase_service import SupabaseService
from api.dependencies.auth import get_current_user, get_service_role_client, get_auth_client, get_service_token

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    responses={401: {"description": "Non autorisé"}},
)

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    confirm_password: str
    first_name: str = Field(None)
    last_name: str = Field(None)

# Instance du service Supabase
supabase_service = SupabaseService()

@router.post("/register", response_model=Dict[str, Any])
async def register(
    request: RegisterRequest = Body(...),
):
    """
    Enregistre un nouvel utilisateur.
    
    - **email**: Email de l'utilisateur
    - **password**: Mot de passe
    - **confirm_password**: Confirmation du mot de passe
    - **first_name**: Prénom (optionnel)
    - **last_name**: Nom (optionnel)
    """
    try:
        # Vérifier que les mots de passe correspondent
        if request.password != request.confirm_password:
            raise HTTPException(status_code=400, detail="Les mots de passe ne correspondent pas")
        
        # Créer l'utilisateur avec le client service_role
        service_client = await get_service_role_client()
        
        response = service_client.auth.sign_up({
            "email": request.email,
            "password": request.password,
            "options": {
                "data": {
                    "first_name": request.first_name,
                    "last_name": request.last_name
                }
            }
        })
        
        # Générer un JWT
        user_id = response.user.id
        token = supabase_service.generate_jwt(user_id)
        
        return {
            "message": "Utilisateur créé avec succès",
            "user": {
                "id": user_id,
                "email": request.email
            },
            "token": token
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de l'enregistrement: {str(e)}")

@router.post("/login", response_model=Dict[str, Any])
async def login(
    request: LoginRequest = Body(...),
):
    """
    Authentifie un utilisateur et retourne un token JWT.
    
    - **email**: Email de l'utilisateur
    - **password**: Mot de passe
    """
    try:
        service_client = await get_service_role_client()
        
        # Authentifier l'utilisateur
        response = service_client.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password
        })
        
        # Générer un JWT
        user_id = response.user.id
        token = supabase_service.generate_jwt(user_id)
        
        return {
            "message": "Authentification réussie",
            "user": {
                "id": user_id,
                "email": response.user.email
            },
            "token": token
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Erreur d'authentification: {str(e)}")

@router.get("/me", response_model=Dict[str, Any])
async def get_user_info(
    user_info: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retourne les informations de l'utilisateur actuellement connecté.
    Nécessite un token JWT valide.
    """
    try:
        user_id = user_info.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalide")
        
        client = await get_auth_client(user_info)
        
        # Récupérer les informations utilisateur
        user_data = client.from_("profiles").select("*").eq("id", user_id).single().execute()
        
        return {
            "id": user_id,
            "role": user_info.get("role", "authenticated"),
            "profile": user_data.data if user_data and hasattr(user_data, "data") else {},
            "iss": user_info.get("iss")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des informations: {str(e)}")

@router.get("/service-role-test", response_model=Dict[str, Any])
async def service_role_test():
    """
    Endpoint de test pour démontrer l'utilisation du service role.
    Génère un token JWT avec privilèges service_role et effectue une opération
    qui nécessite ces privilèges.
    """
    try:
        # Générer un token service_role
        service_token = await get_service_token()
        
        # Utiliser le client avec privilèges service_role
        service_client = await get_service_role_client()
        
        # Exemple d'opération nécessitant un service_role
        # Par exemple, lister tous les utilisateurs (opération admin)
        try:
            users_result = service_client.auth.admin.list_users()
            user_count = len(users_result.users) if hasattr(users_result, "users") else 0
        except Exception as e:
            user_count = f"Erreur: {str(e)}"
        
        return {
            "message": "Test service_role réussi",
            "token": service_token,
            "user_count": user_count,
            "permissions": "service_role"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors du test service_role: {str(e)}")
