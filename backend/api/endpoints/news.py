"""
Routes API pour la gestion des publications (news) et leur traçabilité.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List

from backend.models.news import (
    NewsCreateRequest, NewsStepValidationRequest, NewsResponse, NewsListResponse
)
from backend.services.news_service import NewsService

router = APIRouter(
    prefix="/news",
    tags=["news"],
    responses={500: {"description": "Erreur interne du serveur"}},
)

oauth2_scheme =  HTTPBearer() 

# Mock authentication (replace with real implementation)
# In backend/api/endpoints/news.py
# In backend/api/endpoints/news.py
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
):
    token = credentials.credentials
    if token == "fake_ai_token":
        return {"username": "ai_system", "role": "ai"}
    elif token == "fake_community_token":
        return {"username": "community_user", "role": "community"}
    elif token == "fake_moderator_token":
        return {"username": "moderator_jane", "role": "moderator"}
    raise HTTPException(401, "Invalid token")


def get_news_service():
    return NewsService()

@router.get("/{news_id}", response_model=NewsResponse)
def get_news(
    news_id: str,
    service: NewsService = Depends(get_news_service)
):
    news = service.get_news(news_id)
    if not news:
        raise HTTPException(status_code=404, detail="News not found")
    return news

@router.get("/", response_model=NewsListResponse)
def list_news(
    service: NewsService = Depends(get_news_service)
):
    return {"news": service.list_news()}

@router.post("/validate-step", response_model=NewsResponse)
async def validate_step(
    request: NewsStepValidationRequest,
    current_user: dict = Depends(get_current_user),
    service: NewsService = Depends(get_news_service)
):
    return await service.validate_step(
        request,
        validator=current_user["username"],
        validator_role=current_user["role"],
    )

    
    # Inside news.py
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Mocked user roles based on token"""
    if token == "fake_ai_token":
        return {"username": "ai_system", "role": "ai"}
    elif token == "fake_community_token":
        return {"username": "community_user", "role": "community"}
    elif token == "fake_moderator_token":
        return {"username": "moderator_john", "role": "moderator"}
    else:
        raise HTTPException(status_code=401, detail="Invalid token")