from sqlalchemy.orm import Session
from uuid import UUID
from app.services.gemini_service import GeminiService
from app.repositories.resume_repository import ResumeRepository
from app.repositories.analysis_repository import AnalysisRepository
from app.core.exceptions import ResumeNotFoundException
from app.schemas.analysis import AnalysisResponse

class ResumeAnalyzer:
    """
    Service for orchestrating the resume analysis process.
    """
    @staticmethod
    def analyze_and_store(db: Session, resume_id: UUID, user_id: UUID) -> AnalysisResponse:
        resume = ResumeRepository.get_by_id_and_user(db, resume_id, user_id)
        if not resume:
            raise ResumeNotFoundException()
        
        existing_analysis = AnalysisRepository.get_by_resume_id(db, resume_id)
        if existing_analysis:
            feedback = existing_analysis.feedback_json
            return AnalysisResponse(
                id=existing_analysis.id,
                resume_id=existing_analysis.resume_id,
                ats_score=existing_analysis.ats_score,
                extracted_information=existing_analysis.extracted_information,
                categorized_skills=existing_analysis.categorized_skills,
                strengths=feedback.get("strengths", []),
                weaknesses=feedback.get("weaknesses", []),
                improvement_suggestions=feedback.get("improvement_suggestions", []),
                missing_keywords=feedback.get("missing_sections", []),
                resume_summary=existing_analysis.resume_summary,
                interview_readiness=feedback.get("interview_readiness"),
                resume_rating=feedback.get("resume_rating"),
                career_advice=feedback.get("career_advice"),
                created_at=existing_analysis.created_at
            )
        
        # Analyze via Gemini
        gemini_output = GeminiService.analyze_resume(resume.parsed_content)
        
        # Construct feedback json
        feedback_json = {
            "strengths": gemini_output.ats_feedback.strengths,
            "weaknesses": gemini_output.ats_feedback.weaknesses,
            "improvement_suggestions": gemini_output.ats_feedback.improvement_suggestions,
            "missing_sections": gemini_output.ats_feedback.missing_sections,
            "interview_readiness": gemini_output.ats_feedback.interview_readiness,
            "resume_rating": gemini_output.ats_feedback.resume_rating,
            "career_advice": gemini_output.ats_feedback.career_advice
        }
        
        # Save to DB
        new_analysis = AnalysisRepository.create(
            db=db,
            resume_id=resume_id,
            ats_score=gemini_output.ats_feedback.ats_score,
            extracted_information=gemini_output.extracted_information.model_dump(mode="json"),
            categorized_skills=gemini_output.categorized_skills.model_dump(mode="json"),
            feedback_json=feedback_json,
            resume_summary=gemini_output.ats_feedback.resume_summary
        )
        
        return AnalysisResponse(
            id=new_analysis.id,
            resume_id=new_analysis.resume_id,
            ats_score=new_analysis.ats_score,
            extracted_information=new_analysis.extracted_information,
            categorized_skills=new_analysis.categorized_skills,
            strengths=feedback_json.get("strengths", []),
            weaknesses=feedback_json.get("weaknesses", []),
            improvement_suggestions=feedback_json.get("improvement_suggestions", []),
            missing_keywords=feedback_json.get("missing_sections", []),
            resume_summary=new_analysis.resume_summary,
            interview_readiness=feedback_json.get("interview_readiness"),
            resume_rating=feedback_json.get("resume_rating"),
            career_advice=feedback_json.get("career_advice"),
            created_at=new_analysis.created_at
        )
