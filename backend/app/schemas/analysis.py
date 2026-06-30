from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime

class ExtractedInformation(BaseModel):
    full_name: str | None = Field(default=None)
    email: str | None = Field(default=None)
    phone_number: str | None = Field(default=None)
    linkedin: str | None = Field(default=None)
    github: str | None = Field(default=None)
    education: list[str] = Field(default_factory=list)
    experience: list[str] = Field(default_factory=list)
    projects: list[str] = Field(default_factory=list)
    certifications: list[str] = Field(default_factory=list)
    technical_skills: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)

class CategorizedSkills(BaseModel):
    programming_languages: list[str] = Field(default_factory=list)
    frameworks: list[str] = Field(default_factory=list)
    libraries: list[str] = Field(default_factory=list)
    databases: list[str] = Field(default_factory=list)
    cloud_platforms: list[str] = Field(default_factory=list)
    developer_tools: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)

class ATSFeedback(BaseModel):
    ats_score: int = Field(..., ge=0, le=100, description="ATS Score out of 100")
    grade: str = Field(..., description="Grade A, B, C, D, or F")
    resume_rating: float = Field(..., description="Overall rating out of 10")
    interview_readiness: str = Field(..., description="Assessment of interview readiness")
    career_advice: str = Field(..., description="Actionable career advice")
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    missing_sections: list[str] = Field(default_factory=list)
    improvement_suggestions: list[str] = Field(default_factory=list)
    resume_summary: str = Field(..., description="A short summary of the resume")

class GeminiStructuredOutput(BaseModel):
    extracted_information: ExtractedInformation
    categorized_skills: CategorizedSkills
    ats_feedback: ATSFeedback

class AnalysisResponse(BaseModel):
    id: UUID
    resume_id: UUID
    ats_score: int
    extracted_information: dict
    categorized_skills: dict
    strengths: list[str]
    weaknesses: list[str]
    improvement_suggestions: list[str]
    missing_keywords: list[str]
    resume_summary: str
    interview_readiness: str | None = None
    resume_rating: float | None = None
    career_advice: str | None = None
    created_at: datetime
    
    class Config:
        from_attributes = True
