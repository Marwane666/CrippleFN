import os
import asyncio
import aiohttp
import json
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, List, Dict, Type, Optional, Literal, Union
import uuid

from dotenv import load_dotenv
from pydantic import BaseModel, Field
from mistralai import Mistral # Changed from mistralai.client import MistralClient
# Removed: from mistralai.models.chat_completion import ChatMessage
import networkx as nx

# Attempt to import Supabase related models and services
try:
    from models.tables import (
        NewsRequest,
        AgentLog,
        Verdict,
        VerdictType,
        VerificationStatus,
        AgentLevel,
    )
    from services.supabase_service import SupabaseService
except ImportError:
    # Provide dummy classes if imports fail, to allow for partial functionality or testing
    # In a real environment, these imports must succeed.
    print(
        "Warning: Could not import Supabase models or service. Using dummy implementations."
    )
    from enum import Enum # Added for dummy classes

    class VerificationStatus(str, Enum):
        PENDING = "pending"
        RUNNING = "running"
        DONE = "done"
        FAILED = "failed"

    class VerdictType(str, Enum):
        TRUE = "true"
        LIKELY_TRUE = "likely_true"
        UNCERTAIN = "uncertain"
        LIKELY_FALSE = "likely_false"
        FALSE = "false"
        DUBIOUS = "dubious" # Added as per prompt, map to UNCERTAIN if needed

    class AgentLevel(str, Enum):
        L1 = "l1"
        L2 = "l2"
        L3 = "l3"

    class BaseModel: # Dummy
        def model_dump(self, **kwargs): return {}
        def model_dump_json(self, **kwargs): return json.dumps(self.model_dump(**kwargs))


    class NewsRequest(BaseModel):
        id: str
        text: str
        status: VerificationStatus
        created_at: datetime
        updated_at: datetime

    class AgentLog(BaseModel):
        id: str
        request_id: str
        agent_name: str
        agent_level: AgentLevel
        input: Dict[str, Any]
        output: Dict[str, Any]
        processing_time: float
        timestamp: datetime

    class Verdict(BaseModel):
        id: str
        request_id: str
        verdict: VerdictType
        confidence: float
        report: Dict[str, Any]
        evidence: Optional[List[Dict[str, Any]]]
        timestamp: datetime
    
    class SupabaseService: # Dummy
        def __init__(self, supabase_url=None, supabase_key=None): self.supabase = None # Adjusted dummy
        async def create_news_request(self, **kwargs): return {"id": str(uuid.uuid4()), "status": "pending"}
        async def update_news_request_status(self, **kwargs): return True
        async def create_agent_log(self, **kwargs): return True
        async def create_verdict(self, **kwargs): return True
        def get_client(self): return None # Dummy client


# --- Environment Variable Loading ---
load_dotenv()

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY") # This is likely the public key
NEWS_API_KEY = os.getenv("NEWS_API_KEY") # For EvidenceRetrievalAgent

# --- Client Initialization ---
mistral_client = None
if MISTRAL_API_KEY:
    mistral_client = Mistral(api_key=MISTRAL_API_KEY) # Changed from MistralClient
else:
    print("Warning: MISTRAL_API_KEY not found. AI-dependent agents will not work.")

supabase_service_instance = None
if SUPABASE_URL and SUPABASE_ANON_KEY:
    try:
        # Assuming SupabaseService is designed to be instantiated like this
        # Or it might provide static methods or a singleton instance
        supabase_service_instance = SupabaseService()
        # If SupabaseService needs explicit URL and key:
        # supabase_service_instance = SupabaseService(supabase_url=SUPABASE_URL, supabase_key=SUPABASE_ANON_KEY)
        supabase_client = supabase_service_instance.supabase # Get the raw client if needed
    except Exception as e:
        print(f"Warning: Could not initialize SupabaseService: {e}. Using dummy SupabaseService.")
        supabase_service_instance = SupabaseService(SUPABASE_URL, SUPABASE_ANON_KEY) # Dummy
        supabase_client = None
else:
    print("Warning: SUPABASE_URL or SUPABASE_ANON_KEY not found. Supabase interactions will be disabled.")
    supabase_service_instance = SupabaseService(None, None) # Dummy
    supabase_client = None


# --- Pydantic Models for Agent I/O ---

class AgentOutputBase(BaseModel):
    agent_name: str
    error: Optional[str] = None
    raw_response: Optional[Any] = None # For debugging or detailed logging

class KeywordFilterAgentOutput(AgentOutputBase):
    agent_name: str = "KeywordFilterAgent"
    is_suspicious: bool
    keywords_found: List[str] = []

class Reference(BaseModel):
    text: str
    source: str
    url: Optional[str] = None
    retrieved_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class EvidenceRetrievalAgentOutput(AgentOutputBase):
    agent_name: str = "EvidenceRetrievalAgent"
    references: List[Reference] = []

class SemanticAnalysisAgentOutput(AgentOutputBase):
    agent_name: str = "SemanticAnalysisAgent"
    analysis: Optional[str] = None
    confidence: Optional[float] = None # e.g., confidence in the relevance of the analysis

class FactCheckerAgentOutput(AgentOutputBase):
    agent_name: str = "FactCheckerAgent"
    classification: Optional[Literal["true", "false", "unsupported"]] = None
    confidence: Optional[float] = None
    reasoning: Optional[str] = None

class DebatePlannerAgentOutput(AgentOutputBase):
    agent_name: str = "DebatePlannerAgent"
    debate_required: bool = False
    l3_agent_classes_to_invoke: List[str] = [] # Store names of agent classes
    debate_topic: Optional[str] = None
    reasoning: Optional[str] = None

class DebateTurn(BaseModel):
    agent_name: str # "DebateProAgent" or "DebateConAgent"
    role: Literal["pro", "con"]
    round_type: Literal["opening", "rebuttal"]
    round_number: int
    argument: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DebateAgentOutput(AgentOutputBase):
    # agent_name will be "DebateProAgent" or "DebateConAgent"
    turn_details: Optional[DebateTurn] = None

class GraphAnalysisAgentOutput(AgentOutputBase):
    agent_name: str = "GraphAnalysisAgent"
    summary: Optional[str] = None
    graph_representation: Optional[Dict[str, Any]] = None # e.g., nodes and edges for visualization

class MetaAnalysisReport(BaseModel):
    request_id: str
    original_text: str
    final_verdict: VerdictType
    final_confidence: float
    report_summary: str # Overall summary of the findings
    l1_output: Optional[KeywordFilterAgentOutput] = None
    l2_outputs: Dict[str, AgentOutputBase] = {} # e.g., {"EvidenceRetrievalAgent": ..., "SemanticAnalysisAgent": ...}
    debate_log: List[DebateTurn] = []
    l3_outputs: Dict[str, AgentOutputBase] = {} # e.g., {"GraphAnalysisAgent": ...}
    full_agent_outputs_json: str # Store all outputs as a JSON string for the report field in DB


# --- Abstract Agent Class ---
class Agent(ABC):
    """Abstract base class for all agents in the pipeline."""
    agent_name: str
    agent_level: AgentLevel

    def __init__(self, agent_name: str, agent_level: AgentLevel):
        self.agent_name = agent_name
        self.agent_level = agent_level

    @abstractmethod
    async def run(self, **kwargs) -> AgentOutputBase:
        """
        Execute the agent's logic.
        Must be implemented by subclasses.
        """
        pass

    async def _log_run(self, request_id: str, inputs: Dict[str, Any], output: AgentOutputBase, start_time: datetime):
        """Helper to log agent activity to Supabase."""
        if not supabase_service_instance:
            return

        processing_time = (datetime.now(timezone.utc) - start_time).total_seconds()
        log_entry = AgentLog(
            id=str(uuid.uuid4()),
            request_id=request_id,
            agent_name=self.agent_name,
            agent_level=self.agent_level,
            input=inputs,
            # Ensure output is serializable; Pydantic's model_dump is good here
            output=output.model_dump(exclude_none=True) if isinstance(output, BaseModel) else {"data": str(output)},
            processing_time=processing_time,
            timestamp=datetime.now(timezone.utc)
        )
        try:
            await supabase_service_instance.create_agent_log(**log_entry.model_dump())
        except Exception as e:
            print(f"Error logging agent run for {self.agent_name} on request {request_id}: {e}")


# --- Concrete Agent Implementations ---

class KeywordFilterAgent(Agent):
    """L1 Agent: Quickly checks for suspicious keywords."""
    SUSPICIOUS_KEYWORDS = {
        "hoax", "conspiracy", "fake news", "secret plot", "cover-up",
        # Add more domain-specific keywords
    }

    def __init__(self):
        super().__init__(agent_name="KeywordFilterAgent", agent_level=AgentLevel.L1)

    async def run(self, text: str, request_id: str) -> KeywordFilterAgentOutput:
        start_time = datetime.now(timezone.utc)
        inputs = {"text": text}
        found_keywords = [kw for kw in self.SUSPICIOUS_KEYWORDS if kw in text.lower()]
        is_suspicious = bool(found_keywords)
        output = KeywordFilterAgentOutput(is_suspicious=is_suspicious, keywords_found=found_keywords)
        
        await self._log_run(request_id, inputs, output, start_time)
        return output

class EvidenceRetrievalAgent(Agent):
    """L2 Agent: Fetches reference texts from Supabase and a public news API."""
    NEWS_API_URL = "https://newsapi.org/v2/everything" # Example

    def __init__(self):
        super().__init__(agent_name="EvidenceRetrievalAgent", agent_level=AgentLevel.L2)

    async def _fetch_from_news_api(self, query: str, top_n: int) -> List[Reference]:
        if not NEWS_API_KEY:
            print("NEWS_API_KEY not set. Skipping News API.")
            return []
        
        references = []
        params = {"q": query, "apiKey": NEWS_API_KEY, "pageSize": top_n, "language": "en"}
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.NEWS_API_URL, params=params, timeout=10) as response:
                    response.raise_for_status()
                    data = await response.json()
                    for article in data.get("articles", []):
                        references.append(Reference(
                            text=article.get("content") or article.get("description") or article.get("title", "No content"),
                            source=article.get("source", {}).get("name", "NewsAPI"),
                            url=article.get("url")
                        ))
        except Exception as e:
            print(f"Error fetching from News API: {e}")
            # Optionally, capture this error in the agent's output
        return references

    async def _fetch_from_supabase(self, query: str, top_n: int) -> List[Reference]:
        if not supabase_client:
            print("Supabase client not available. Skipping Supabase trusted sources.")
            return []
        
        references = []
        try:
            # This is a simplistic query. Real implementation might use vector search (e.g., pgvector)
            # or full-text search capabilities of PostgreSQL.
            # For now, let's assume a 'trusted_sources' table with 'content' and 'tags' or similar.
            # response = await supabase_client.table("trusted_sources").select("content, url, source_type, tags").text_search("fts_column", query).limit(top_n).execute()
            
            # Placeholder: Simulating a query. Replace with actual Supabase query.
            # For example, if you have a function for semantic search in Supabase:
            # response = await supabase_client.rpc('semantic_search_sources', {'query_embedding': embedding, 'match_threshold': 0.7, 'match_count': top_n}).execute()
            # For now, returning an empty list as a placeholder for Supabase query logic.
            print(f"Placeholder: Supabase query for '{query}' (top {top_n}) would run here.")

        except Exception as e:
            print(f"Error fetching from Supabase trusted_sources: {e}")
        return references


    async def run(self, query: str, request_id: str, top_n: int = 5) -> EvidenceRetrievalAgentOutput:
        start_time = datetime.now(timezone.utc)
        inputs = {"query": query, "top_n": top_n}
        
        api_references_task = self._fetch_from_news_api(query, top_n)
        supabase_references_task = self._fetch_from_supabase(query, top_n)
        
        api_references, supabase_references = await asyncio.gather(
            api_references_task,
            supabase_references_task
        )
        
        all_references = api_references + supabase_references
        # Simple de-duplication based on URL if present, or text
        unique_references = []
        seen_urls = set()
        seen_texts = set()
        for ref in all_references:
            if ref.url and ref.url not in seen_urls:
                unique_references.append(ref)
                seen_urls.add(ref.url)
            elif not ref.url and ref.text not in seen_texts:
                 unique_references.append(ref)
                 seen_texts.add(ref.text)

        output = EvidenceRetrievalAgentOutput(references=unique_references[:top_n])
        await self._log_run(request_id, inputs, output, start_time)
        return output

class SemanticAnalysisAgent(Agent):
    """L2 Agent: Uses Mistral to compare news text against retrieved references."""
    def __init__(self):
        super().__init__(agent_name="SemanticAnalysisAgent", agent_level=AgentLevel.L2)

    async def run(self, text_to_analyze: str, references: List[Reference], request_id: str) -> SemanticAnalysisAgentOutput:
        start_time = datetime.now(timezone.utc)
        inputs = {"text_to_analyze": text_to_analyze, "references": [ref.model_dump() for ref in references]}
        
        if not mistral_client:
            return SemanticAnalysisAgentOutput(error="Mistral client not initialized.")
        if not references:
            return SemanticAnalysisAgentOutput(analysis="No references provided to compare against.")

        reference_texts = "\\n\\n".join([f"Reference from {r.source}:\\n{r.text}" for r in references])
        prompt = f"""
        Analyze the following statement:
        "{text_to_analyze}"

        Compare it against these reference texts:
        {reference_texts}

        Provide a brief analysis of how the statement aligns or contrasts with the references.
        Focus on factual consistency, sentiment, and any notable discrepancies.
        Your analysis should be concise.
        """
        try:
            chat_response = mistral_client.chat.complete( # Changed from mistral_client.chat
                model="mistral-small-latest", # Or another suitable model
                messages=[{"role": "user", "content": prompt}], # Changed from ChatMessage
                temperature=0.3,
            )
            analysis = chat_response.choices[0].message.content
            output = SemanticAnalysisAgentOutput(analysis=analysis, raw_response=chat_response.model_dump())
        except Exception as e:
            print(f"Error in SemanticAnalysisAgent with Mistral API: {e}")
            output = SemanticAnalysisAgentOutput(error=str(e))
            
        await self._log_run(request_id, inputs, output, start_time)
        return output

class FactCheckerAgent(Agent):
    """L2 Agent: Uses Mistral to classify a statement as true, false, or unsupported."""
    def __init__(self):
        super().__init__(agent_name="FactCheckerAgent", agent_level=AgentLevel.L2)

    async def run(self, statement: str, references: List[Reference], request_id: str) -> FactCheckerAgentOutput:
        start_time = datetime.now(timezone.utc)
        inputs = {"statement": statement, "references": [ref.model_dump() for ref in references]}

        if not mistral_client:
            return FactCheckerAgentOutput(error="Mistral client not initialized.")
        if not references:
             return FactCheckerAgentOutput(
                classification="unsupported", 
                confidence=0.5, 
                reasoning="No references provided for fact-checking."
            )

        reference_texts = "\\n\\n".join([f"Reference from {r.source} ({r.url if r.url else 'N/A'}):\\n{r.text}" for r in references])
        prompt = f"""
        You are a fact-checking AI. Based on the provided references, classify the following statement:
        Statement: "{statement}"

        References:
        {reference_texts}

        Your response must be a JSON object with the following fields:
        - "classification": one of "true", "false", or "unsupported".
        - "confidence": a float between 0.0 and 1.0 indicating your confidence in the classification.
        - "reasoning": a brief explanation for your classification.

        Example Response:
        {{
          "classification": "true",
          "confidence": 0.9,
          "reasoning": "The statement aligns with information from multiple reliable sources."
        }}
        """
        try:
            chat_response = mistral_client.chat.complete( # Changed from mistral_client.chat
                model="mistral-large-latest", # Use a capable model for this
                messages=[{"role": "user", "content": prompt}], # Changed from ChatMessage
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            response_content = chat_response.choices[0].message.content
            parsed_response = json.loads(response_content)
            output = FactCheckerAgentOutput(
                classification=parsed_response.get("classification"),
                confidence=parsed_response.get("confidence"),
                reasoning=parsed_response.get("reasoning"),
                raw_response=chat_response.model_dump()
            )
        except Exception as e:
            print(f"Error in FactCheckerAgent with Mistral API or JSON parsing: {e}")
            output = FactCheckerAgentOutput(error=str(e))

        await self._log_run(request_id, inputs, output, start_time)
        return output

class DebatePlannerAgent(Agent):
    """L3 Agent: Decides if a mini-debate is needed based on L2 results."""
    def __init__(self):
        super().__init__(agent_name="DebatePlannerAgent", agent_level=AgentLevel.L3)

    async def run(self, l2_outputs: Dict[str, AgentOutputBase], original_text: str, request_id: str) -> DebatePlannerAgentOutput:
        start_time = datetime.now(timezone.utc)
        inputs = {"l2_outputs": {k: v.model_dump(exclude_none=True) if isinstance(v, BaseModel) else str(v) for k,v in l2_outputs.items()}, "original_text": original_text}

        fact_check_output = l2_outputs.get("FactCheckerAgent")
        semantic_analysis_output = l2_outputs.get("SemanticAnalysisAgent")

        debate_required = False
        reasoning = "L2 results are conclusive."
        l3_agents_to_invoke = []

        if fact_check_output and isinstance(fact_check_output, FactCheckerAgentOutput):
            if fact_check_output.classification == "unsupported" or \
               (fact_check_output.classification in ["true", "false"] and (fact_check_output.confidence or 1.0) < 0.7): # Threshold for debate
                debate_required = True
                reasoning = f"Fact-checking was '{fact_check_output.classification}' with confidence {fact_check_output.confidence}. A debate could clarify."
        elif semantic_analysis_output and isinstance(semantic_analysis_output, SemanticAnalysisAgentOutput):
            # If semantic analysis shows significant conflict or ambiguity
            if semantic_analysis_output.analysis and ("conflict" in semantic_analysis_output.analysis.lower() or "ambiguous" in semantic_analysis_output.analysis.lower()):
                 debate_required = True
                 reasoning = "Semantic analysis suggests conflict or ambiguity. A debate could clarify."
        else: # Default to debate if L2 results are sparse or unclear
            debate_required = True
            reasoning = "L2 results are not sufficiently clear. A debate is recommended."


        if debate_required:
            l3_agents_to_invoke = ["DebateProAgent", "DebateConAgent", "GraphAnalysisAgent"]
        
        output = DebatePlannerAgentOutput(
            debate_required=debate_required,
            l3_agent_classes_to_invoke=l3_agents_to_invoke,
            debate_topic=original_text, # The original text is the topic
            reasoning=reasoning
        )
        await self._log_run(request_id, inputs, output, start_time)
        return output

class BaseDebateParticipantAgent(Agent):
    """Base for Pro/Con debate agents."""
    MAX_ROUNDS = 2 # 1 opening, 1 rebuttal

    def __init__(self, agent_name: str, agent_level: AgentLevel, role: Literal["pro", "con"]):
        super().__init__(agent_name, agent_level)
        self.role = role

    async def run(self, topic: str, debate_history: List[DebateTurn], current_round_number: int, request_id: str) -> DebateAgentOutput:
        start_time = datetime.now(timezone.utc)
        inputs = {
            "topic": topic, 
            "debate_history": [turn.model_dump() for turn in debate_history], 
            "current_round_number": current_round_number,
            "role": self.role
        }

        if not mistral_client:
            return DebateAgentOutput(agent_name=self.agent_name, error="Mistral client not initialized.")

        round_type: Literal["opening", "rebuttal"] = "opening" if current_round_number == 1 else "rebuttal"
        
        history_context = "\n".join([f"{turn.agent_name} ({turn.round_type} {turn.round_number}): {turn.argument}" for turn in debate_history])

        prompt = f"""
        You are participating in a debate on the topic: "{topic}".
        Your role is: {self.role.upper()}.
        This is {round_type} round, number {current_round_number} (out of {self.MAX_ROUNDS} total rounds per participant).

        Debate History So Far:
        {history_context if history_context else "No arguments yet."}

        Instructions for your turn:
        - If this is an opening round, present your main argument supporting your role.
        - If this is a rebuttal round, address the opposing arguments and reinforce your position.
        - Keep your argument concise, focused, and respectful.
        - Do NOT explicitly state your role (e.g., "As a pro debater..."). Just make your argument.

        Your argument:
        """
        try:
            chat_response = mistral_client.chat.complete( # Changed from mistral_client.chat
                model="mistral-medium-latest", # A model good for nuanced arguments
                messages=[{"role": "user", "content": prompt}], # Changed from ChatMessage
                temperature=0.7,
            )
            argument = chat_response.choices[0].message.content.strip()
            
            turn_details = DebateTurn(
                agent_name=self.agent_name,
                role=self.role,
                round_type=round_type,
                round_number=current_round_number,
                argument=argument
            )
            output = DebateAgentOutput(agent_name=self.agent_name, turn_details=turn_details, raw_response=chat_response.model_dump())
        except Exception as e:
            print(f"Error in {self.agent_name} with Mistral API: {e}")
            output = DebateAgentOutput(agent_name=self.agent_name, error=str(e))

        await self._log_run(request_id, inputs, output, start_time)
        return output

class DebateProAgent(BaseDebateParticipantAgent):
    """L3 Agent: Argues in favor of the statement."""
    def __init__(self):
        super().__init__(agent_name="DebateProAgent", agent_level=AgentLevel.L3, role="pro")

class DebateConAgent(BaseDebateParticipantAgent):
    """L3 Agent: Argues against the statement."""
    def __init__(self):
        super().__init__(agent_name="DebateConAgent", agent_level=AgentLevel.L3, role="con")

class GraphAnalysisAgent(Agent):
    """L3 Agent: Builds and summarizes an argument graph from the debate log."""
    def __init__(self):
        super().__init__(agent_name="GraphAnalysisAgent", agent_level=AgentLevel.L3)

    async def run(self, debate_log: List[DebateTurn], debate_topic: str, request_id: str) -> GraphAnalysisAgentOutput:
        start_time = datetime.now(timezone.utc)
        inputs = {"debate_log": [turn.model_dump() for turn in debate_log], "debate_topic": debate_topic}

        if not debate_log:
            return GraphAnalysisAgentOutput(summary="No debate log provided to analyze.")

        graph = nx.DiGraph()
        node_id_counter = 0
        argument_nodes = {} # Map argument text to node_id to link rebuttals

        for i, turn in enumerate(debate_log):
            node_id = f"arg_{i}"
            graph.add_node(node_id, speaker=turn.agent_name, role=turn.role, round_type=turn.round_type, round_num=turn.round_number, text=turn.argument)
            argument_nodes[turn.argument.lower()[:50]] = node_id # Store by a prefix of the argument

            # Simplistic linking: if it's a rebuttal, try to link to previous opposing arguments.
            # More sophisticated NLP would be needed for robust argument linking.
            if turn.round_type == "rebuttal":
                for prev_turn_idx in range(i -1, -1, -1):
                    prev_turn = debate_log[prev_turn_idx]
                    if prev_turn.role != turn.role: # Link to an opponent's argument
                        # This is a very basic heuristic.
                        # A real system might use embeddings or keyword matching to find what is being rebutted.
                        prev_node_id = argument_nodes.get(prev_turn.argument.lower()[:50])
                        if prev_node_id:
                            graph.add_edge(node_id, prev_node_id, type="rebuts") 
                            break # Link to the most recent relevant argument

        graph_data = nx.node_link_data(graph)
        
        # Summarize the graph using Mistral
        summary = "Graph analysis not fully implemented without Mistral summarization."
        if mistral_client:
            graph_description_parts = [f"Topic: {debate_topic}"]
            for turn in debate_log:
                graph_description_parts.append(f"{turn.agent_name} ({turn.role}, {turn.round_type} {turn.round_number}): {turn.argument}")
            
            graph_description = "\n".join(graph_description_parts)
            prompt = f"""
            Analyze the following debate log and its argument structure:
            {graph_description}

            Provide a concise summary of the main lines of argument, key contentions, and the overall flow of the debate.
            Identify if one side presented a more compelling case or if the debate remained unresolved.
            """
            try:
                chat_response = mistral_client.chat.complete( # Changed from mistral_client.chat
                    model="mistral-small-latest",
                    messages=[{"role": "user", "content": prompt}], # Changed from ChatMessage
                    temperature=0.5
                )
                summary = chat_response.choices[0].message.content
            except Exception as e:
                summary = f"Error summarizing graph: {e}"
        
        output = GraphAnalysisAgentOutput(summary=summary, graph_representation=graph_data)
        await self._log_run(request_id, inputs, output, start_time)
        return output

class MetaAnalysisAgent(Agent):
    """L3 Agent: Aggregates all outputs, computes final verdict and confidence."""
    def __init__(self):
        super().__init__(agent_name="MetaAnalysisAgent", agent_level=AgentLevel.L3)

    async def run(self, request_id: str, original_text: str, all_agent_outputs: Dict[str, AgentOutputBase], debate_log: List[DebateTurn], request_start_time: datetime) -> MetaAnalysisReport:
        # Note: request_id is for the original news_request, not this agent's log id.
        # This agent doesn't call _log_run itself, its output becomes the main pipeline result.
        # The pipeline function will log this agent's "run" if needed, or just the final verdict.
        
        l1_output = all_agent_outputs.get("KeywordFilterAgent")
        l2_outputs = {k: v for k, v in all_agent_outputs.items() if isinstance(v, AgentOutputBase) and v.agent_name not in ["KeywordFilterAgent", "DebatePlannerAgent"]}
        l3_outputs_from_all = {k: v for k, v in all_agent_outputs.items() if isinstance(v, AgentOutputBase) and v.agent_name in ["GraphAnalysisAgent"]} # Add other L3s if they have distinct outputs

        # --- Determine Final Verdict and Confidence ---
        final_verdict: VerdictType = VerdictType.UNCERTAIN # Default
        final_confidence: float = 0.5 # Default

        fact_check_out = l2_outputs.get("FactCheckerAgent")
        if fact_check_out and isinstance(fact_check_out, FactCheckerAgentOutput) and fact_check_out.classification:
            if fact_check_out.classification == "true":
                final_verdict = VerdictType.TRUE
            elif fact_check_out.classification == "false":
                final_verdict = VerdictType.FALSE
            else: # unsupported
                final_verdict = VerdictType.UNCERTAIN
            final_confidence = fact_check_out.confidence or 0.5
        
        # Adjust based on debate if it happened
        if debate_log:
            graph_analysis_out = l3_outputs_from_all.get("GraphAnalysisAgent")
            if graph_analysis_out and isinstance(graph_analysis_out, GraphAnalysisAgentOutput) and graph_analysis_out.summary:
                # Heuristic: if graph summary strongly favors one side, adjust confidence or verdict
                summary_lower = graph_analysis_out.summary.lower()
                if "pro side stronger" in summary_lower or "conclusively true" in summary_lower :
                    if final_verdict == VerdictType.UNCERTAIN: final_verdict = VerdictType.TRUE
                    final_confidence = min(1.0, final_confidence + 0.15)
                elif "con side stronger" in summary_lower or "conclusively false" in summary_lower:
                    if final_verdict == VerdictType.UNCERTAIN: final_verdict = VerdictType.FALSE
                    final_confidence = min(1.0, final_confidence + 0.15)
                elif "unresolved" in summary_lower or "balanced debate" in summary_lower:
                    final_confidence = max(0.0, final_confidence - 0.1) # Less certain if debate is balanced but fact-check was initially strong

        # Map "dubious" from prompt to UNCERTAIN
        if final_verdict == VerdictType.DUBIOUS: # Assuming DUBIOUS is in VerdictType from dummy
            final_verdict = VerdictType.UNCERTAIN

        # --- Compile Report Summary ---
        report_summary_parts = [f"Verification report for statement: \"{original_text}\""]
        report_summary_parts.append(f"Final Verdict: {final_verdict.value} (Confidence: {final_confidence:.2f})")
        
        if l1_output and isinstance(l1_output, KeywordFilterAgentOutput) and l1_output.is_suspicious:
            report_summary_parts.append(f"L1 Keyword Filter: Suspicious keywords found: {', '.join(l1_output.keywords_found)}.")
        
        evidence_out = l2_outputs.get("EvidenceRetrievalAgent")
        if evidence_out and isinstance(evidence_out, EvidenceRetrievalAgentOutput) and evidence_out.references:
            report_summary_parts.append(f"L2 Evidence: Retrieved {len(evidence_out.references)} references.")
        
        semantic_out = l2_outputs.get("SemanticAnalysisAgent")
        if semantic_out and isinstance(semantic_out, SemanticAnalysisAgentOutput) and semantic_out.analysis:
            report_summary_parts.append(f"L2 Semantic Analysis: {semantic_out.analysis[:150]}...") # Truncate

        if fact_check_out and isinstance(fact_check_out, FactCheckerAgentOutput) and fact_check_out.classification:
             report_summary_parts.append(f"L2 Fact Check: {fact_check_out.classification} (Conf: {fact_check_out.confidence:.2f}). Reason: {fact_check_out.reasoning}")

        if debate_log:
            report_summary_parts.append(f"L3 Debate: Conducted with {len(debate_log)} turns.")
            graph_out = l3_outputs_from_all.get("GraphAnalysisAgent")
            if graph_out and isinstance(graph_out, GraphAnalysisAgentOutput) and graph_out.summary:
                 report_summary_parts.append(f"L3 Graph Analysis: {graph_out.summary[:150]}...")

        report_summary = "\n".join(report_summary_parts)
        
        # Consolidate all outputs for the full report
        # Using model_dump for Pydantic models to ensure serializability
        all_outputs_serializable = {}
        for agent_name, out_data in all_agent_outputs.items():
            if isinstance(out_data, BaseModel):
                all_outputs_serializable[agent_name] = out_data.model_dump(exclude_none=True)
            else:
                all_outputs_serializable[agent_name] = str(out_data) # Fallback

        full_report_dict = MetaAnalysisReport(
            request_id=request_id,
            original_text=original_text,
            final_verdict=final_verdict,
            final_confidence=final_confidence,
            report_summary=report_summary,
            l1_output=l1_output if isinstance(l1_output, KeywordFilterAgentOutput) else None,
            l2_outputs=l2_outputs,
            debate_log=debate_log,
            l3_outputs=l3_outputs_from_all,
            full_agent_outputs_json=json.dumps(all_outputs_serializable)
        )
        
        # This agent's "output" is the full report.
        # Logging of this agent's execution (if desired) would be handled by the pipeline,
        # as its result is the pipeline's final result.
        return full_report_dict


# --- Agent Registry (for dynamic invocation if needed) ---
AGENT_REGISTRY: Dict[str, Type[Agent]] = {
    "KeywordFilterAgent": KeywordFilterAgent,
    "EvidenceRetrievalAgent": EvidenceRetrievalAgent,
    "SemanticAnalysisAgent": SemanticAnalysisAgent,
    "FactCheckerAgent": FactCheckerAgent,
    "DebatePlannerAgent": DebatePlannerAgent,
    "DebateProAgent": DebateProAgent,
    "DebateConAgent": DebateConAgent,
    "GraphAnalysisAgent": GraphAnalysisAgent,
    "MetaAnalysisAgent": MetaAnalysisAgent,
}


# --- Main Pipeline Function ---
async def run_pipeline(request_id: str, text_to_verify: str) -> Dict[str, Any]:
    """
    Runs the full multi-agent pipeline for verifying a given text.
    """
    pipeline_start_time = datetime.now(timezone.utc)
    all_pipeline_outputs: Dict[str, AgentOutputBase] = {} # Store outputs of all agents
    debate_log_history: List[DebateTurn] = []

    if not supabase_service_instance:
        return {"error": "Supabase service not initialized. Pipeline cannot run."}

    # 1. Persist initial request
    try:
        await supabase_service_instance.create_news_request(
            id=request_id, 
            text=text_to_verify, 
            status=VerificationStatus.PENDING,
            # created_at and updated_at should be handled by SupabaseService or DB
        )
        await supabase_service_instance.update_news_request_status(request_id=request_id, status=VerificationStatus.RUNNING)
    except Exception as e:
        print(f"Error creating/updating news_request {request_id} in Supabase: {e}")
        return {"error": f"Supabase initial interaction failed: {e}"}

    # 2. L1 Agent: KeywordFilterAgent
    keyword_agent = KeywordFilterAgent()
    l1_output = await keyword_agent.run(text=text_to_verify, request_id=request_id)
    all_pipeline_outputs[keyword_agent.agent_name] = l1_output

    if not l1_output.is_suspicious:
        # Early exit: "likely_true"
        meta_report_early = MetaAnalysisReport(
            request_id=request_id,
            original_text=text_to_verify,
            final_verdict=VerdictType.LIKELY_TRUE,
            final_confidence=0.85, # High confidence for non-suspicious, no negative evidence
            report_summary=f"Statement '{text_to_verify[:100]}...' deemed likely true after L1 keyword filter found no suspicious terms.",
            l1_output=l1_output,
            full_agent_outputs_json=json.dumps({keyword_agent.agent_name: l1_output.model_dump(exclude_none=True)})
        )
        try:
            await supabase_service_instance.create_verdict(
                id=str(uuid.uuid4()),
                request_id=request_id,
                verdict=meta_report_early.final_verdict,
                confidence=meta_report_early.final_confidence,
                report=meta_report_early.model_dump(exclude_none=True), # Store the full MetaAnalysisReport object
                evidence=None, # No L2 evidence gathered
                timestamp=datetime.now(timezone.utc)
            )
            await supabase_service_instance.update_news_request_status(request_id=request_id, status=VerificationStatus.DONE)
        except Exception as e:
            print(f"Error saving early verdict for {request_id}: {e}")
            # Continue to return the report even if DB save fails
        return meta_report_early.model_dump(exclude_none=True)

    # 3. L2 Agents (run in parallel)
    l2_agent_instances = [
        EvidenceRetrievalAgent(),
        SemanticAnalysisAgent(),
        FactCheckerAgent(),
    ]
    
    l2_tasks = []
    # Prepare tasks, ensuring correct arguments are passed
    # EvidenceRetrievalAgent needs 'query' (text_to_verify)
    # SemanticAnalysisAgent needs 'text_to_analyze' and 'references' (needs Evidence output first)
    # FactCheckerAgent needs 'statement' and 'references' (needs Evidence output first)

    # Run EvidenceRetrieval first as others depend on it
    evidence_agent = EvidenceRetrievalAgent()
    evidence_output = await evidence_agent.run(query=text_to_verify, request_id=request_id)
    all_pipeline_outputs[evidence_agent.agent_name] = evidence_output
    retrieved_references = evidence_output.references if evidence_output and evidence_output.references else []


    # Now run other L2 agents that depend on evidence
    semantic_agent = SemanticAnalysisAgent()
    fact_check_agent = FactCheckerAgent()

    l2_dependent_tasks = [
        semantic_agent.run(text_to_analyze=text_to_verify, references=retrieved_references, request_id=request_id),
        fact_check_agent.run(statement=text_to_verify, references=retrieved_references, request_id=request_id),
    ]
    
    l2_results = await asyncio.gather(*l2_dependent_tasks, return_exceptions=True)
    
    # Process L2 results
    dependent_agent_names = [semantic_agent.agent_name, fact_check_agent.agent_name]
    for i, result in enumerate(l2_results):
        agent_name = dependent_agent_names[i]
        if isinstance(result, Exception):
            print(f"Error running L2 agent {agent_name}: {result}")
            all_pipeline_outputs[agent_name] = AgentOutputBase(agent_name=agent_name, error=str(result))
        elif isinstance(result, AgentOutputBase):
            all_pipeline_outputs[agent_name] = result
        else: # Should not happen if agents return AgentOutputBase
             all_pipeline_outputs[agent_name] = AgentOutputBase(agent_name=agent_name, error="Unknown output type")


    # 4. L3 DebatePlannerAgent
    debate_planner_agent = DebatePlannerAgent()
    planner_output = await debate_planner_agent.run(
        l2_outputs=all_pipeline_outputs, # Pass all current outputs
        original_text=text_to_verify,
        request_id=request_id
    )
    all_pipeline_outputs[debate_planner_agent.agent_name] = planner_output

    # 5. L3 Debate and Graph Analysis (if required)
    if planner_output.debate_required and planner_output.l3_agent_classes_to_invoke:
        debate_topic = planner_output.debate_topic or text_to_verify
        
        # Instantiate debate agents
        pro_agent: Optional[BaseDebateParticipantAgent] = None
        con_agent: Optional[BaseDebateParticipantAgent] = None
        graph_agent: Optional[GraphAnalysisAgent] = None

        for agent_class_name in planner_output.l3_agent_classes_to_invoke:
            if agent_class_name == "DebateProAgent": pro_agent = DebateProAgent()
            if agent_class_name == "DebateConAgent": con_agent = DebateConAgent()
            if agent_class_name == "GraphAnalysisAgent": graph_agent = GraphAnalysisAgent()
        
        if pro_agent and con_agent: # Both needed for a debate
            for round_num in range(1, BaseDebateParticipantAgent.MAX_ROUNDS + 1):
                # Pro turn
                pro_turn_output = await pro_agent.run(
                    topic=debate_topic, 
                    debate_history=debate_log_history, 
                    current_round_number=round_num,
                    request_id=request_id
                )
                all_pipeline_outputs[f"{pro_agent.agent_name}_R{round_num}"] = pro_turn_output
                if pro_turn_output.turn_details: debate_log_history.append(pro_turn_output.turn_details)

                # Con turn
                con_turn_output = await con_agent.run(
                    topic=debate_topic, 
                    debate_history=debate_log_history, 
                    current_round_number=round_num,
                    request_id=request_id
                )
                all_pipeline_outputs[f"{con_agent.agent_name}_R{round_num}"] = con_turn_output
                if con_turn_output.turn_details: debate_log_history.append(con_turn_output.turn_details)
        
        if graph_agent and debate_log_history:
            graph_output = await graph_agent.run(
                debate_log=debate_log_history, 
                debate_topic=debate_topic,
                request_id=request_id
            )
            all_pipeline_outputs[graph_agent.agent_name] = graph_output

    # 6. L3 MetaAnalysisAgent
    meta_agent = MetaAnalysisAgent()
    final_report_model = await meta_agent.run(
        request_id=request_id,
        original_text=text_to_verify,
        all_agent_outputs=all_pipeline_outputs,
        debate_log=debate_log_history,
        request_start_time=pipeline_start_time # For overall timing if needed
    )

    # 7. Update Supabase tables
    try:
        await supabase_service_instance.create_verdict(
            id=str(uuid.uuid4()), # New UUID for the verdict itself
            request_id=request_id,
            verdict=final_report_model.final_verdict,
            confidence=final_report_model.final_confidence,
            report=final_report_model.model_dump(exclude_none=True), # Store the full MetaAnalysisReport
            evidence=[ref.model_dump() for ref in retrieved_references] if retrieved_references else None,
            timestamp=datetime.now(timezone.utc)
        )
        await supabase_service_instance.update_news_request_status(request_id=request_id, status=VerificationStatus.DONE)
    except Exception as e:
        print(f"Error saving final verdict for {request_id}: {e}")
        # The report is still returned to the caller

    return final_report_model.model_dump(exclude_none=True)


# --- Example Usage (for testing) ---
async def main_test():
    print("Starting agent pipeline test...")
    
    # Ensure MISTRAL_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY (and optionally NEWS_API_KEY) are set in .env or environment
    if not MISTRAL_API_KEY:
        print("MISTRAL_API_KEY is not set. Test will be limited.")
        # return
    if not SUPABASE_URL or not SUPABASE_ANON_KEY:
        print("Supabase URL/KEY not set. Supabase interactions will be mocked/skipped.")
        # return

    test_request_id = f"test_req_{uuid.uuid4()}"
    
    # Test case 1: Likely true (no suspicious keywords)
    # test_text_1 = "Local library announces summer reading program for children."
    # print(f"\n--- Running pipeline for: '{test_text_1}' (ID: {test_request_id}_1) ---")
    # report1 = await run_pipeline(request_id=f"{test_request_id}_1", text_to_verify=test_text_1)
    # print("\nFinal Report 1 (Likely True):")
    # print(json.dumps(report1, indent=2))

    # Test case 2: Needs full pipeline (potentially suspicious or complex)
    test_text_2 = "Sources claim a new cure for the common cold has been secretly developed by a tech giant."
    print(f"\n--- Running pipeline for: '{test_text_2}' (ID: {test_request_id}_2) ---")
    report2 = await run_pipeline(request_id=f"{test_request_id}_2", text_to_verify=test_text_2)
    print("\nFinal Report 2 (Full Pipeline):")
    print(json.dumps(report2, indent=2))

if __name__ == "__main__":
    # This allows running the test directly if the file is executed.
    # Note: `create_client` from Supabase might cause issues if not in an async context
    # depending on its internals. `asyncio.run` handles the top-level async call.
    
    # Check if running in a context where an event loop is already present (e.g. Jupyter)
    try:
        loop = asyncio.get_running_loop()
        if loop.is_running():
            print("Asyncio loop already running. Creating task for main_test().")
            loop.create_task(main_test())
        else: # Should not happen if get_running_loop() succeeded without error
            asyncio.run(main_test())
    except RuntimeError: # No running event loop
        asyncio.run(main_test())
