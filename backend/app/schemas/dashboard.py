from pydantic import BaseModel
from uuid import UUID
from typing import Any

class DashboardStats(BaseModel):
    total_resumes: int
    total_jobs: int
    average_ats_score: float
    highest_ats_score: int
    most_common_skills: list[str]
    latest_uploaded_resume_id: UUID | None = None
    latest_uploaded_resume_name: str | None = None
    latest_match_score: float | None = None
    missing_skills_count: int | None = None
    roadmap_progress: float | None = None
    upload_success_rate: float
    total_analyses: int
    best_resume_name: str | None = None
    best_job_match_title: str | None = None
    latest_activity: list[Any] = []
    ats_trend: list[Any] = []
    recent_jobs: list[Any] = []
