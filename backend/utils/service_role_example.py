"""
Exemple d'utilisation du service role et de JWT pour des opérations privilégiées.
Ce fichier démontre comment utiliser le service role pour effectuer des opérations
qui nécessitent des privilèges administrateur, comme la gestion des utilisateurs
ou l'accès à des tables protégées.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List

from services.supabase_service import SupabaseService
from api.dependencies.auth import get_current_user, get_service_role_client, get_service_token

# Instance du service Supabase
supabase_service = SupabaseService()

async def perform_admin_operation(operation_type: str = "read") -> Dict[str, Any]:
    """
    Exemple de fonction qui effectue une opération administrative
    nécessitant des privilèges service_role.
    
    Args:
        operation_type: Type d'opération (read, write, delete, etc.)
        
    Returns:
        Résultat de l'opération
    """
    # Obtenir un client avec privilèges service_role
    service_client = await get_service_role_client()
    
    # Obtenir un token service_role si nécessaire
    service_token = await get_service_token()
    
    # Effectuer l'opération administrative
    if operation_type == "read":
        # Exemple: lire des données dans une table protégée
        try:
            # Lire tous les utilisateurs (opération admin)
            users = service_client.auth.admin.list_users()
            result = {
                "success": True,
                "operation": "read",
                "users_count": len(users.users) if hasattr(users, "users") else 0,
                "token": service_token
            }
        except Exception as e:
            result = {
                "success": False,
                "operation": "read",
                "error": str(e)
            }
    elif operation_type == "write":
        # Exemple: écrire des données dans une table protégée
        try:
            # Pour l'exemple, on écrit simplement dans une table fictive
            # En production, utilisez une vraie table et de vraies données
            data = {
                "id": "admin-entry",
                "created_at": "now()",
                "status": "active"
            }
            
            # Insérer dans une table qui nécessite service_role
            # result = service_client.from_("admin_logs").insert(data).execute()
            
            result = {
                "success": True,
                "operation": "write",
                "data": data,
                "token": service_token
            }
        except Exception as e:
            result = {
                "success": False,
                "operation": "write",
                "error": str(e)
            }
    else:
        result = {
            "success": False,
            "operation": operation_type,
            "error": "Opération non supportée"
        }
        
    return result

# Exemple d'utilisation dans un callback ou une tâche de fond
async def background_admin_task(user_ids: List[str] = None):
    """
    Tâche administrative exécutée en arrière-plan.
    Cette fonction montre comment utiliser le service_role
    pour des opérations de fond qui nécessitent des privilèges élevés.
    
    Args:
        user_ids: Liste d'IDs utilisateurs à traiter
    """
    # Obtenir un client avec privilèges service_role
    service_client = await get_service_role_client()
    
    try:
        # Opérations privilégiées
        results = []
        user_ids = user_ids or []
        
        for user_id in user_ids:
            # Exemple: mettre à jour des attributs utilisateur en admin
            # En production, utilisez la vraie API Supabase
            # user_data = service_client.auth.admin.update_user_by_id(
            #    user_id, {"user_metadata": {"verified": True}}
            # )
            
            results.append({
                "user_id": user_id,
                "status": "processed" 
            })
            
        return {
            "success": True,
            "processed": len(results),
            "results": results
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# Utilisation avec JWT pour authentifier les services internes
async def authenticate_internal_service(service_name: str) -> Dict[str, Any]:
    """
    Authentifie un service interne et retourne un token JWT.
    
    Args:
        service_name: Nom du service interne
        
    Returns:
        Token JWT pour le service
    """
    service_id = f"internal-service-{service_name}"
    
    # Générer un JWT avec privilèges service_role
    token = supabase_service.generate_jwt(service_id, role="service_role", expires_in=3600)
    
    return {
        "service": service_name,
        "token": token,
        "expires_in": 3600,
        "role": "service_role"
    }
