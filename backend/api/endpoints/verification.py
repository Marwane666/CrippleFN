"""
Routes API pour la vérification de contenus.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import os
import json
from datetime import datetime

from models.verification import VerificationRequest, VerificationResponse, VerificationStatus
from services.verification_service import VerificationService

router = APIRouter(
    prefix="/verification",
    tags=["verification"],
    responses={404: {"description": "Vérification non trouvée"}},
)

# Dépendance pour obtenir le service de vérification
def get_verification_service():
    return VerificationService()

@router.post("/", response_model=VerificationResponse)
async def create_verification(
    text: Optional[str] = Form(None),
    urls: Optional[str] = Form(None),
    files: List[UploadFile] = File(None),
    service: VerificationService = Depends(get_verification_service)
):
    """
    Crée une nouvelle demande de vérification pour du contenu (texte, URLs ou fichiers).
    
    - **text**: Le texte à vérifier
    - **urls**: Liste d'URLs séparées par des virgules à vérifier
    - **files**: Fichiers multimédia à analyser (images, vidéos)
    """
    try:
        # Préparer les URLs si fournies
        url_list = urls.split(",") if urls else []
        
        # Créer la demande de vérification
        verification_id = await service.create_verification(
            text=text,
            urls=url_list,
            files=files
        )
        
        return {
            "id": verification_id,
            "status": VerificationStatus.PENDING,
            "created_at": datetime.utcnow(),
            "message": "Demande de vérification créée avec succès"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la création de la vérification: {str(e)}")

@router.get("/{verification_id}", response_model=Dict[str, Any])
async def get_verification(
    verification_id: str,
    service: VerificationService = Depends(get_verification_service)
):
    """
    Récupère les résultats d'une vérification par son ID.
    
    - **verification_id**: L'identifiant unique de la vérification
    """
    try:
        verification = await service.get_verification(verification_id)
        if not verification:
            raise HTTPException(status_code=404, detail="Vérification non trouvée")
        
        return verification
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération de la vérification: {str(e)}")

@router.get("/", response_model=List[Dict[str, Any]])
async def list_verifications(
    limit: int = 10,
    offset: int = 0,
    status: Optional[VerificationStatus] = None,
    service: VerificationService = Depends(get_verification_service)
):
    """
    Liste les vérifications avec pagination et filtrage par statut.
    
    - **limit**: Nombre maximum de résultats à retourner
    - **offset**: Nombre de résultats à sauter (pour la pagination)
    - **status**: Filtre par statut (optionnel)
    """
    try:
        verifications = await service.list_verifications(limit, offset, status)
        return verifications
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la récupération des vérifications: {str(e)}")

@router.delete("/{verification_id}", response_model=Dict[str, str])
async def delete_verification(
    verification_id: str,
    service: VerificationService = Depends(get_verification_service)
):
    """
    Supprime une vérification par son ID.
    
    - **verification_id**: L'identifiant unique de la vérification
    """
    try:
        success = await service.delete_verification(verification_id)
        if not success:
            raise HTTPException(status_code=404, detail="Vérification non trouvée")
        
        return {"message": "Vérification supprimée avec succès"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la suppression de la vérification: {str(e)}")
