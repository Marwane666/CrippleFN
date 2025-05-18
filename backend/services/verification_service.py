"""
Service for managing content verifications.
"""

from typing import Dict, Any, List, Optional
import os
import uuid
import json
import asyncio
import logging
from datetime import datetime
from fastapi import UploadFile

from services.agent_service import AgentService
from services.supabase_service import SupabaseService
from models.verification import VerificationStatus
from models.tables import VerdictType

class VerificationService:
    """Service for managing content verification."""
    
    def __init__(self):
        """Initialize the service with necessary dependencies."""
        self.agent_service = AgentService()
        self.supabase = SupabaseService()
        self.logger = logging.getLogger(__name__)
    
    # Existing methods for verification creation
    
    async def create_verification(
        self, 
        text: Optional[str] = None,
        urls: Optional[List[str]] = None,
        files: Optional[List[UploadFile]] = None
    ) -> str:
        """
        Create a new verification request.
        
        Args:
            text: Text to verify
            urls: List of URLs to verify
            files: Media files to analyze
            
        Returns:
            Unique verification ID
        """
        # Generate a unique identifier
        verification_id = str(uuid.uuid4())
        
        # Create verification object
        verification = {
            "id": verification_id,
            "text": text or "",
            "urls": urls or [],
            "file_paths": await self._save_uploaded_files(files) if files else [],
            "status": VerificationStatus.PENDING,
            "created_at": datetime.now().isoformat()
        }
        
        # Save to database
        await self.supabase.create_verification(verification)
        
        # Launch verification process in background
        asyncio.create_task(self.process_news_verification(verification_id))
        
        return verification_id
    
    async def get_verification(self, verification_id: str) -> Dict[str, Any]:
        """
        Get verification details by ID.
        
        Args:
            verification_id: Verification ID
            
        Returns:
            Verification details
        """
        return await self.supabase.get_verification(verification_id)
    
    async def process_news_verification(self, request_id: str) -> Dict[str, Any]:
        """
        Process a news verification request and generate a verdict.
        
        Args:
            request_id: Request ID
            
        Returns:
            Processing results including verdict and evidence
        """
        self.logger.info(f"Processing news verification request {request_id}")
        
        # Update status
        await self.supabase.update_news_request_status(request_id, "running")
        
        # Get the text to verify
        news_request = await self.supabase.get_news_request(request_id)
        if not news_request:
            self.logger.error(f"Request {request_id} not found")
            return {"success": False, "error": "Request not found"}
        
        text = news_request["text"]
        
        # Initialize results
        results = {}
        
        try:
            # Step 1: Quick filtering (L1)
            l1_execution = await self.agent_service.run_keyword_filter(request_id, text)
            l1_result = l1_execution.get("result", {}) if l1_execution.get("success", False) else {}
            results["keyword_filter"] = l1_execution
            
            # Check if we should proceed
            proceed_to_l2 = True
            if l1_execution.get("success", False):
                proceed_to_l2 = l1_result.get("proceed_to_l2", True)
                
                # If L1 says not to proceed, create a direct LIKELY_TRUE verdict
                if not proceed_to_l2:
                    self.logger.info(f"L1 determined no need to proceed to L2 for request {request_id}")
                    
                    verdict = VerdictType.LIKELY_TRUE
                    confidence = 0.7
                    report = "Initial filtering did not detect any suspicious elements in the text."
                    
                    await self.supabase.create_verdict(
                        request_id=request_id,
                        verdict=verdict,
                        confidence=confidence,
                        report=report,
                        evidence=[]
                    )
                    
                    # Update status
                    await self.supabase.update_news_request_status(request_id, "done")
                    return {"success": True, "verdict": verdict, "confidence": confidence}
            
            # Step 2: Deep analysis (L2)
            l2_results = {}
            
            # Evidence retrieval
            evidence_execution = await self.agent_service.run_evidence_retrieval(request_id, text)
            l2_results["evidence_retrieval"] = evidence_execution.get("result", {}) if evidence_execution.get("success", False) else {}
            results["evidence_retrieval"] = evidence_execution
            
            # Get evidence for following analyses
            evidence = []
            if evidence_execution.get("success", False):
                evidence = evidence_execution.get("result", {}).get("sources", [])
            
            # Semantic analysis
            semantic_execution = await self.agent_service.run_semantic_analysis(request_id, text, evidence)
            l2_results["semantic_analysis"] = semantic_execution.get("result", {}) if semantic_execution.get("success", False) else {}
            results["semantic_analysis"] = semantic_execution
            
            # Extract claims from semantic analysis
            claims = []
            if semantic_execution.get("success", False):
                semantic_result = semantic_execution.get("result", {})
                supports = semantic_result.get("supports", [])
                contradictions = semantic_result.get("contradictions", [])
                
                for item in supports + contradictions:
                    if "claim" in item:
                        claims.append(item["claim"])
            
            # Fact checking
            fact_checker_execution = await self.agent_service.run_fact_checker(request_id, text, claims, evidence)
            l2_results["fact_checker"] = fact_checker_execution.get("result", {}) if fact_checker_execution.get("success", False) else {}
            results["fact_checker"] = fact_checker_execution
            
            # Determine if L3 is needed
            need_l3 = await self._determine_if_l3_needed(l2_results)
            
            l3_results = {}
            if need_l3:
                self.logger.info(f"Starting L3 analysis for request {request_id}")
                
                # Debate planning
                debate_planner_execution = await self.agent_service.run_debate_planner(request_id, l2_results)
                l3_results["debate_planner"] = debate_planner_execution.get("result", {}) if debate_planner_execution.get("success", False) else {}
                results["debate_planner"] = debate_planner_execution
                
                # Check if a debate is needed
                initiate_debate = l3_results["debate_planner"].get("initiate_debate", False)
                focus_points = l3_results["debate_planner"].get("focus_points", [])
                
                if initiate_debate and focus_points:
                    # Debate
                    debate_results = []
                    
                    # First round: initial arguments
                    pro_execution = await self.agent_service.run_debate_agent(
                        request_id, "pro", text, focus_points
                    )
                    con_execution = await self.agent_service.run_debate_agent(
                        request_id, "con", text, focus_points
                    )
                    
                    if pro_execution.get("success", False):
                        debate_results.append(pro_execution.get("result", {}))
                        results["debate_agent_pro"] = pro_execution
                    
                    if con_execution.get("success", False):
                        debate_results.append(con_execution.get("result", {}))
                        results["debate_agent_con"] = con_execution
                    
                    # Second round: counter-arguments (optional)
                    if len(debate_results) == 2:
                        pro_rebuttal = await self.agent_service.run_debate_agent(
                            request_id, "pro", text, focus_points, debate_results
                        )
                        con_rebuttal = await self.agent_service.run_debate_agent(
                            request_id, "con", text, focus_points, debate_results
                        )
                        
                        if pro_rebuttal.get("success", False):
                            debate_results.append(pro_rebuttal.get("result", {}))
                            results["debate_agent_pro_rebuttal"] = pro_rebuttal
                        
                        if con_rebuttal.get("success", False):
                            debate_results.append(con_rebuttal.get("result", {}))
                            results["debate_agent_con_rebuttal"] = con_rebuttal
                    
                    # Graph analysis
                    if debate_results:
                        graph_execution = await self.agent_service.run_graph_analysis(request_id, debate_results)
                        l3_results["graph_analysis"] = graph_execution.get("result", {}) if graph_execution.get("success", False) else {}
                        results["graph_analysis"] = graph_execution
            
            # Final meta analysis
            meta_execution = await self.agent_service.run_meta_analysis(
                request_id,
                l1_results=l1_result,
                l2_results=l2_results,
                l3_results=l3_results if need_l3 else None
            )
            results["meta_analysis"] = meta_execution
            
            # Save final verdict
            if meta_execution.get("success", False):
                verdict = meta_execution.get("result", {})
                if verdict and "verdict" in verdict and "confidence" in verdict:
                    await self.supabase.create_verdict(
                        request_id=request_id,
                        verdict=verdict["verdict"],
                        confidence=verdict["confidence"],
                        report=verdict.get("explanation", ""),
                        evidence=verdict.get("evidence_summary", [])
                    )
                    
                    # Update status
                    await self.supabase.update_news_request_status(request_id, "done")
                    
                    return {
                        "success": True,
                        "verdict": verdict["verdict"],
                        "confidence": verdict["confidence"],
                        "report": verdict.get("explanation", ""),
                        "evidence": verdict.get("evidence_summary", [])
                    }
                else:
                    self.logger.warning(f"Meta analysis returned invalid result for request {request_id}")
            else:
                self.logger.error(f"Meta analysis failed for request {request_id}")
            
            # If we get here, something went wrong
            await self.supabase.update_news_request_status(request_id, "failed")
            return {"success": False, "error": "Failed to generate verdict"}
            
        except Exception as e:
            self.logger.error(f"Error processing request {request_id}: {str(e)}")
            await self.supabase.update_news_request_status(request_id, "failed")
            return {"success": False, "error": str(e)}
        finally:
            # Save all processing results for reference
            await self.supabase.save_pipeline_results(request_id, results)
    
    async def get_news_verification_status(self, request_id: str) -> Dict[str, Any]:
        """
        Get the status of a verification request.
        
        Args:
            request_id: Request ID
            
        Returns:
            Status and results if available
        """
        self.logger.info(f"Getting status for request {request_id}")
        
        # Get the request
        news_request = await self.supabase.get_news_request(request_id)
        if not news_request:
            return {
                "id": request_id,
                "status": "not_found",
                "message": "Request not found"
            }
        
        # If verification is complete, include the verdict
        if news_request["status"] == "done":
            verdict = await self.supabase.get_verdict(request_id)
            return {
                "id": request_id,
                "status": news_request["status"],
                "created_at": news_request["created_at"],
                "updated_at": news_request["updated_at"],
                "verdict": verdict["verdict"] if verdict else None,
                "confidence": verdict["confidence"] if verdict else None,
                "report": verdict["report"] if verdict else None,
                "evidence": verdict["evidence"] if verdict else None
            }
        
        # Otherwise, just return the status
        return {
            "id": request_id,
            "status": news_request["status"],
            "created_at": news_request["created_at"],
            "updated_at": news_request["updated_at"],
            "message": self._get_status_message(news_request["status"])
        }
    
    def _get_status_message(self, status: str) -> str:
        """
        Get a descriptive message for a status.
        
        Args:
            status: Request status
            
        Returns:
            Human-readable message
        """
        status_messages = {
            "pending": "Request is waiting to be processed",
            "running": "Analysis is in progress",
            "done": "Analysis is complete",
            "failed": "Analysis failed due to an error"
        }
        
        return status_messages.get(status, "Unknown status")
    
    async def _determine_if_l3_needed(self, l2_results: Dict[str, Any]) -> bool:
        """
        Determine if L3 analysis (debate) is needed.
        
        Args:
            l2_results: Results from L2 analysis
            
        Returns:
            Whether L3 is needed
        """
        # Logic to determine if debate is necessary
        # Currently always returns True for demonstration
        return True
    
    async def execute_verification_pipeline(self, request_id: str, levels: List[str] = None) -> Dict[str, Any]:
        """
        Execute a custom verification pipeline.
        
        Args:
            request_id: Request ID
            levels: Verification levels to execute (L1, L2, L3)
            
        Returns:
            Pipeline results
        """
        if not levels:
            levels = ["L1", "L2", "L3"]  # Default: run full pipeline
        
        self.logger.info(f"Executing verification pipeline for request {request_id} with levels: {levels}")
        
        # Get request text
        news_request = await self.supabase.get_news_request(request_id)
        if not news_request:
            return {"success": False, "error": "Request not found"}
        
        text = news_request["text"]
        
        # Create news request with specified levels
        news_request = await self.supabase.create_news_request(text, extra_data={"levels": levels})
        request_id = news_request["id"]
        
        # Start verification process in background
        asyncio.create_task(self.process_pipeline_verification(request_id, levels))
        
        return {
            "id": request_id,
            "status": news_request["status"],
            "created_at": news_request["created_at"],
            "levels": levels,            "message": "Verification in progress"
        }

    async def process_pipeline_verification(self, request_id: str, levels: List[str]) -> None:
        """
        Process a verification request with the specified pipeline.
        
        Args:
            request_id: Request ID
            levels: Levels to execute
        """
        self.logger.info(f"Starting pipeline for request {request_id} with levels {levels}")
        
        try:
            # Update status
            await self.supabase.update_news_request_status(request_id, "running")
            
            # Retrieve request
            news_request = await self.supabase.get_news_request(request_id)
            if not news_request:
                self.logger.error(f"Request {request_id} not found")
                return
            
            text = news_request["text"]
            
            results = {}
            l1_result = {}
            l2_results = {}
            l3_results = {}
            
            # Level 1 (L1): Quick filtering
            if "L1" in levels:
                self.logger.info(f"Executing L1 for request {request_id}")
                l1_execution = await self.agent_service.run_keyword_filter(request_id, text)
                results["keyword_filter"] = l1_execution
                
                if not l1_execution.get("success", False):
                    self.logger.error(f"L1 filtering agent failed for request {request_id}")
                    await self.supabase.update_news_request_status(request_id, "failed")
                    return
                
                l1_result = l1_execution.get("result", {})
                proceed_to_l2 = l1_result.get("proceed_to_l2", True)
                
                # Stop here if L1 indicates no need to proceed to L2
                # and user requested more than L1
                if not proceed_to_l2 and len(levels) > 1:
                    self.logger.info(f"L1 determined no need to proceed to L2 for request {request_id}")
                    
                    # Create direct LIKELY_TRUE verdict
                    meta_result = {
                        "verdict": VerdictType.LIKELY_TRUE,
                        "confidence": 0.7,
                        "explanation": "Initial filtering did not detect any suspicious elements in the text.",
                        "evidence_summary": []
                    }
                    
                    await self.supabase.create_verdict(
                        request_id=request_id,
                        verdict=meta_result["verdict"],
                        confidence=meta_result["confidence"],
                        report=meta_result["explanation"],
                        evidence=meta_result["evidence_summary"]
                    )
                    
                    # Update status
                    await self.supabase.update_news_request_status(request_id, "done")
                    return
            
            # Level 2 (L2): Deep analysis
            if "L2" in levels and ("L1" not in levels or proceed_to_l2):
                self.logger.info(f"Executing L2 for request {request_id}")
                
                # Evidence retrieval
                evidence_execution = await self.agent_service.run_evidence_retrieval(request_id, text)
                results["evidence_retrieval"] = evidence_execution
                
                # Get evidence for following analyses
                evidence = []
                if evidence_execution.get("success", False):
                    evidence = evidence_execution.get("result", {}).get("sources", [])
                    l2_results["evidence_retrieval"] = evidence_execution.get("result", {})
                
                # Semantic analysis
                semantic_execution = await self.agent_service.run_semantic_analysis(request_id, text, evidence)
                results["semantic_analysis"] = semantic_execution
                
                if semantic_execution.get("success", False):
                    l2_results["semantic_analysis"] = semantic_execution.get("result", {})
                
                # Extract claims from semantic analysis
                claims = []
                if semantic_execution.get("success", False):
                    semantic_result = semantic_execution.get("result", {})
                    supports = semantic_result.get("supports", [])
                    contradictions = semantic_result.get("contradictions", [])
                    
                    for item in supports + contradictions:
                        if "claim" in item:
                            claims.append(item["claim"])
                
                # Fact checking
                fact_checker_execution = await self.agent_service.run_fact_checker(request_id, text, claims, evidence)
                results["fact_checker"] = fact_checker_execution
                
                if fact_checker_execution.get("success", False):
                    l2_results["fact_checker"] = fact_checker_execution.get("result", {})
            
            # Determine if L3 is needed
            need_l3 = "L3" in levels and await self._determine_if_l3_needed(l2_results)
            
            # Level 3 (L3): Debate analysis
            if need_l3:
                self.logger.info(f"Executing L3 for request {request_id}")
                
                # Debate planning
                debate_planner_execution = await self.agent_service.run_debate_planner(request_id, l2_results)
                results["debate_planner"] = debate_planner_execution
                
                if debate_planner_execution.get("success", False):
                    l3_results["debate_planner"] = debate_planner_execution.get("result", {})
                    
                    # Check if debate is needed
                    initiate_debate = l3_results["debate_planner"].get("initiate_debate", False)
                    focus_points = l3_results["debate_planner"].get("focus_points", [])
                    
                    if initiate_debate and focus_points:
                        # Debate
                        debate_results = []
                        
                        # First round: initial arguments
                        pro_execution = await self.agent_service.run_debate_agent(
                            request_id, "pro", text, focus_points
                        )
                        con_execution = await self.agent_service.run_debate_agent(
                            request_id, "con", text, focus_points
                        )
                        
                        if pro_execution.get("success", False):
                            debate_results.append(pro_execution.get("result", {}))
                            results["debate_agent_pro"] = pro_execution
                        
                        if con_execution.get("success", False):
                            debate_results.append(con_execution.get("result", {}))
                            results["debate_agent_con"] = con_execution
                        
                        # Second round: counter-arguments (optional)
                        if len(debate_results) == 2:
                            pro_rebuttal = await self.agent_service.run_debate_agent(
                                request_id, "pro", text, focus_points, debate_results
                            )
                            con_rebuttal = await self.agent_service.run_debate_agent(
                                request_id, "con", text, focus_points, debate_results
                            )
                            
                            if pro_rebuttal.get("success", False):
                                debate_results.append(pro_rebuttal.get("result", {}))
                                results["debate_agent_pro_rebuttal"] = pro_rebuttal
                            
                            if con_rebuttal.get("success", False):
                                debate_results.append(con_rebuttal.get("result", {}))
                                results["debate_agent_con_rebuttal"] = con_rebuttal
                        
                        # Graph analysis
                        if debate_results:
                            graph_execution = await self.agent_service.run_graph_analysis(request_id, debate_results)
                            results["graph_analysis"] = graph_execution
                            
                            if graph_execution.get("success", False):
                                l3_results["graph_analysis"] = graph_execution.get("result", {})
            
            # Final meta analysis
            meta_execution = await self.agent_service.run_meta_analysis(
                request_id,
                l1_results=l1_result,
                l2_results=l2_results,
                l3_results=l3_results if need_l3 else None
            )
            results["meta_analysis"] = meta_execution
            
            # Save final verdict
            if meta_execution.get("success", False):
                verdict = meta_execution.get("result", {})
                if verdict and "verdict" in verdict and "confidence" in verdict:
                    await self.supabase.create_verdict(
                        request_id=request_id,
                        verdict=verdict["verdict"],
                        confidence=verdict["confidence"],
                        report=verdict.get("explanation", ""),
                        evidence=verdict.get("evidence_summary", [])
                    )
                    
                    # Update used levels
                    await self.supabase.update_news_request(
                        request_id, {"levels_used": [level for level in levels if level in ["L1", "L2", "L3"]]}
                    )
                    
                    # Update status
                    await self.supabase.update_news_request_status(request_id, "done")
                else:
                    # Meta analysis failed
                    await self.supabase.update_news_request_status(request_id, "failed")
                    self.logger.error(f"Meta analysis failed for request {request_id}")
            else:
                # Meta analysis failed
                await self.supabase.update_news_request_status(request_id, "failed")
                self.logger.error(f"Meta analysis failed for request {request_id}")
            
            # Save complete results for reference
            await self.supabase.save_pipeline_results(request_id, results)
            
        except Exception as e:
            self.logger.error(f"Error processing request {request_id}: {str(e)}")
            await self.supabase.update_news_request_status(request_id, "failed")

    async def get_pipeline_verification_status(self, request_id: str, include_details: bool = False) -> Dict[str, Any]:
        """
        Get the status and result of a pipeline verification.
        
        Args:
            request_id: Request ID
            include_details: Include complete execution details
            
        Returns:
            Status and results if available
        """
        self.logger.info(f"Getting status for request {request_id}")
        
        # Get the request
        news_request = await self.supabase.get_news_request(request_id)
        if not news_request:
            return {
                "id": request_id,
                "status": "not_found",
                "message": "Request not found"
            }
        
        # Basic information
        result = {
            "id": request_id,
            "status": news_request["status"],
            "created_at": news_request["created_at"],
            "updated_at": news_request.get("updated_at", ""),
            "levels_requested": news_request.get("extra_data", {}).get("levels", []),
            "levels_used": news_request.get("levels_used", [])
        }
        
        # If verification is complete, include the verdict
        if news_request["status"] == "done":
            verdict = await self.supabase.get_verdict(request_id)
            if verdict:
                result.update({
                    "verdict": verdict["verdict"],
                    "confidence": verdict["confidence"],
                    "report": verdict["report"],
                    "evidence": verdict["evidence"]
                })
        
        # Include complete details if requested
        if include_details:
            # Get detailed pipeline results
            pipeline_results = await self.supabase.get_pipeline_results(request_id)
            if pipeline_results:
                result["details"] = pipeline_results
            
            # Get agent logs
            agent_logs = await self.get_agent_logs(request_id)
            if agent_logs:
                result["agent_logs"] = agent_logs
        
        return result

    async def get_agent_logs(self, request_id: str) -> List[Dict[str, Any]]:
        """
        Get agent logs for a verification request.
        
        Args:
            request_id: Request ID
            
        Returns:
            List of agent logs chronologically ordered
        """
        return await self.supabase.get_agent_logs(request_id)

    async def list_verified_news(self, limit: int = 10, offset: int = 0, verdict_type: Optional[VerdictType] = None) -> List[Dict[str, Any]]:
        """
        List verified news with pagination and filtering by verdict.
        
        Args:
            limit: Maximum number of results
            offset: Number of results to skip
            verdict_type: Verdict type for filtering
            
        Returns:
            List of verified news
        """
        return await self.supabase.list_verified_news(limit, offset, verdict_type)

    async def get_verification_statistics(self) -> Dict[str, Any]:
        """
        Get statistics on news verifications.
        
        Returns:
            Statistics including number of verifications by verdict, reliability rate, etc.
        """
        # Get raw data
        verdicts = await self.supabase.get_all_verdicts()
        
        # Initialize counters
        stats = {
            "total_verifications": len(verdicts),
            "verdict_counts": {
                VerdictType.TRUE: 0,
                VerdictType.LIKELY_TRUE: 0,
                VerdictType.UNCERTAIN: 0,
                VerdictType.LIKELY_FALSE: 0,
                VerdictType.FALSE: 0
            },
            "average_confidence": 0.0,
            "verification_trend": []
        }
        
        # Calculate statistics
        if verdicts:
            # Count verdicts
            for verdict in verdicts:
                verdict_type = verdict.get("verdict")
                if verdict_type in stats["verdict_counts"]:
                    stats["verdict_counts"][verdict_type] += 1
            
            # Calculate average confidence
            confidence_sum = sum(verdict.get("confidence", 0.0) for verdict in verdicts)
            stats["average_confidence"] = confidence_sum / len(verdicts)
            
            # Verification trend (by month)
            # TODO: Implement trend calculation
        
        return stats
    
    # Method for handling uploaded files
    
    async def _save_uploaded_files(self, files: List[UploadFile]) -> List[str]:
        """
        Save uploaded files and return their paths.
        
        Args:
            files: List of uploaded files
            
        Returns:
            List of paths where files were saved
        """
        file_paths = []
        upload_dir = os.path.join(os.getcwd(), "uploads")
        
        # Create uploads directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)
        
        for file in files:
            # Generate unique filename
            filename = f"{uuid.uuid4()}_{file.filename}"
            file_path = os.path.join(upload_dir, filename)
            
            # Save file
            contents = await file.read()
            with open(file_path, "wb") as f:
                f.write(contents)
            
            file_paths.append(file_path)
            
            # Reset file position for potential future reads
            await file.seek(0)
        
        return file_paths
