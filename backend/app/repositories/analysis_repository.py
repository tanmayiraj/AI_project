from sqlalchemy.orm import Session
from uuid import UUID
from app.models.models import ResumeAnalysis

class AnalysisRepository:
    @staticmethod
    def create(db: Session, resume_id: UUID, ats_score: int, extracted_information: dict, categorized_skills: dict, feedback_json: dict, resume_summary: str) -> ResumeAnalysis:
        analysis = ResumeAnalysis(
            resume_id=resume_id,
            ats_score=ats_score,
            extracted_information=extracted_information,
            categorized_skills=categorized_skills,
            feedback_json=feedback_json,
            resume_summary=resume_summary
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        return analysis

    @staticmethod
    def get_by_resume_id(db: Session, resume_id: UUID) -> ResumeAnalysis | None:
        return db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume_id).first()
