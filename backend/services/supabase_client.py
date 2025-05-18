# filepath: /Users/guillaume_deramchi/Documents/GitHub/CrippleFN/backend/services/supabase_client.py
# backend/services/supabase_client.py

import os
from pathlib import Path
from dotenv import load_dotenv, find_dotenv
import httpx

# 1) Charger explicitement le .env à la racine
dotenv_path = find_dotenv(usecwd=True)
if not dotenv_path:
    raise RuntimeError("❌ Impossible de trouver le fichier .env")
load_dotenv(dotenv_path, override=True)

# 2) Récupérer les variables
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Utilise la clé de service

# 3) Validation
if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("❌ SUPABASE_URL et/ou SUPABASE_SERVICE_KEY manquant")

def insert(table: str, data: dict) -> dict:
    """
    Insère \`data\` dans \`table\` via l'API REST de Supabase.
    Utilise les en-têtes appropriés pour l'authentification Supabase.
    """
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    # Combinaison correcte des en-têtes pour l'authentification Supabase
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,  # L'en-tête apikey est nécessaire pour l'API Supabase
        "Prefer": "return=representation"  # Demander à Supabase de retourner l'enregistrement créé
    }
    try:
        response = httpx.post(url, json=data, headers=headers)
        # Lève une erreur si code != 2xx
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as e:
        status_code = e.response.status_code
        error_detail = e.response.text
        print(f"Erreur HTTP {status_code}: {error_detail}")
        if status_code == 401:
            print("ERREUR D'AUTHENTIFICATION: Vérifiez la clé API Supabase dans .env")
        elif status_code == 404:
            print(f"ERREUR: La table '{table}' n'existe peut-être pas dans votre projet Supabase")
        raise
