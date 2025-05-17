"""
Modèles Pydantic pour la gestion des publications (news) et leur traçabilité.
"""

from enum import Enum
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class NewsStep(str, Enum):
    AI_ANALYSIS = "ai_analysis"
    COMMUNITY_ANALYSIS = "community_analysis"
    PERSON_QUESTION = "person_question"
    AUTHOR_QUESTION = "author_question"

class NewsStatus(str, Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class NewsStepDetail(BaseModel):
    step: NewsStep
    validator: str
    result: Dict[str, Any]
    timestamp: str
    blockchain_tx: str  # Added for per-step TX

class NewsCreateRequest(BaseModel):
    title: str
    content: str
    author: str

class NewsStepValidationRequest(BaseModel):
    news_id: str
    step: NewsStep
    result: Dict[str, Any]

class NewsResponse(BaseModel):
    news_id: str
    title: str
    content: str
    author: str
    status: NewsStatus
    steps: List[NewsStepDetail]  # Now uses StepDetail model
    blockchain_tx: Optional[str] = None

class NewsListResponse(BaseModel):
    news: List[NewsResponse]