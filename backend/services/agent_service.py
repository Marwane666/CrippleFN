"""
Service pour gérer les agents IA et leurs interactions.
"""

from typing import Dict, Any, List, Optional
import os
import uuid
import json

from backend.agents.text_agent import TextAgent
from backend.agents.visual_agent import VisualAgent
from backend.agents.context_agent import ContextAgent

class AgentService:
    """Service pour gérer les interactions avec les agents IA."""
    
    def __init__(self):
        """Initialise le service avec les agents nécessaires."""
        self.text_agent = TextAgent()
        self.visual_agent = VisualAgent()
        self.context_agent = ContextAgent()
    
    async def analyze_text(self, text: str, analysis_type: str) -> Dict[str, Any]:
        """
        Analyse un texte à l'aide de l'agent de texte.
        
        Args:
            text: Le texte à analyser
            analysis_type: Type d'analyse à effectuer
            
        Returns:
            Résultats de l'analyse
        """
        return await self.text_agent.analyze_text(text, analysis_type)
    
    async def analyze_visual(self, file_path: str, detection_type: str) -> Dict[str, Any]:
        """
        Analyse une image ou une vidéo à l'aide de l'agent visuel.
        
        Args:
            file_path: Chemin vers le fichier à analyser
            detection_type: Type de détection à effectuer
            
        Returns:
            Résultats de l'analyse
        """
        # Déterminer si c'est une image ou une vidéo
        _, ext = os.path.splitext(file_path)
        is_video = ext.lower() in ['.mp4', '.avi', '.mov', '.mkv', '.webm']
        
        if is_video:
            return await self.visual_agent.analyze_video(file_path, detection_type)
        else:
            return await self.visual_agent.analyze_image(file_path, detection_type)
    
    async def analyze_context(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Effectue une analyse contextuelle complète sur le contenu fourni.
        
        Args:
            content: Dictionnaire contenant le texte, les URLs et les images à analyser
            
        Returns:
            Résultats complets de l'analyse contextuelle
        """
        return await self.context_agent.analyze_content(content)
