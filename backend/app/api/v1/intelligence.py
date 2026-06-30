from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.intelligence import SkillGapResponse, LearningRoadmapResponse, CareerRecommendationResponse
from app.services.intelligence_service import IntelligenceService

router = APIRouter()

@router.get("/skill-gap/{resume_id}", response_model=list[SkillGapResponse])
async def get_skill_gaps(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return IntelligenceService.get_skill_gaps(db, resume_id, current_user.id)

@router.get("/roadmap/{resume_id}", response_model=LearningRoadmapResponse)
async def get_roadmap(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return IntelligenceService.generate_roadmap(db, resume_id, current_user.id)

@router.get("/recommendations/{resume_id}", response_model=CareerRecommendationResponse)
async def get_recommendations(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return IntelligenceService.get_career_recommendations(db, resume_id, current_user.id)
