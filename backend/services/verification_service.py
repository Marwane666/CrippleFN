"""
Service pour gérer les vérifications de contenu.
"""

from typing import Dict, Any, List, Optional
import os
import uuid
import json
from datetime import datetime
from fastapi import UploadFile

from backend.services.agent_service import AgentService
from backend.services.supabase_service import SupabaseService
from backend.models.verification import VerificationStatus

class VerificationService:
    """Service pour gérer les vérifications de contenu."""
    
    def __init__(self):
        """Initialise le service avec les dépendances nécessaires."""
        self.agent_service = AgentService()
        self.supabase = SupabaseService()
    
    async def create_verification(
        self, 
        text: Optional[str] = None,
        urls: Optional[List[str]] = None,
        files: Optional[List[UploadFile]] = None
    ) -> str:
        """
        Crée une nouvelle demande de vérification.
        
        Args:
            text: Le texte à vérifier
            urls: Liste d'URLs à vérifier
            files: Fichiers multimédia à analyser
            
        Returns:
            Identifiant unique de la vérification
        """
        # Générer un identifiant unique
        verification_id = str(uuid.uuid4())
        
        # Créer l'objet de vérification
        verification = {
            "id": verification_id,
            "status": VerificationStatus.PENDING.value,
            "created_at": datetime.utcnow().isoformat(),
            "text": text,
            "urls": urls,
            "file_paths": []
        }
        
        # Traiter les fichiers s'ils sont fournis
        if files:
            upload_dir = f"/tmp/verifications/{verification_id}"
            os.makedirs(upload_dir, exist_ok=True)
            
            for file in files:
                file_path = f"{upload_dir}/{file.filename}"
                with open(file_path, "wb") as buffer:
                    buffer.write(await file.read())
                verification["file_paths"].append(file_path)
        
        # Enregistrer la vérification dans la base de données
        await self.supabase.create_verification(verification)
        
        # Lancer l'analyse en arrière-plan
        # Dans un environnement de production, cela serait fait via une file d'attente
        # comme Celery, RabbitMQ, Redis Queue, etc.
        # Pour cette implémentation, nous simplifions
        self._process_verification(verification_id)
        
        return verification_id
    
    async def get_verification(self, verification_id: str) -> Dict[str, Any]:
        """
        Récupère les détails d'une vérification par son ID.
        
        Args:
            verification_id: Identifiant unique de la vérification
            
        Returns:
            Détails complets de la vérification
        """
        return await self.supabase.get_verification(verification_id)
    
    async def list_verifications(
        self,
        limit: int = 10,
        offset: int = 0,
        status: Optional[VerificationStatus] = None
    ) -> List[Dict[str, Any]]:
        """
        Liste les vérifications avec pagination et filtrage.
        
        Args:
            limit: Nombre maximum de résultats
            offset: Nombre de résultats à sauter
            status: Filtre par statut
            
        Returns:
            Liste des vérifications correspondant aux critères
        """
        return await self.supabase.list_verifications(
            limit=limit,
            offset=offset,
            status=status.value if status else None
        )
    
    async def delete_verification(self, verification_id: str) -> bool:
        """
        Supprime une vérification et ses fichiers associés.
        
        Args:
            verification_id: Identifiant unique de la vérification
            
        Returns:
            True si la suppression a réussi, False sinon
        """
        # Récupérer la vérification pour avoir les chemins des fichiers
        verification = await self.get_verification(verification_id)
        if not verification:
            return False
        
        # Supprimer les fichiers associés
        if "file_paths" in verification and verification["file_paths"]:
            for file_path in verification["file_paths"]:
                if os.path.exists(file_path):
                    os.remove(file_path)
            
            # Supprimer le dossier de la vérification
            upload_dir = f"/tmp/verifications/{verification_id}"
            if os.path.exists(upload_dir):
                os.rmdir(upload_dir)
        
        # Supprimer l'entrée de la base de données
        return await self.supabase.delete_verification(verification_id)
    
    async def _process_verification(self, verification_id: str) -> None:
        """
        Traite une vérification en appelant les agents appropriés.
        
        Args:
            verification_id: Identifiant unique de la vérification
        """
        try:
            # Mettre à jour le statut pour indiquer que le traitement commence
            await self.supabase.update_verification_status(
                verification_id, 
                VerificationStatus.PROCESSING.value
            )
            
            # Récupérer les détails de la vérification
            verification = await self.get_verification(verification_id)
            
            # Préparer le contenu à analyser
            content = {
                "text": verification.get("text"),
                "sources": verification.get("urls", []),
                "images": verification.get("file_paths", [])
            }
            
            # Effectuer l'analyse contextuelle complète
            result = await self.agent_service.analyze_context(content)
            
            # Mettre à jour la vérification avec les résultats
            await self.supabase.update_verification(
                verification_id,
                {
                    "status": VerificationStatus.COMPLETED.value,
                    "completed_at": datetime.utcnow().isoformat(),
                    "result": result
                }
            )
        except Exception as e:
            # En cas d'erreur, mettre à jour le statut à "failed"
            await self.supabase.update_verification(
                verification_id,
                {
                    "status": VerificationStatus.FAILED.value,
                    "error": str(e)
                }
            )
