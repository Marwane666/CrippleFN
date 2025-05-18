"""
Dépendances pour l'authentification et l'autorisation dans l'API.
"""

from fastapi import Depends, HTTPException, Header, status
from typing import Dict, Any, Optional

from services.supabase_service import SupabaseService

# Instance du service Supabase
supabase_service = SupabaseService()

async def get_current_user(authorization: str = Header(None)) -> Dict[str, Any]:
    """
    Vérifie le JWT dans l'en-tête Authorization et retourne les informations utilisateur.
    
    Args:
        authorization: En-tête Authorization (Bearer token)
        
    Returns:
        Informations de l'utilisateur
        
    Raises:
        HTTPException: Si le token est invalide ou manquant
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token d'authentification manquant",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        # Format attendu: "Bearer <token>"
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Schéma d'authentification invalide",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Vérifier le JWT
        user_info = supabase_service.verify_jwt(token)
        return user_info
    
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"}
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Erreur d'authentification: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"}
        )

async def get_service_role_client():
    """
    Retourne un client Supabase avec les privilèges service_role.
    À utiliser pour les opérations internes qui nécessitent des droits élevés.
    """
    return supabase_service.get_client_for_role("service_role")

async def get_service_token():
    """
    Génère un token JWT avec les privilèges service_role.
    À utiliser pour les opérations internes qui nécessitent des droits élevés.
    
    Returns:
        JWT token avec privilèges service_role
    """
    # Utiliser un ID spécial pour le service
    service_id = "service-role-system"
    return supabase_service.generate_jwt(service_id, role="service_role", expires_in=3600)

async def get_auth_client(user_info: Dict[str, Any] = Depends(get_current_user)):
    """
    Retourne un client Supabase avec le rôle approprié basé sur l'utilisateur authentifié.
    
    Args:
        user_info: Informations de l'utilisateur authentifié
        
    Returns:
        Client Supabase approprié
    """
    role = user_info.get("role", "authenticated")
    return supabase_service.get_client_for_role(role)
