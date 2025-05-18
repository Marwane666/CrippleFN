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
from backend.services.xrpl_service import XRPLService
from backend.utils.memo import encode_memo
from backend.models.agents import AIAnalysisResponse


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
    def __init__(self):
        self.xrpl = XRPLService()

    # Existing CRUD methods (keep these)
    def create_news(self, data: NewsCreateRequest) -> NewsResponse:
        news_id = str(uuid.uuid4())
        news = {
            "news_id": news_id,
            "title": data.title,
            "content": data.content,
            "author": data.author,
            "status": NewsStatus.PENDING,
            "steps": [],
            "blockchain_tx": None,
            "xrpl_metadata": None
        }
        _FAKE_DB[news_id] = news
        return NewsResponse(**news)

    def get_news(self, news_id: str) -> Optional[NewsResponse]:
        news = _FAKE_DB.get(news_id)
        return NewsResponse(**news) if news else None

    def list_news(self) -> List[NewsResponse]:
        return [NewsResponse(**n) for n in _FAKE_DB.values()]

    async def _record_to_blockchain(self, news_id: str, step: str, result: dict) -> str:
        """Enregistre une étape de validation sur la blockchain XRPL"""
        try:
            memo_data = encode_memo({
                "news_id": news_id,
                "step": step,
                "result": result
            })
            return await self.xrpl.anchor_validation_step(memo_data)
        except Exception as e:
            raise ValueError(f"Erreur blockchain : {str(e)}")

    async def validate_step(
        self,
        data: NewsStepValidationRequest,
        validator: str,
        validator_role: str
    ) -> NewsResponse:
        """Nouvelle version avec intégration blockchain"""
        news = _FAKE_DB.get(data.news_id)
        if not news:
            raise ValueError("Publication introuvable")

        # Validation de l'ordre des étapes
        current_steps = news["steps"]
        if current_steps:
            last_step = current_steps[-1].step if isinstance(current_steps[-1], NewsStepDetail) else current_steps[-1]["step"]
            expected_next_step = VALID_STEPS_ORDER[VALID_STEPS_ORDER.index(last_step) + 1]
            if data.step != expected_next_step:
                raise ValueError(f"Ordre des étapes invalide. Attendu : {expected_next_step}")

        # Vérification des rôles
        required_roles = STEP_REQUIRED_ROLES.get(data.step, [])
        if validator_role not in required_roles:
            raise ValueError(f"Le rôle {validator_role} ne peut pas valider cette étape")

        # Simulation spécifique pour l'IA
        if data.step == NewsStep.AI_ANALYSIS:
            mock_result = AIAnalysisResponse(
                verdict="true",
                confidence=0.92,
                explanation="Simulation: Contenu vérifié avec succès",
            ).dict()
        else:
            # Gestion standard pour les autres étapes
            mock_result = data.result

        # Enregistrement blockchain
        tx_hash = await self._record_to_blockchain(data.news_id, data.step.value, mock_result)
        
        # Mise à jour de la publication
        step_detail = NewsStepDetail(
            step=data.step,
            validator=validator,
            result=mock_result,
            timestamp=datetime.utcnow().isoformat(),
            blockchain_tx=tx_hash
        )
        news["steps"].append(step_detail)

        # Finalisation si dernière étape
        if data.step == NewsStep.AUTHOR_QUESTION:
            news["status"] = NewsStatus.VERIFIED
            news["blockchain_tx"] = tx_hash
            news["xrpl_metadata"] = await self.xrpl.fetch_transaction_metadata(tx_hash)

        _FAKE_DB[data.news_id] = news
        return NewsResponse(**news)