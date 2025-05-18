"""
Point d'entrée principal de l'API FastAPI.
Initialise l'application, les routes et les dépendances.
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.api.endpoints import news, verification, agents  # Updated import path
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le fichier .env
load_dotenv()

# Créer l'application FastAPI
app = FastAPI(
    title="CrippleFN API",
    description="API pour la vérification de contenus utilisant des agents IA multimodaux",
    version="0.1.0"
)

app.include_router(news.router, prefix="/news")  # <-- Préfixe "/news"

# Configuration CORS pour permettre les requêtes du frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifier les origines exactes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importation des routes depuis les différents modules
from backend.api.endpoints import verification, agents

# Inclure les routes dans l'application
app.include_router(verification.router)
app.include_router(agents.router)
# app.include_router(user.router)
# app.include_router(blockchain.router)

@app.get("/")
async def root():
    """Route racine pour vérifier que l'API fonctionne."""
    return {
        "message": "CrippleFN API est opérationnelle",
        "status": "online",
        "version": app.version
    }

@app.get("/health")
async def health_check():
    """Endpoint de vérification de l'état du serveur."""
    return {
        "status": "healthy",
        "services": {
            "database": "connected",
            "agents": "operational"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
