"""
Service pour gérer les publications (news) et leur traçabilité sur la blockchain.
"""

import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

from backend.models.news import (
    NewsCreateRequest, NewsStepValidationRequest, NewsResponse,
    NewsStatus, NewsStep, NewsStepDetail
)

# Step sequence enforcement
VALID_STEPS_ORDER = [
    NewsStep.AI_ANALYSIS,
    NewsStep.COMMUNITY_ANALYSIS,
    NewsStep.PERSON_QUESTION,
    NewsStep.AUTHOR_QUESTION
]

# Role permissions mapping
STEP_REQUIRED_ROLES = {
    NewsStep.AI_ANALYSIS: ["ai"],
    NewsStep.COMMUNITY_ANALYSIS: ["community"],
    NewsStep.PERSON_QUESTION: ["moderator"],
    NewsStep.AUTHOR_QUESTION: ["moderator"]
}

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

    def validate_step(
        self,
        data: NewsStepValidationRequest,
        validator: str,
        validator_role: str
    ) -> NewsResponse:
        news = _FAKE_DB.get(data.news_id)
        if not news:
            raise ValueError("News not found")

        # Step 1: Validate step order
        current_steps = news["steps"]
        if current_steps:
            last_step = current_steps[-1].step if isinstance(current_steps[-1], NewsStepDetail) else current_steps[-1]["step"]
            expected_next_step = VALID_STEPS_ORDER[VALID_STEPS_ORDER.index(last_step) + 1]
            if data.step != expected_next_step:
                raise ValueError(f"Invalid step order. Expected {expected_next_step}")
        else:
            if data.step != NewsStep.AI_ANALYSIS:
                raise ValueError("First step must be AI analysis")

        required_roles = STEP_REQUIRED_ROLES.get(data.step, [])
        if validator_role not in required_roles:
            raise ValueError(f"Role {validator_role} cannot validate {data.step}")

        tx_hash = f"tx_{uuid.uuid4().hex[:10]}"  # Replace with real blockchain call

        step_detail = NewsStepDetail(
            step=data.step,
            validator=validator,
            result=data.result,
            timestamp=datetime.utcnow().isoformat(),
            blockchain_tx=tx_hash
        )

        news["steps"].append(step_detail)

        if data.step == NewsStep.AUTHOR_QUESTION:
            news["status"] = NewsStatus.VERIFIED

        _FAKE_DB[data.news_id] = news
        return NewsResponse(**news)