import sys
import traceback
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.database import get_db

from app.models.models import User, Resume, JobDescription
from app.services.intelligence_service import IntelligenceService
from app.services.gemini_service import GeminiService
from app.schemas.intelligence import JobMatchDetailedSchema, SkillGapList

def mock_detailed_match(resume_text, job_text):
    return JobMatchDetailedSchema(
        ats_match_score=85.5,
        overall_match=80.0,
        skill_match=90.0,
        experience_match=75.0,
        education_match=100.0,
        project_match=85.0,
        matching_skills=["Python"],
        missing_skills=["Java"],
        missing_keywords=["Spring"],
        resume_strengths=["Good"],
        resume_weaknesses=["None"],
        improvement_suggestions=["Learn Java"],
        suggested_courses=["Java 101"],
        learning_timeline="1 week",
        estimated_preparation_time="10 hours"
    )

def mock_skill_gap(resume_text, job_text):
    return SkillGapList(
        technical_skills=["Java"],
        soft_skills=[],
        frameworks=["Spring"],
        languages=["Java"],
        tools=[]
    )

GeminiService.generate_detailed_match = staticmethod(mock_detailed_match)
GeminiService.detect_skill_gap = staticmethod(mock_skill_gap)

def test():
    db = next(get_db())
    resume = db.query(Resume).first()
    job = db.query(JobDescription).first()
    user_id = resume.user_id

    try:
        match, gap = IntelligenceService.match_resume_to_job(db, resume.id, job.id, user_id)
        print("Success!")
        print(match)
    except Exception as e:
        print("Crash!")
        traceback.print_exc()

if __name__ == "__main__":
    test()
