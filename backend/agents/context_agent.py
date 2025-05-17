"""
Module d'agent IA pour l'analyse contextuelle.
Combine les résultats des autres agents et ajoute une analyse du contexte et des sources.
"""

import os
from typing import Dict, Any, List, Optional
import json

# Importations hypothétiques des autres agents
from .text_agent import TextAgent
from .visual_agent import VisualAgent

class ContextAgent:
    """Agent pour l'analyse contextuelle et la validation des sources."""
    
    def __init__(self):
        """Initialise l'agent contextuel et ses sous-agents."""
        self.text_agent = TextAgent()
        self.visual_agent = VisualAgent()
        
        # Base de connaissances pour vérifier des sources (simulée)
        self._sources_db = {
            # Structure simplifiée pour l'exemple
            "reliable_domains": ["bbc.com", "reuters.com", "afp.com"],
            "unreliable_domains": ["fake-news.com", "conspiracy-daily.org"],
            "neutral_domains": ["blog-platform.com", "social-media.net"]
        }
    
    async def analyze_content(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyse un contenu complet qui peut contenir du texte et des éléments visuels.
        
        Args:
            content: Dictionnaire contenant les différentes parties du contenu à analyser
                (texte, URLs d'images, références, etc.)
            
        Returns:
            Résultat complet de l'analyse contextuelle
        """
        results = {
            "text_analysis": None,
            "visual_analysis": None,
            "source_analysis": None,
            "context_score": None,
            "overall_reliability": None
        }
        
        # Analyse du texte si présent
        if "text" in content and content["text"]:
            results["text_analysis"] = await self.text_agent.analyze_text(
                content["text"], 
                analysis_type="fact_checking"
            )
        
        # Analyse des images si présentes
        if "images" in content and content["images"]:
            # Supposons que content["images"] est une liste de chemins d'images
            image_results = []
            for img_path in content["images"]:
                analysis = await self.visual_agent.analyze_image(img_path)
                image_results.append(analysis)
            
            results["visual_analysis"] = image_results
        
        # Analyse des sources si présentes
        if "sources" in content and content["sources"]:
            results["source_analysis"] = await self._analyze_sources(content["sources"])
        
        # Calcul du score contextuel global
        results["context_score"] = await self._calculate_context_score(results)
        
        # Évaluation globale de fiabilité
        results["overall_reliability"] = self._evaluate_overall_reliability(results)
        
        return results
    
    async def _analyze_sources(self, sources: List[str]) -> Dict[str, Any]:
        """
        Analyse les sources fournies pour déterminer leur fiabilité.
        
        Args:
            sources: Liste des URLs ou références à analyser
            
        Returns:
            Résultats de l'analyse des sources
        """
        results = {
            "reliable_count": 0,
            "unreliable_count": 0,
            "neutral_count": 0,
            "unknown_count": 0,
            "source_details": []
        }
        
        for source in sources:
            source_type = "unknown"
            
            # Analyse simple du domaine (dans un cas réel, ce serait plus sophistiqué)
            for domain in self._sources_db["reliable_domains"]:
                if domain in source:
                    source_type = "reliable"
                    results["reliable_count"] += 1
                    break
                    
            if source_type == "unknown":
                for domain in self._sources_db["unreliable_domains"]:
                    if domain in source:
                        source_type = "unreliable"
                        results["unreliable_count"] += 1
                        break
            
            if source_type == "unknown":
                for domain in self._sources_db["neutral_domains"]:
                    if domain in source:
                        source_type = "neutral"
                        results["neutral_count"] += 1
                        break
            
            if source_type == "unknown":
                results["unknown_count"] += 1
            
            results["source_details"].append({
                "source": source,
                "type": source_type,
                "verification_method": "domain_lookup"  # simplifié pour l'exemple
            })
        
        return results
    
    async def _calculate_context_score(self, results: Dict[str, Any]) -> float:
        """
        Calcule un score contextuel basé sur les différentes analyses.
        
        Args:
            results: Les résultats des différentes analyses
            
        Returns:
            Score contextuel entre 0 et 1
        """
        # Calcul simplifié pour l'exemple
        score = 0.5  # Score de base neutre
        
        # Contribution de l'analyse de texte
        if results["text_analysis"]:
            # Supposons que text_analysis contient un champ "confidence"
            text_confidence = results["text_analysis"].get("confidence", 0.5)
            score = score * 0.5 + text_confidence * 0.5
        
        # Contribution de l'analyse des sources
        if results["source_analysis"]:
            source_analysis = results["source_analysis"]
            total_sources = sum([
                source_analysis["reliable_count"],
                source_analysis["unreliable_count"],
                source_analysis["neutral_count"],
                source_analysis["unknown_count"]
            ])
            
            if total_sources > 0:
                reliability_score = (
                    source_analysis["reliable_count"] * 1.0 +
                    source_analysis["neutral_count"] * 0.5
                ) / total_sources
                
                score = score * 0.7 + reliability_score * 0.3
        
        return round(score, 2)
    
    def _evaluate_overall_reliability(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Évalue la fiabilité globale du contenu analysé.
        
        Args:
            results: Les résultats des différentes analyses
            
        Returns:
            Évaluation de la fiabilité
        """
        context_score = results["context_score"]
        
        if context_score >= 0.8:
            reliability = "high"
            explanation = "Le contenu est très probablement fiable."
        elif context_score >= 0.6:
            reliability = "medium"
            explanation = "Le contenu présente un niveau de fiabilité acceptable."
        elif context_score >= 0.4:
            reliability = "uncertain"
            explanation = "La fiabilité du contenu est incertaine."
        else:
            reliability = "low"
            explanation = "Le contenu présente de sérieux problèmes de fiabilité."
        
        return {
            "reliability": reliability,
            "score": context_score,
            "explanation": explanation,
            "confidence": min(context_score + 0.1, 1.0)  # Confiance légèrement supérieure au score
        }
