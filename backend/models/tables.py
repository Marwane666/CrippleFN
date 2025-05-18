"""
Définitions Pydantic pour les tables Supabase.
"""

from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class VerificationStatus(str, Enum):
    """Statuts possibles d'une demande de vérification."""
    PENDING = "pending"
    RUNNING = "running"
    DONE = "done"
    FAILED = "failed"

class VerdictType(str, Enum):
    """Types de verdict possibles."""
    TRUE = "true"
    LIKELY_TRUE = "likely_true"
    UNCERTAIN = "uncertain"
    LIKELY_FALSE = "likely_false"
    FALSE = "false"

class AgentLevel(str, Enum):
    """Niveaux d'agents dans le pipeline de vérification."""
    L1 = "l1"
    L2 = "l2"
    L3 = "l3"

class NewsRequest(BaseModel):
    """Table pour stocker les demandes de vérification."""
    id: str
    text: str
    status: VerificationStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        extra = "allow"  # Permet des champs supplémentaires de métadonnées

class AgentLog(BaseModel):
    """Table pour stocker les logs des agents."""
    id: str
    request_id: str
    agent_name: str
    agent_level: AgentLevel
    input: Dict[str, Any]
    output: Dict[str, Any]
    processing_time: float  # Temps de traitement en secondes
    timestamp: datetime
    
    class Config:
        extra = "allow"

class Verdict(BaseModel):
    """Table pour stocker les verdicts finaux."""
    id: str
    request_id: str
    verdict: VerdictType
    confidence: float  # Score de confiance entre 0 et 1
    report: Dict[str, Any]  # Rapport détaillé
    evidence: Optional[List[Dict[str, Any]]]  # Preuves recueillies
    timestamp: datetime
    
    class Config:
        extra = "allow"

class TrustedSource(BaseModel):
    """Table pour stocker les sources fiables pour la comparaison."""
    id: str
    source_type: str  # article, site, dataset, etc.
    content: Union[str, Dict[str, Any]]  # Contenu ou métadonnées
    url: Optional[str]
    reliability_score: float  # Score de fiabilité entre 0 et 1
    tags: List[str]  # Catégories, thèmes
    created_at: datetime
    updated_at: datetime
    
    class Config:
        extra = "allow"

class CacheEntry(BaseModel):
    """Table pour le cache éphémère."""
    key: str  # Clé de hachage basée sur la requête
    value: Dict[str, Any]  # Données en cache
    expiry: datetime  # Date d'expiration
    created_at: datetime
    
    class Config:
        extra = "allow"