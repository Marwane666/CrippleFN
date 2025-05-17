"""
Routes API pour la gestion des publications (news) et leur traçabilité.
"""

from fastapi import APIRouter, HTTPException, Depends
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

def get_news_service():
    return NewsService()

@router.post("/", response_model=NewsResponse)
def create_news(
    request: NewsCreateRequest,
    service: NewsService = Depends(get_news_service)
):
    return service.create_news(request)

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
def validate_step(
    request: NewsStepValidationRequest,
    service: NewsService = Depends(get_news_service)
):
    try:
        return service.validate_step(request)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))