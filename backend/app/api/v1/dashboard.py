from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.dashboard import DashboardStats
from app.repositories.resume_repository import ResumeRepository

router = APIRouter()

@router.get(
    "",
    response_model=DashboardStats,
    summary="Get Dashboard Statistics",
    description="Retrieves aggregated stats for the current user's resumes."
)
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = ResumeRepository.get_dashboard_stats(db, current_user.id)
    return DashboardStats(**stats)
