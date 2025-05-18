"""
Service pour interagir avec la base de données Supabase.
"""

import os
import jwt
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta
import uuid

# Importation du client Supabase
from supabase import create_client, Client

class SupabaseService:
    """Service pour interagir avec Supabase."""
    
    def __init__(self):
        """Initialise le service avec la configuration Supabase."""
        load_dotenv()
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")  # Clé anon/public
        self.service_role_key = os.getenv("SUPABASE_SERVICE_KEY")  # Clé service_role
        self.jwt_secret = os.getenv("SUPABASE_JWT_SECRET")  # Secret JWT
        
        # Initialisation du client Supabase standard (avec clé anon)
        self.supabase: Client = create_client(self.supabase_url, self.supabase_key)
        
        # Initialisation du client Supabase avec service role (si disponible)
        if self.service_role_key:
            self.supabase_admin: Client = create_client(self.supabase_url, self.service_role_key)
        else:
            self.supabase_admin = self.supabase  # Fallback sur le client standard
        
        # Pour les tests ou si Supabase n'est pas configuré, utiliser le stockage en mémoire
        self._news_requests = {}
        self._agent_logs = {}
        self._verdicts = {}
        self._trusted_sources = {}
        self._cache = {}
        self._verifications = {}
      # Méthodes pour la gestion des news_requests
    
    async def create_news_request(self, text: str, extra_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Crée une nouvelle demande de vérification de news.
        
        Args:
            text: Texte de la news à vérifier
            extra_data: Données supplémentaires à associer à la demande
            
        Returns:
            Données de la demande créée
        """
        # Création d'un ID unique
        request_id = str(uuid.uuid4())
        
        # Timestamp actuel
        now = datetime.now().isoformat()
        
        # Création de l'objet news_request
        news_request = {
            "id": request_id,
            "text": text,
            "status": "pending",
            "created_at": now,
            "updated_at": now
        }
        
        # Dans une implémentation réelle avec Supabase:
        # response = self.supabase.table('news_requests').insert(news_request).execute()
        # return response.data[0] if response.data else None
        
        # Simulation de l'insertion
        self._news_requests[request_id] = news_request
        return news_request
    
    async def get_news_request(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupère une demande de vérification par son ID.
        
        Args:
            request_id: ID de la demande
            
        Returns:
            Données de la demande ou None si non trouvée
        """
        # Dans une implémentation réelle avec Supabase:
        # response = self.supabase.table('news_requests').select('*').eq('id', request_id).execute()
        # return response.data[0] if response.data else None
        
        # Simulation de la récupération
        return self._news_requests.get(request_id)
    
    async def update_news_request_status(self, request_id: str, status: str) -> Optional[Dict[str, Any]]:
        """
        Met à jour le statut d'une demande de vérification.
        
        Args:
            request_id: ID de la demande
            status: Nouveau statut
            
        Returns:
            Données mises à jour ou None si non trouvée
        """
        # Vérifier si la demande existe
        request = await self.get_news_request(request_id)
        if not request:
            return None
        
        # Mise à jour du statut et de la date de mise à jour
        request["status"] = status
        request["updated_at"] = datetime.now().isoformat()
        
        # Dans une implémentation réelle avec Supabase:
        # response = self.supabase.table('news_requests').update({"status": status, "updated_at": now}).eq('id', request_id).execute()
        # return response.data[0] if response.data else None
        
        # Simulation de la mise à jour
        self._news_requests[request_id] = request
        return request
    
    async def update_news_request(self, request_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Met à jour les données d'une demande de vérification.
        
        Args:
            request_id: ID de la demande
            data: Données à mettre à jour
            
        Returns:
            Données mises à jour ou None si non trouvée
        """
        # Vérifier si la demande existe
        request = await self.get_news_request(request_id)
        if not request:
            return None
        
        # Mettre à jour les données
        for key, value in data.items():
            request[key] = value
        
        # Mise à jour de la date de mise à jour
        request["updated_at"] = datetime.now().isoformat()
        
        # Dans une implémentation réelle avec Supabase:
        # response = self.supabase.table('news_requests').update(data).eq('id', request_id).execute()
        # return response.data[0] if response.data else None
        
        # Simulation de la mise à jour
        self._news_requests[request_id] = request
        return request
    
    # Méthodes pour la gestion des agent_logs
    
    async def create_agent_log(self, request_id: str, agent_name: str, agent_level: str, 
                              input_data: Dict[str, Any], output_data: Dict[str, Any], 
                              processing_time: float) -> Dict[str, Any]:
        """
        Crée un nouveau log d'agent.
        
        Args:
            request_id: ID de la demande associée
            agent_name: Nom de l'agent
            agent_level: Niveau de l'agent (L1, L2, L3)
            input_data: Données d'entrée de l'agent
            output_data: Données de sortie de l'agent
            processing_time: Temps de traitement en secondes
            
        Returns:
            Données du log créé
        """
        # Création d'un ID unique
        log_id = str(uuid.uuid4())
        
        # Création de l'objet agent_log
        agent_log = {
            "id": log_id,
            "request_id": request_id,
            "agent_name": agent_name,
            "agent_level": agent_level,
            "input": input_data,
            "output": output_data,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat()
        }
        
        # Simulation de l'insertion
        if request_id not in self._agent_logs:
            self._agent_logs[request_id] = []
        self._agent_logs[request_id].append(agent_log)
        
        return agent_log
    
    async def get_agent_logs(self, request_id: str) -> List[Dict[str, Any]]:
        """
        Récupère tous les logs d'agent pour une demande.
        
        Args:
            request_id: ID de la demande
            
        Returns:
            Liste des logs d'agent
        """
        # Simulation de la récupération
        return self._agent_logs.get(request_id, [])
    
    # Méthodes pour la gestion des verdicts
    
    async def create_verdict(self, request_id: str, verdict: str, confidence: float, 
                            report: Dict[str, Any], evidence: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Crée un nouveau verdict.
        
        Args:
            request_id: ID de la demande associée
            verdict: Type de verdict
            confidence: Score de confiance
            report: Rapport détaillé
            evidence: Preuves utilisées
            
        Returns:
            Données du verdict créé
        """
        # Création d'un ID unique
        verdict_id = str(uuid.uuid4())
        
        # Création de l'objet verdict
        verdict_obj = {
            "id": verdict_id,
            "request_id": request_id,
            "verdict": verdict,
            "confidence": confidence,
            "report": report,
            "evidence": evidence,
            "timestamp": datetime.now().isoformat()
        }
        
        # Simulation de l'insertion
        self._verdicts[request_id] = verdict_obj
        
        # Mettre à jour le statut de la demande
        await self.update_news_request_status(request_id, "done")
        
        return verdict_obj
    
    async def get_verdict(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupère le verdict pour une demande.
        
        Args:
            request_id: ID de la demande
            
        Returns:
            Données du verdict ou None si non trouvé
        """
        # Simulation de la récupération
        return self._verdicts.get(request_id)
    
    async def get_all_verdicts(self) -> List[Dict[str, Any]]:
        """
        Récupère tous les verdicts.
        
        Returns:
            Liste de tous les verdicts
        """
        # Dans une implémentation réelle, on ferait une requête avec les filtres appropriés
        
        # Pour la simulation, retourner tous les verdicts
        return list(self._verdicts.values())
    
    # Méthodes pour la gestion des sources fiables
    
    async def search_trusted_sources(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Recherche des sources fiables correspondant à une requête.
        
        Args:
            query: Texte de la requête
            limit: Nombre maximum de résultats
            
        Returns:
            Liste des sources trouvées
        """
        # Dans une implémentation réelle, cela ferait une recherche full-text
        # Sur Supabase, cela utiliserait probablement pgvector ou une recherche textuelle
        
        # Pour la simulation, retourner des sources factices
        results = []
        for i in range(min(limit, 3)):  # Limiter à 3 sources factices max
            source_id = f"source_{hash(query + str(i)) % 1000}"
            results.append({
                "id": source_id,
                "source_type": "article",
                "content": f"Contenu factice pour '{query[:20]}...' (source {i+1})",
                "url": f"https://example.com/source/{source_id}",
                "reliability_score": 0.7 + (i * 0.1),
                "tags": ["news", "factcheck"]
            })
        
        return results
    
    # Méthodes pour la gestion du cache
    
    async def get_cache(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Récupère une valeur du cache.
        
        Args:
            key: Clé de cache
            
        Returns:
            Valeur mise en cache ou None si non trouvée ou expirée
        """
        if key not in self._cache:
            return None
        
        cache_entry = self._cache[key]
        expiry = datetime.fromisoformat(cache_entry["expiry"])
        
        # Vérifier si l'entrée est expirée
        if datetime.now() > expiry:
            # Supprimer l'entrée expirée
            del self._cache[key]
            return None
        
        return cache_entry["value"]
    
    async def set_cache(self, key: str, value: Dict[str, Any], ttl_seconds: int = 3600) -> bool:
        """
        Stocke une valeur dans le cache.
        
        Args:
            key: Clé de cache
            value: Valeur à mettre en cache
            ttl_seconds: Durée de vie en secondes
            
        Returns:
            True si le stockage a réussi
        """
        now = datetime.now()
        expiry = now + timedelta(seconds=ttl_seconds)
        
        cache_entry = {
            "key": key,
            "value": value,
            "expiry": expiry.isoformat(),
            "created_at": now.isoformat()
        }
        
        # Simulation de l'insertion dans le cache
        self._cache[key] = cache_entry
        
        return True
    
    # Méthodes existantes pour les verifications (à conserver pour compatibilité)
    
    async def create_verification(self, verification: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crée une nouvelle vérification dans la base de données.
        
        Args:
            verification: Données de la vérification à créer
            
        Returns:
            Données de la vérification créée
        """
        # Simulation de l'insertion
        verification_id = verification["id"]
        self._verifications[verification_id] = verification
        return verification
    
    async def get_verification(self, verification_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupère une vérification par son ID.
        
        Args:
            verification_id: ID de la vérification
            
        Returns:
            Données de la vérification ou None si non trouvée
        """
        # Simulation de la récupération
        return self._verifications.get(verification_id)
    
    async def update_verification(self, verification_id: str, updates: Dict[str, Any]) -> bool:
        """
        Met à jour une vérification existante.
        
        Args:
            verification_id: ID unique de la vérification
            updates: Mises à jour à appliquer
            
        Returns:
            True si la mise à jour a réussi, False sinon
        """
        # Dans une implémentation réelle avec Supabase:
        # response = self.supabase.table('verifications').update(updates).eq('id', verification_id).execute()
        # return bool(response.data)
        
        # Simulation de la mise à jour
        if verification_id in self._verifications:
            self._verifications[verification_id].update(updates)
            return True
        return False
    
    async def update_verification_status(self, verification_id: str, status: str) -> bool:
        """
        Met à jour uniquement le statut d'une vérification.
        
        Args:
            verification_id: ID unique de la vérification
            status: Nouveau statut
            
        Returns:
            True si la mise à jour a réussi, False sinon
        """
        return await self.update_verification(verification_id, {"status": status})
    
    async def list_verifications(
        self,
        limit: int = 10,
        offset: int = 0,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Liste les vérifications avec pagination et filtrage.
        
        Args:
            limit: Nombre maximum de résultats
            offset: Nombre de résultats à sauter
            status: Filtre par statut
            
        Returns:
            Liste des vérifications correspondant aux critères
        """
        # Dans une implémentation réelle avec Supabase:
        # query = self.supabase.table('verifications').select('*')
        # if status:
        #     query = query.eq('status', status)
        # response = query.order('created_at', desc=True).range(offset, offset + limit - 1).execute()
        # return response.data
        
        # Simulation de la liste avec filtrage et pagination
        result = list(self._verifications.values())
        
        # Filtrer par statut si spécifié
        if status:
            result = [v for v in result if v.get("status") == status]
        
        # Trier par date de création décroissante (du plus récent au plus ancien)
        result.sort(key=lambda v: v.get("created_at", ""), reverse=True)
        
        # Appliquer la pagination
        return result[offset:offset + limit]
    
    async def delete_verification(self, verification_id: str) -> bool:
        """
        Supprime une vérification par son ID.
        
        Args:
            verification_id: ID unique de la vérification
            
        Returns:
            True si la suppression a réussi, False sinon
        """
        # Dans une implémentation réelle avec Supabase:
        # response = self.supabase.table('verifications').delete().eq('id', verification_id).execute()
        # return bool(response.data)
        
        # Simulation de la suppression
        if verification_id in self._verifications:
            del self._verifications[verification_id]
            return True
        return False
    
    # Nouvelles méthodes pour gérer les résultats du pipeline de vérification
    
    async def save_pipeline_results(self, request_id: str, results: Dict[str, Any]) -> bool:
        """
        Sauvegarde les résultats détaillés d'un pipeline de vérification.
        
        Args:
            request_id: ID de la demande
            results: Résultats complets du pipeline
            
        Returns:
            True si sauvegardé avec succès
        """
        # Simplifier les résultats pour le stockage (supprimer les objets trop volumineux)
        simplified_results = {}
        
        for agent_key, agent_result in results.items():
            if isinstance(agent_result, dict):
                simplified_results[agent_key] = {
                    "success": agent_result.get("success", False),
                    "processing_time": agent_result.get("processing_time", 0),
                    "result_summary": self._summarize_result(agent_result.get("result", {}))
                }
        
        # Simulation de l'insertion dans une table pipeline_results
        self._cache[f"pipeline_results_{request_id}"] = {
            "id": str(uuid.uuid4()),
            "request_id": request_id,
            "results": simplified_results,
            "timestamp": datetime.now().isoformat()
        }
        
        return True

    async def get_pipeline_results(self, request_id: str) -> Optional[Dict[str, Any]]:
        """
        Récupère les résultats détaillés d'un pipeline de vérification.
        
        Args:
            request_id: ID de la demande
            
        Returns:
            Résultats du pipeline ou None si non trouvé
        """
        # Simulation de la récupération
        return self._cache.get(f"pipeline_results_{request_id}")

    def _summarize_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crée un résumé simplifié d'un résultat d'agent pour le stockage.
        
        Args:
            result: Résultat complet de l'agent
            
        Returns:
            Version simplifiée du résultat
        """
        if not result or not isinstance(result, dict):
            return {}
        
        # Créer une copie pour ne pas modifier l'original
        summary = {}
        
        # Récupérer les champs clés sans les données volumineuses
        for key, value in result.items():
            # Ignorer les listes longues et les objets complexes
            if isinstance(value, list) and len(value) > 5:
                summary[key] = f"{len(value)} éléments"
            elif isinstance(value, dict) and len(value) > 10:
                summary[key] = f"Objet avec {len(value)} attributs"
            # Limiter la taille des chaînes
            elif isinstance(value, str) and len(value) > 200:
                summary[key] = value[:200] + "..."
            else:
                summary[key] = value
        
        return summary

    async def list_verified_news(self, limit: int = 10, offset: int = 0, verdict_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Liste les actualités vérifiées avec pagination et filtrage par verdict.
        
        Args:
            limit: Nombre maximum de résultats
            offset: Nombre de résultats à sauter
            verdict_type: Type de verdict pour filtrer
            
        Returns:
            Liste des actualités vérifiées
        """
        # Dans une implémentation réelle, on ferait une jointure entre news_requests et verdicts
        # et on appliquerait le filtrage, la pagination, etc.
        
        # Pour la simulation, récupérer toutes les demandes avec un verdict
        results = []
        
        # Parcourir toutes les vérifications qui ont un verdict
        for request_id, verdict in self._verdicts.items():
            if request_id in self._news_requests:
                news_request = self._news_requests[request_id]
                
                # Appliquer le filtre de verdict si spécifié
                if verdict_type and verdict["verdict"] != verdict_type:
                    continue
                
                # Créer l'objet combiné
                verified_news = {
                    "id": request_id,
                    "text": news_request.get("text", ""),
                    "status": news_request.get("status", ""),
                    "created_at": news_request.get("created_at", ""),
                    "updated_at": news_request.get("updated_at", ""),
                    "verdict": verdict.get("verdict", ""),
                    "confidence": verdict.get("confidence", 0),
                    "summary": verdict.get("report", "")[:200] + "..." if len(verdict.get("report", "")) > 200 else verdict.get("report", "")
                }
                
                results.append(verified_news)
    
    # Méthodes pour l'authentification JWT
    def generate_jwt(self, user_id: str, role: str = "authenticated", expires_in: int = 3600) -> str:
        """
        Génère un JWT pour un utilisateur.
        
        Args:
            user_id: ID de l'utilisateur
            role: Rôle de l'utilisateur (authenticated, service_role, anon)
            expires_in: Délai d'expiration en secondes
            
        Returns:
            Token JWT généré
        """
        if not self.jwt_secret:
            raise ValueError("JWT secret is not configured")
        
        payload = {
            "sub": user_id,
            "role": role,
            "exp": datetime.utcnow() + timedelta(seconds=expires_in),
            "iat": datetime.utcnow(),
            "iss": "cripplefn-backend",
            "aud": "cripplefn-api"
        }
        
        return jwt.encode(payload, self.jwt_secret, algorithm="HS256")
    def verify_jwt(self, token: str) -> Dict[str, Any]:
        """
        Vérifie un JWT et retourne les informations contenues.
        
        Args:
            token: Token JWT à vérifier
            
        Returns:
            Informations contenues dans le token
        """
        if not self.jwt_secret:
            raise ValueError("JWT secret is not configured")
        
        try:
            return jwt.decode(token, self.jwt_secret, algorithms=["HS256"], 
                              options={"verify_aud": True}, audience="cripplefn-api")
        except jwt.PyJWTError as e:
            raise ValueError(f"Invalid JWT: {str(e)}")
    def get_client_for_role(self, role: str = "authenticated") -> Client:
        """
        Retourne le client Supabase approprié selon le rôle demandé.
        
        Args:
            role: Rôle demandé (authenticated, service_role, anon)
            
        Returns:
            Client Supabase approprié
        """
        if role == "service_role" and self.service_role_key:
            return self.supabase_admin
        elif role == "anon":
            return create_client(self.supabase_url, self.supabase_key)
        return self.supabase
