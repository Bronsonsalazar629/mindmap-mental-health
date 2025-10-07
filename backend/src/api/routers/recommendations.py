"""
AI Recommendations endpoints for MindMap Research API.
Handles personalized resource recommendations with bias detection.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from pydantic import BaseModel, validator, Field
from sqlalchemy.orm import Session
from slowapi import Limiter
from slowapi.util import get_remote_address

from core.auth import get_current_consented_user, AuthenticatedUser
from core.config import settings
from core.exceptions import ResourceNotFoundError
from database.base import get_db
from database.models.resource_recommendation import ResourceRecommendation
from database.models.audit_log import AuditLog

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class RecommendationResponse(BaseModel):
    """Response model for recommendations."""
    recommendation_id: str
    resource_type: str
    resource_title: str
    resource_description: str
    confidence_score: float
    status: str
    engagement_score: Optional[float]
    recommended_at: str
    algorithm_type: str
    bias_risk_level: str


class RecommendationFeedback(BaseModel):
    """Model for recommendation feedback."""
    helpful: bool
    engagement_level: int = Field(..., ge=1, le=5)
    feedback_text: Optional[str] = Field(None, max_length=500)
    action_taken: Optional[str] = None
    
    @validator('action_taken')
    def validate_action(cls, v):
        if v and v not in ['viewed', 'clicked', 'engaged', 'completed', 'dismissed', 'saved']:
            raise ValueError('Invalid action type')
        return v


@router.get("/", response_model=List[RecommendationResponse])
@limiter.limit("30/minute")
async def get_recommendations(
    request: Request,
    current_user: AuthenticatedUser = Depends(get_current_consented_user),
    db: Session = Depends(get_db),
    limit: int = Query(10, le=50),
    resource_type: Optional[str] = Query(None)
):
    """Get personalized recommendations for the user."""
    try:
        query = db.query(ResourceRecommendation).filter(
            ResourceRecommendation.user_pseudonym_id == current_user.pseudonym_id
        )
        
        if resource_type:
            query = query.filter(ResourceRecommendation.resource_type == resource_type)
        
        recommendations = query.order_by(
            ResourceRecommendation.recommended_at.desc()
        ).limit(limit).all()
        
        return [
            RecommendationResponse(
                recommendation_id=rec.recommendation_id,
                resource_type=rec.resource_type,
                resource_title=rec.resource_title,
                resource_description=rec.resource_description,
                confidence_score=rec.confidence_score,
                status=rec.status,
                engagement_score=rec.engagement_score,
                recommended_at=rec.recommended_at.isoformat(),
                algorithm_type=rec.algorithm_type,
                bias_risk_level=rec.bias_risk_level
            )
            for rec in recommendations
        ]
        
    except Exception as e:
        logger.error(f"Failed to get recommendations: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve recommendations"
        )


@router.post("/{recommendation_id}/feedback")
@limiter.limit("20/minute")
async def submit_recommendation_feedback(
    request: Request,
    recommendation_id: str,
    feedback: RecommendationFeedback,
    current_user: AuthenticatedUser = Depends(get_current_consented_user),
    db: Session = Depends(get_db)
):
    """Submit feedback on a recommendation."""
    try:
        recommendation = db.query(ResourceRecommendation).filter(
            ResourceRecommendation.recommendation_id == recommendation_id,
            ResourceRecommendation.user_pseudonym_id == current_user.pseudonym_id
        ).first()
        
        if not recommendation:
            raise ResourceNotFoundError("Recommendation", recommendation_id)
        
        # Update recommendation with feedback
        recommendation.engagement_score = feedback.engagement_level / 5.0
        if feedback.action_taken:
            recommendation.status = feedback.action_taken
        
        db.commit()
        
        # Log feedback
        audit_log = AuditLog(
            user_pseudonym_id=current_user.pseudonym_id,
            event_type="recommendation_feedback",
            event_category="user_interaction",
            event_description="User provided recommendation feedback",
            ip_address=request.client.host if request.client else "unknown",
            user_agent=request.headers.get("user-agent", "unknown"),
            additional_data={
                "recommendation_id": recommendation_id,
                "helpful": feedback.helpful,
                "engagement_level": feedback.engagement_level,
                "action_taken": feedback.action_taken
            }
        )
        db.add(audit_log)
        db.commit()
        
        return {"message": "Feedback submitted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to submit feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit feedback"
        )