"""
Modèles Pydantic pour les vérifications.
"""

from enum import Enum
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime

class VerificationStatus(str, Enum):
    """Statuts possibles d'une vérification."""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class VerificationRequest(BaseModel):
    """Modèle pour une demande de vérification."""
    text: Optional[str] = None
    urls: Optional[List[str]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "text": "Ceci est un texte à vérifier pour détecter d'éventuelles fake news.",
                "urls": ["https://example.com/article1", "https://example.com/image2"]
            }
        }

class VerificationResponse(BaseModel):
    """Modèle pour la réponse à une demande de vérification."""
    id: str
    status: VerificationStatus
    created_at: datetime
    message: str
    
    class Config:
        schema_extra = {
            "example": {
                "id": "abc123",
                "status": "pending",
                "created_at": "2025-05-17T12:34:56",
                "message": "Vérification en cours"
            }
        }

class VerificationResult(BaseModel):
    """Modèle pour les résultats complets d'une vérification."""
    id: str
    status: VerificationStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    text_analysis: Optional[Dict[str, Any]] = None
    visual_analysis: Optional[Dict[str, Any]] = None
    context_analysis: Optional[Dict[str, Any]] = None
    overall_reliability: Optional[Dict[str, Any]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "id": "abc123",
                "status": "completed",
                "created_at": "2025-05-17T12:34:56",
                "completed_at": "2025-05-17T12:35:30",
                "text_analysis": {
                    "verified": True,
                    "confidence": 0.85
                },
                "visual_analysis": {
                    "is_deepfake": False,
                    "confidence": 0.92
                },
                "context_analysis": {
                    "source_reliability": "high",
                    "context_score": 0.78
                },
                "overall_reliability": {
                    "reliability": "high",
                    "score": 0.88,
                    "explanation": "Le contenu est très probablement fiable."
                }
            }
        }
