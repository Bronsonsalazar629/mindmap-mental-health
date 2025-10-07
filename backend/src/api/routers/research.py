"""
Research & Analytics endpoints for MindMap Research API.
Handles bias detection, geographic analysis, and research insights.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.auth import require_researcher_role, AuthenticatedUser
from core.config import settings
from database.base import get_db
from database.queries.bias_detection import BiasDetectionAnalyzer

logger = logging.getLogger(__name__)
router = APIRouter()


class BiasAnalysisResponse(BaseModel):
    """Response model for bias analysis results."""
    analysis_period_days: int
    total_recommendations: int
    bias_tests: Dict[str, Any]
    fairness_metrics: Dict[str, Any]
    demographic_patterns: Dict[str, Any]
    recommendations: list


@router.get("/bias-analysis", response_model=BiasAnalysisResponse)
async def get_bias_analysis(
    request: Request,
    current_user: AuthenticatedUser = Depends(require_researcher_role),
    db: Session = Depends(get_db),
    days_back: int = Query(90, ge=1, le=365, description="Number of days to analyze")
):
    """
    Perform bias detection analysis on recommendation algorithms.
    
    Requires researcher role. Analyzes algorithmic bias across
    demographic groups and geographic regions.
    """
    try:
        if not settings.BIAS_DETECTION_ENABLED:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Bias detection is currently disabled"
            )
        
        analyzer = BiasDetectionAnalyzer(db)
        results = analyzer.analyze_recommendation_bias(days_back=days_back)
        
        return BiasAnalysisResponse(**results)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bias analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform bias analysis"
        )


@router.get("/geographic-analysis")
async def get_geographic_analysis(
    request: Request,
    current_user: AuthenticatedUser = Depends(require_researcher_role),
    db: Session = Depends(get_db),
    days_back: int = Query(90, ge=1, le=365)
):
    """
    Perform geographic bias analysis.
    
    Analyzes mental health outcomes and access patterns
    across different geographic regions.
    """
    try:
        analyzer = BiasDetectionAnalyzer(db)
        results = analyzer.analyze_geographic_bias(days_back=days_back)
        
        return results
        
    except Exception as e:
        logger.error(f"Geographic analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to perform geographic analysis"
        )


@router.post("/bias-report")
async def generate_bias_report(
    request: Request,
    current_user: AuthenticatedUser = Depends(require_researcher_role),
    db: Session = Depends(get_db)
):
    """
    Generate comprehensive bias detection report.
    
    Creates a detailed report on algorithmic fairness
    and bias patterns across the platform.
    """
    try:
        analyzer = BiasDetectionAnalyzer(db)
        report = analyzer.generate_bias_report()
        
        return report
        
    except Exception as e:
        logger.error(f"Bias report generation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate bias report"
        )