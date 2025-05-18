"""
Routes API pour les agents IA.
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
import os

from models.agents import TextAnalysisRequest, VisualAnalysisRequest, AnalysisResponse
from services.agent_service import AgentService
from api.dependencies.auth import get_current_user, get_service_role_client, get_auth_client

router = APIRouter(
    prefix="/agents",
    tags=["agents"],
    responses={500: {"description": "Erreur interne du serveur"}},
)

# Dépendance pour obtenir le service d'agents
def get_agent_service():
    return AgentService()

@router.post("/text", response_model=AnalysisResponse)
async def analyze_text(
    request: TextAnalysisRequest,
    service: AgentService = Depends(get_agent_service),
    user_info: Dict[str, Any] = Depends(get_current_user)
):
    """
    Analyse un texte à l'aide de l'agent IA de texte.
    Nécessite un token JWT valide.
    
    - **text**: Le texte à analyser
    - **analysis_type**: Type d'analyse à effectuer
    """
    try:
        # Utiliser le client avec le rôle approprié
        supabase_client = await get_auth_client(user_info)
        
        result = await service.analyze_text(
            text=request.text,
            analysis_type=request.analysis_type
        )
        
        return {
            "success": True,
            "result": result,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "result": None,
            "error": str(e)
        }

@router.post("/visual", response_model=AnalysisResponse)
async def analyze_visual(
    file: UploadFile = File(...),
    detection_type: str = Form("all"),
    service: AgentService = Depends(get_agent_service)
):
    """
    Analyse une image ou une vidéo à l'aide de l'agent IA visuel.
    
    - **file**: Le fichier image ou vidéo à analyser
    - **detection_type**: Type de détection à effectuer
    """
    try:
        # Sauvegarder temporairement le fichier
        temp_file_path = f"/tmp/{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            buffer.write(await file.read())
        
        # Analyser le fichier
        result = await service.analyze_visual(
            file_path=temp_file_path,
            detection_type=detection_type
        )
        
        # Nettoyer le fichier temporaire
        os.remove(temp_file_path)
        
        return {
            "success": True,
            "result": result,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "result": None,
            "error": str(e)
        }

@router.post("/context", response_model=AnalysisResponse)
async def analyze_context(
    text: Optional[str] = Form(None),
    urls: Optional[str] = Form(None),
    files: List[UploadFile] = File(None),
    service: AgentService = Depends(get_agent_service)
):
    """
    Effectue une analyse contextuelle complète à l'aide de l'agent de contexte.
    
    - **text**: Le texte à analyser
    - **urls**: Liste d'URLs séparées par des virgules à analyser
    - **files**: Fichiers multimédia à analyser (images, vidéos)
    """
    try:
        # Préparer les URLs si fournies
        url_list = urls.split(",") if urls else []
        
        # Préparer le contenu à analyser
        content = {
            "text": text,
            "urls": url_list,
            "images": []
        }
        
        # Traiter les fichiers s'ils sont fournis
        if files:
            for file in files:
                temp_file_path = f"/tmp/{file.filename}"
                with open(temp_file_path, "wb") as buffer:
                    buffer.write(await file.read())
                content["images"].append(temp_file_path)
        
        # Effectuer l'analyse contextuelle
        result = await service.analyze_context(content)
        
        # Nettoyer les fichiers temporaires
        for img_path in content["images"]:
            if os.path.exists(img_path):
                os.remove(img_path)
        
        return {
            "success": True,
            "result": result,
            "error": None
        }
    except Exception as e:
        return {
            "success": False,
            "result": None,
            "error": str(e)
        }
