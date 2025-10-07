"""
Research Interventions endpoints for MindMap Research API.
Handles A/B testing and intervention tracking for research studies.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from core.auth import get_current_consented_user, require_researcher_role, AuthenticatedUser
from database.base import get_db
from database.models.intervention_log import InterventionLog

logger = logging.getLogger(__name__)
router = APIRouter()


class InterventionResponse(BaseModel):
    """Response model for interventions."""
    log_id: str
    intervention_type: str
    status: str
    immediate_effectiveness: Optional[int]
    short_term_effectiveness: Optional[int]
    engagement_score: float
    delivered_at: str


@router.get("/", response_model=List[InterventionResponse])
async def get_user_interventions(
    current_user: AuthenticatedUser = Depends(get_current_consented_user),
    db: Session = Depends(get_db)
):
    """Get user's intervention history."""
    try:
        interventions = db.query(InterventionLog).filter(
            InterventionLog.user_pseudonym_id == current_user.pseudonym_id
        ).all()
        
        return [
            InterventionResponse(
                log_id=intervention.log_id,
                intervention_type=intervention.intervention_type,
                status=intervention.status,
                immediate_effectiveness=intervention.immediate_effectiveness,
                short_term_effectiveness=intervention.short_term_effectiveness,
                engagement_score=intervention.engagement_score,
                delivered_at=intervention.delivered_at.isoformat()
            )
            for intervention in interventions
        ]
        
    except Exception as e:
        logger.error(f"Failed to get interventions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve interventions"
        )