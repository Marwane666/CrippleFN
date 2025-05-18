"""
Modèles Pydantic pour les agents IA.
"""

from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AIVerdict(str, Enum):
    TRUE = "true"
    FAKE = "fake"
    UNCERTAIN = "uncertain"

class AIAnalysisRequest(BaseModel):
    content: str  # Contenu de la news à analyser

class AIAnalysisResponse(BaseModel):
    verdict: AIVerdict
    confidence: float  # Score de confiance entre 0 et 1
    explanation: str   # Explication textuelle
    model_version: str = "v1-simulated"

class AnalysisType(str, Enum):
    """Types d'analyse possibles pour l'agent de texte."""
    FACT_CHECKING = "fact_checking"
    SENTIMENT = "sentiment"
    BIAS = "bias"
    HATE_SPEECH = "hate_speech"
    FAKE_NEWS = "fake_news"

class DetectionType(str, Enum):
    """Types de détection possibles pour l'agent visuel."""
    ALL = "all"
    DEEPFAKE = "deepfake"
    OBJECTS = "objects"
    MANIPULATIONS = "manipulations"
    SCENES = "scenes"

class TextAnalysisRequest(BaseModel):
    """Modèle pour une demande d'analyse de texte."""
    text: str
    analysis_type: AnalysisType = AnalysisType.FACT_CHECKING
    
    class Config:
        schema_extra = {
            "example": {
                "text": "Ceci est un texte à analyser pour détecter des fake news.",
                "analysis_type": "fact_checking"
            }
        }

class VisualAnalysisRequest(BaseModel):
    """Modèle pour une demande d'analyse visuelle."""
    file_path: str
    detection_type: DetectionType = DetectionType.ALL
    
    class Config:
        schema_extra = {
            "example": {
                "file_path": "/tmp/uploaded_image.jpg",
                "detection_type": "deepfake"
            }
        }

class ContextAnalysisRequest(BaseModel):
    """Modèle pour une demande d'analyse contextuelle."""
    text: Optional[str] = None
    urls: Optional[List[str]] = None
    images: Optional[List[str]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "text": "Ceci est un texte à analyser dans un contexte plus large.",
                "urls": ["https://example.com/article1"],
                "images": ["/tmp/image1.jpg", "/tmp/image2.jpg"]
            }
        }

class AnalysisResponse(BaseModel):
    """Modèle pour la réponse à une demande d'analyse."""
    success: bool
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    
    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "result": {
                    "verified": True,
                    "confidence": 0.85,
                    "explanation": "Explication des résultats de l'analyse"
                },
                "error": None
            }
        }
