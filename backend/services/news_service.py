"""
Service pour gérer les publications (news) et leur traçabilité sur la blockchain.
"""

import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

from backend.models.news import (
    NewsCreateRequest, NewsStepValidationRequest, NewsResponse, NewsStatus, NewsStep
)

# In-memory DB for demo (replace with real DB in prod)
_FAKE_DB: Dict[str, Dict[str, Any]] = {}

class NewsService:
    def create_news(self, data: NewsCreateRequest) -> NewsResponse:
        news_id = str(uuid.uuid4())
        news = {
            "news_id": news_id,
            "title": data.title,
            "content": data.content,
            "author": data.author,
            "status": NewsStatus.PENDING,
            "steps": [],
            "blockchain_tx": None
        }
        _FAKE_DB[news_id] = news
        return NewsResponse(**news)

    def get_news(self, news_id: str) -> Optional[NewsResponse]:
        news = _FAKE_DB.get(news_id)
        if news:
            return NewsResponse(**news)
        return None

    def list_news(self) -> List[NewsResponse]:
        return [NewsResponse(**n) for n in _FAKE_DB.values()]

    def validate_step(self, data: NewsStepValidationRequest) -> NewsResponse:
        news = _FAKE_DB.get(data.news_id)
        if not news:
            raise ValueError("News not found")
        step_record = {
            "step": data.step,
            "validator": data.validator,
            "result": data.result,
            "timestamp": datetime.utcnow().isoformat()
        }
        news["steps"].append(step_record)
        # If last step, mark as VERIFIED and simulate blockchain tx
        if data.step == NewsStep.AUTHOR_QUESTION:
            news["status"] = NewsStatus.VERIFIED
            news["blockchain_tx"] = f"tx_{uuid.uuid4().hex[:10]}"
        _FAKE_DB[data.news_id] = news
        return NewsResponse(**news)