"""
Modèles Pydantic pour les agents IA.
"""

from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

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

# Nouveaux modèles pour le pipeline L1-L2-L3

class AgentType(str, Enum):
    """Types d'agents dans le pipeline de vérification."""
    KEYWORD_FILTER = "keyword_filter"
    EVIDENCE_RETRIEVAL = "evidence_retrieval"
    SEMANTIC_ANALYSIS = "semantic_analysis"
    FACT_CHECKER = "fact_checker"
    DEBATE_PLANNER = "debate_planner"
    DEBATE_AGENT_PRO = "debate_agent_pro"
    DEBATE_AGENT_CON = "debate_agent_con"
    GRAPH_ANALYSIS = "graph_analysis"
    META_ANALYSIS = "meta_analysis"

class KeywordFilterRequest(BaseModel):
    """Requête pour l'agent de filtrage par mots-clés (L1)."""
    text: str
    keywords: Optional[List[str]] = None
    threshold: float = 0.5
    
    class Config:
        schema_extra = {
            "example": {
                "text": "Ceci est une news à vérifier",
                "keywords": ["urgent", "exclusif", "choc"],
                "threshold": 0.5
            }
        }

class KeywordFilterResponse(BaseModel):
    """Réponse de l'agent de filtrage par mots-clés (L1)."""
    suspicious: bool
    score: float
    matched_keywords: List[str]
    proceed_to_l2: bool
    
    class Config:
        schema_extra = {
            "example": {
                "suspicious": True,
                "score": 0.75,
                "matched_keywords": ["urgent", "exclusif"],
                "proceed_to_l2": True
            }
        }

class EvidenceRetrievalRequest(BaseModel):
    """Requête pour l'agent de récupération de preuves (L2)."""
    text: str
    max_sources: int = 5
    
    class Config:
        schema_extra = {
            "example": {
                "text": "Ceci est une affirmation à vérifier",
                "max_sources": 3
            }
        }

class EvidenceRetrievalResponse(BaseModel):
    """Réponse de l'agent de récupération de preuves (L2)."""
    sources_found: int
    sources: List[Dict[str, Any]]
    relevance_score: float
    
    class Config:
        schema_extra = {
            "example": {
                "sources_found": 2,
                "sources": [
                    {"id": "source1", "content": "Texte de la source", "relevance": 0.85},
                    {"id": "source2", "content": "Autre texte", "relevance": 0.72}
                ],
                "relevance_score": 0.78
            }
        }

class SemanticAnalysisRequest(BaseModel):
    """Requête pour l'agent d'analyse sémantique (L2)."""
    text: str
    evidence: List[Dict[str, Any]]
    
    class Config:
        schema_extra = {
            "example": {
                "text": "Ceci est une affirmation à vérifier",
                "evidence": [
                    {"id": "source1", "content": "Texte de la source"},
                    {"id": "source2", "content": "Autre texte"}
                ]
            }
        }

class SemanticAnalysisResponse(BaseModel):
    """Réponse de l'agent d'analyse sémantique (L2)."""
    similarity_score: float
    contradictions: List[Dict[str, Any]]
    supports: List[Dict[str, Any]]
    
    class Config:
        schema_extra = {
            "example": {
                "similarity_score": 0.65,
                "contradictions": [
                    {"claim": "X est Y", "evidence": "X n'est pas Y", "confidence": 0.82}
                ],
                "supports": [
                    {"claim": "A est B", "evidence": "A est effectivement B", "confidence": 0.91}
                ]
            }
        }

class FactCheckerRequest(BaseModel):
    """Requête pour l'agent de vérification de faits (L2)."""
    text: str
    claims: List[str]
    evidence: List[Dict[str, Any]]
    
    class Config:
        schema_extra = {
            "example": {
                "text": "Texte complet contenant des affirmations",
                "claims": ["Affirmation 1", "Affirmation 2"],
                "evidence": [
                    {"id": "source1", "content": "Texte de preuve"}
                ]
            }
        }

class FactCheckerResponse(BaseModel):
    """Réponse de l'agent de vérification de faits (L2)."""
    verified_claims: List[Dict[str, Any]]
    overall_accuracy: float
    
    class Config:
        schema_extra = {
            "example": {
                "verified_claims": [
                    {"claim": "Affirmation 1", "verdict": "true", "confidence": 0.88},
                    {"claim": "Affirmation 2", "verdict": "false", "confidence": 0.75}
                ],
                "overall_accuracy": 0.45
            }
        }

class DebatePlannerRequest(BaseModel):
    """Requête pour l'agent de planification de débat (L3)."""
    l2_results: Dict[str, Any]
    threshold_for_debate: float = 0.6
    
    class Config:
        schema_extra = {
            "example": {
                "l2_results": {
                    "semantic_analysis": {"similarity_score": 0.65},
                    "fact_checker": {"overall_accuracy": 0.45}
                },
                "threshold_for_debate": 0.5
            }
        }

class DebatePlannerResponse(BaseModel):
    """Réponse de l'agent de planification de débat (L3)."""
    initiate_debate: bool
    focus_points: List[str]
    reasoning: str
    
    class Config:
        schema_extra = {
            "example": {
                "initiate_debate": True,
                "focus_points": ["Point contentieux 1", "Point contentieux 2"],
                "reasoning": "Explication de la décision d'initier un débat"
            }
        }

class DebateAgentRequest(BaseModel):
    """Requête pour les agents de débat (L3)."""
    topic: str
    focus_points: List[str]
    stance: str  # "pro" ou "con"
    previous_arguments: Optional[List[Dict[str, Any]]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "topic": "Affirmation à débattre",
                "focus_points": ["Point 1", "Point 2"],
                "stance": "pro",
                "previous_arguments": [
                    {"stance": "con", "argument": "Argument contre précédent"}
                ]
            }
        }

class DebateAgentResponse(BaseModel):
    """Réponse des agents de débat (L3)."""
    arguments: List[Dict[str, Any]]
    sources: List[Dict[str, Any]]
    
    class Config:
        schema_extra = {
            "example": {
                "arguments": [
                    {"point": "Point 1", "argument": "Argument en faveur", "strength": 0.85},
                    {"point": "Point 2", "argument": "Autre argument", "strength": 0.75}
                ],
                "sources": [
                    {"id": "source1", "relevance": 0.8}
                ]
            }
        }

class GraphAnalysisRequest(BaseModel):
    """Requête pour l'agent d'analyse de graphe (L3)."""
    debate_results: List[Dict[str, Any]]
    
    class Config:
        schema_extra = {
            "example": {
                "debate_results": [
                    {"stance": "pro", "arguments": []},
                    {"stance": "con", "arguments": []}
                ]
            }
        }

class GraphAnalysisResponse(BaseModel):
    """Réponse de l'agent d'analyse de graphe (L3)."""
    graph_data: Dict[str, Any]
    strongest_arguments: Dict[str, List[Dict[str, Any]]]
    argument_scores: Dict[str, float]
    
    class Config:
        schema_extra = {
            "example": {
                "graph_data": {"nodes": [], "edges": []},
                "strongest_arguments": {
                    "pro": [{"argument": "Arg1", "score": 0.9}],
                    "con": [{"argument": "Arg2", "score": 0.85}]
                },
                "argument_scores": {"pro": 0.75, "con": 0.65}
            }
        }

class MetaAnalysisRequest(BaseModel):
    """Requête pour l'agent d'analyse méta (L3)."""
    l1_results: Optional[Dict[str, Any]] = None
    l2_results: Dict[str, Any]
    l3_results: Optional[Dict[str, Any]] = None
    
    class Config:
        schema_extra = {
            "example": {
                "l1_results": {"suspicious": True, "score": 0.75},
                "l2_results": {
                    "evidence_retrieval": {"relevance_score": 0.78},
                    "semantic_analysis": {"similarity_score": 0.65},
                    "fact_checker": {"overall_accuracy": 0.45}
                },
                "l3_results": {
                    "graph_analysis": {"argument_scores": {"pro": 0.75, "con": 0.65}}
                }
            }
        }

class MetaAnalysisResponse(BaseModel):
    """Réponse de l'agent d'analyse méta (L3)."""
    verdict: str  # Utilise VerdictType de tables.py
    confidence: float
    explanation: str
    evidence_summary: List[Dict[str, Any]]
    
    class Config:
        schema_extra = {
            "example": {
                "verdict": "likely_false",
                "confidence": 0.82,
                "explanation": "Explication détaillée du verdict",
                "evidence_summary": [
                    {"type": "contradiction", "description": "Description", "weight": 0.9}
                ]
            }
        }

# Modèles originaux

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
