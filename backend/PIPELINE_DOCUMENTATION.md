# Documentation du Pipeline de Vérification de News

## Architecture du Pipeline L1 → L2 → L3

Le pipeline de vérification d'actualités (news) implémente une approche en trois niveaux, permettant une vérification
progressive et adaptative des informations. Cette architecture permet de consacrer plus de ressources aux contenus
qui nécessitent une analyse approfondie, tout en traitant rapidement les cas simples.

### Niveau 1 (L1) : Filtrage Rapide

Le premier niveau fonctionne comme un filtre rapide qui permet d'identifier les contenus nécessitant
une vérification plus approfondie.

- **Agent principal** : `KeywordFilterAgent`
- **Rôle** : Analyser le texte pour détecter des mots-clés et des patterns pouvant indiquer une information trompeuse ou controversée
- **Caractéristiques** :
  - Temps d'exécution rapide (< 10 secondes)
  - Ne nécessite pas de recherche externe
  - Évaluation basée sur des listes de mots-clés, patterns linguistiques, et heuristiques
- **Résultat** : Décision de faire passer le contenu aux niveaux suivants

### Niveau 2 (L2) : Analyse Approfondie

Le deuxième niveau effectue une analyse factuelle et sémantique approfondie.

- **Agents impliqués** :
  - `EvidenceRetrievalAgent` : Recherche de preuves et sources pertinentes
  - `SemanticAnalysisAgent` : Analyse sémantique du texte et comparaison avec les preuves
  - `FactCheckerAgent` : Vérification factuelle des affirmations identifiées
- **Rôle** : Analyser le contenu en profondeur et le comparer à des sources fiables
- **Caractéristiques** :
  - Recherche dans des bases de données de sources fiables
  - Extraction et vérification d'affirmations spécifiques
  - Analyse de la similarité sémantique entre le texte et les sources
- **Résultat** : Évaluation de la véracité avec des scores de confiance

### Niveau 3 (L3) : Débat et Méta-analyse

Le troisième niveau est activé pour les cas ambigus ou complexes, impliquant une forme de délibération.

- **Agents impliqués** :
  - `DebatePlannerAgent` : Organise le débat et identifie les points focaux
  - `ProDebateAgent` : Génère des arguments en faveur de la véracité de l'information
  - `ConDebateAgent` : Génère des arguments contre la véracité de l'information
  - `GraphAnalysisAgent` : Analyse la structure et la force des arguments
  - `MetaAnalysisAgent` : Synthétise toutes les analyses pour produire un verdict final
- **Rôle** : Examiner les cas ambigus à travers un débat argumenté
- **Caractéristiques** :
  - Approche délibérative
  - Analyse d'arguments contradictoires
  - Prise en compte de nuances et d'incertitudes
- **Résultat** : Verdict final et rapport détaillé

## Flux de Données

1. Une requête de vérification est créée via l'API
2. L'agent L1 (KeywordFilter) évalue rapidement le contenu
   - Si le contenu n'est pas suspect, un verdict LIKELY_TRUE peut être directement émis
   - Sinon, le processus continue vers L2
3. Les agents L2 récupèrent des preuves et analysent factuellement le contenu
4. Le système évalue si L3 est nécessaire en fonction de l'ambiguïté des résultats L2
5. Si L3 est activé, un débat est organisé entre agents pro et con
6. Le MetaAnalysisAgent produit un verdict final en intégrant toutes les analyses
7. Les résultats sont stockés et rendus disponibles via l'API

## Modèles de Données

- `NewsRequest` : Demande de vérification d'une actualité
- `AgentLog` : Journal d'exécution des agents
- `Verdict` : Verdict final sur la véracité de l'information
- `TrustedSource` : Source fiable utilisée pour la vérification
- `CacheEntry` : Entrée de cache pour optimiser les vérifications répétées

## Endpoints API

### Vérification Générale

- `POST /verification/` : Crée une vérification générale
- `GET /verification/{verification_id}` : Récupère les résultats d'une vérification
- `GET /verification/` : Liste les vérifications
- `DELETE /verification/{verification_id}` : Supprime une vérification

### Pipeline de Vérification

- `POST /verification/pipeline` : Crée une vérification avec le pipeline L1→L2→L3
- `GET /verification/pipeline/{request_id}` : Récupère les résultats d'un pipeline
- `GET /verification/logs/{request_id}` : Récupère les logs d'exécution des agents

### Actualités

- `POST /news/verify` : Soumet une actualité pour vérification
- `GET /news/verify/{request_id}` : Récupère le statut d'une vérification d'actualité
- `GET /news/verified` : Liste les actualités vérifiées
- `GET /news/trending` : Récupère les actualités tendance
- `GET /news/statistics` : Récupère des statistiques sur les vérifications

## Types de Verdict

- `TRUE` : Information vérifiée comme vraie
- `LIKELY_TRUE` : Information probablement vraie
- `UNCERTAIN` : Information au statut incertain
- `LIKELY_FALSE` : Information probablement fausse
- `FALSE` : Information vérifiée comme fausse
