from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Any

class JobDescriptionExtractionSchema(BaseModel):
    company: str | None = Field(description="The company name")
    required_skills: list[str] = Field(default_factory=list, description="Required technical and soft skills")
    preferred_skills: list[str] = Field(default_factory=list, description="Preferred or bonus skills")
    experience: str | None = Field(description="Years of experience or level required")
    education: str | None = Field(description="Educational requirements")
    salary: str | None = Field(description="Salary range if mentioned")
    location: str | None = Field(description="Job location if mentioned")
    responsibilities: list[str] = Field(default_factory=list, description="Key responsibilities")
    technologies: list[str] = Field(default_factory=list, description="Tech stack and tools")

class JobMatchDetailedSchema(BaseModel):
    ats_match_score: float = Field(ge=0, le=100, description="Match score from 0 to 100")
    overall_match: float = Field(ge=0, le=100, description="Overall semantic match percentage")
    skill_match: float = Field(ge=0, le=100, description="Skills match percentage")
    experience_match: float = Field(ge=0, le=100, description="Experience match percentage")
    education_match: float = Field(ge=0, le=100, description="Education match percentage")
    project_match: float = Field(ge=0, le=100, description="Project match percentage")
    matching_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    resume_strengths: list[str] = Field(default_factory=list)
    resume_weaknesses: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)
    suggested_courses: list[str] = Field(default_factory=list, description="Courses to bridge gaps")
    learning_timeline: str = Field(description="Brief text summary of timeline, e.g., '3-4 weeks'")
    estimated_preparation_time: str = Field(description="Estimated prep time, e.g., '40 hours'")

class SkillGapList(BaseModel):
    technical_skills: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)
    frameworks: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    tools: list[str] = Field(default_factory=list)

class SkillGapResponse(BaseModel):
    id: UUID
    resume_id: UUID
    job_id: UUID
    missing_skills: Any = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class RoadmapItem(BaseModel):
    skill_name: str
    learning_priority: str
    estimated_time: str
    free_resources: list[str] = Field(default_factory=list)
    project_suggestions: list[str] = Field(default_factory=list)
    difficulty: str

class LearningRoadmapSchema(BaseModel):
    plan_30_day: list[RoadmapItem] = Field(default_factory=list)
    plan_60_day: list[RoadmapItem] = Field(default_factory=list)
    plan_90_day: list[RoadmapItem] = Field(default_factory=list)

class LearningRoadmapResponse(BaseModel):
    id: UUID
    resume_id: UUID
    roadmap: Any = None
    progress_percentage: float
    created_at: datetime

    class Config:
        from_attributes = True

class Recommendation(BaseModel):
    role: str
    confidence_score: float = Field(..., ge=0, le=100)
    reasoning: str

class CareerRecommendationSchema(BaseModel):
    recommendations: list[Recommendation]

class CareerRecommendationResponse(BaseModel):
    id: UUID
    resume_id: UUID
    recommendations: list[dict]
    created_at: datetime

    class Config:
        from_attributes = True
