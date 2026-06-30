from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Any

class JobDescriptionCreate(BaseModel):
    title: str
    company: str | None = None
    description: str
    required_skills: Any = None
    preferred_skills: Any = None
    experience: str | None = None
    education: str | None = None
    salary: str | None = None
    location: str | None = None
    responsibilities: Any = None
    technologies: Any = None

class JobDescriptionResponse(BaseModel):
    id: UUID
    title: str
    company: str | None = None
    description: str
    required_skills: Any = None
    preferred_skills: Any = None
    experience: str | None = None
    education: str | None = None
    salary: str | None = None
    location: str | None = None
    responsibilities: Any = None
    technologies: Any = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class JobMatchResponse(BaseModel):
    id: UUID
    resume_id: UUID
    job_id: UUID
    match_score: float
    detailed_analysis_json: Any = None
    created_at: datetime

    class Config:
        from_attributes = True
