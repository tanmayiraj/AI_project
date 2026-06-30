from sqlalchemy.orm import Session
from uuid import UUID
import logging
import traceback
from app.services.gemini_service import GeminiService
from app.services.job_matcher import JobMatcherService
from app.repositories.resume_repository import ResumeRepository
from app.repositories.job_repository import JobRepository
from app.repositories.intelligence_repository import IntelligenceRepository
from app.schemas.job import JobMatchResponse
from app.schemas.intelligence import SkillGapResponse, LearningRoadmapResponse, CareerRecommendationResponse
from fastapi import HTTPException

logger = logging.getLogger(__name__)

class IntelligenceService:
    @staticmethod
    def match_resume_to_job(db: Session, resume_id: UUID, job_id: UUID, user_id: UUID):
        try:
            print("=" * 60)
            print("STEP 1 - Fetch Resume")

            resume = ResumeRepository.get_by_id_and_user(
                db,
                resume_id,
                user_id
            )

            print("STEP 2 - Fetch Job")

            job = JobRepository.get_by_id(
                db,
                job_id
            )

            if not resume:
                raise HTTPException(status_code=404, detail="Resume not found")

            if not job:
                raise HTTPException(status_code=404, detail="Job not found")
                
            # Prevent IntegrityError/Duplicate matches
            existing_match = IntelligenceRepository.get_job_match(db, resume_id, job_id)
            if existing_match:
                db.delete(existing_match)
                db.commit()
                
            existing_gap = IntelligenceRepository.get_skill_gap(db, resume_id, job_id)
            if existing_gap:
                db.delete(existing_gap)
                db.commit()

            print("STEP 3 - Calling Gemini Detailed Match")

            detailed_match_schema = GeminiService.generate_detailed_match(
                resume.parsed_content,
                job.description
            )

            print("STEP 4 - Gemini Detailed Match Success")

            match = IntelligenceRepository.create_job_match(
                db=db,
                user_id=user_id,
                resume_id=resume_id,
                job_id=job_id,
                score=detailed_match_schema.ats_match_score,
                detailed_analysis_json=detailed_match_schema.model_dump(mode="json")
            )

            print("STEP 5 - Detect Skill Gap")

            gap_schema = GeminiService.detect_skill_gap(
                resume.parsed_content,
                job.description
            )

            print("STEP 6 - Skill Gap Generated")

            gap = IntelligenceRepository.create_skill_gap(
                db,
                user_id,
                resume_id,
                job_id,
                gap_schema.model_dump(mode="json")
            )

            print("STEP 7 - Returning Response")

            return (
                JobMatchResponse.model_validate(match),
                SkillGapResponse(
                    id=gap.id,
                    resume_id=gap.resume_id,
                    job_id=gap.job_id,
                    missing_skills=gap_schema.model_dump(mode="json"),
                    created_at=gap.created_at
                )
            )

        except Exception as e:
            # Let GeminiAPIException bubble up to the global handler
            from app.core.exceptions import GeminiAPIException
            if isinstance(e, GeminiAPIException):
                raise
                
            print("=" * 60)
            print("MATCH ERROR IN intelligence_service.py")
            traceback.print_exc()
            print("Exact exception message:", str(e))
            print("=" * 60)
            raise HTTPException(status_code=500, detail=f"AI Match Engine Failed: {str(e)}")

    @staticmethod
    def get_skill_gaps(db: Session, resume_id: UUID, user_id: UUID) -> list[SkillGapResponse]:
        gaps = IntelligenceRepository.get_skill_gap_by_resume(db, resume_id)
        responses = []
        for gap in gaps:
            responses.append(SkillGapResponse(
                id=gap.id, resume_id=gap.resume_id, job_id=gap.job_id,
                missing_skills=gap.missing_skills_json, created_at=gap.created_at
            ))
        return responses

    @staticmethod
    def generate_roadmap(db: Session, resume_id: UUID, user_id: UUID) -> LearningRoadmapResponse:
        resume = ResumeRepository.get_by_id_and_user(db, resume_id, user_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        gaps = IntelligenceRepository.get_skill_gap_by_resume(db, resume_id)
        if not gaps:
            raise HTTPException(status_code=400, detail="No skill gaps found to generate a roadmap. Match with a job first.")
        
        all_missing = []
        for gap in gaps:
            skills_dict = gap.missing_skills_json
            for category, skills in skills_dict.items():
                if isinstance(skills, list):
                    all_missing.extend(skills)
        
        unique_missing = list(set(all_missing))
        
        roadmap_schema = GeminiService.generate_learning_roadmap(unique_missing)
        roadmap = IntelligenceRepository.create_roadmap(db, user_id, resume_id, roadmap_schema.model_dump(mode="json"))
        
        return LearningRoadmapResponse(
            id=roadmap.id, resume_id=roadmap.resume_id,
            roadmap=roadmap.roadmap_json,
            progress_percentage=roadmap.progress_percentage, created_at=roadmap.created_at
        )

    @staticmethod
    def get_career_recommendations(db: Session, resume_id: UUID, user_id: UUID) -> CareerRecommendationResponse:
        resume = ResumeRepository.get_by_id_and_user(db, resume_id, user_id)
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")

        existing = IntelligenceRepository.get_career_recommendations(db, resume_id)
        if existing:
            return CareerRecommendationResponse(
                id=existing.id, resume_id=existing.resume_id,
                recommendations=existing.recommendations_json.get("recommendations", []),
                created_at=existing.created_at
            )

        rec_schema = GeminiService.generate_career_recommendations(resume.parsed_content)
        rec = IntelligenceRepository.create_career_recommendation(db, user_id, resume_id, rec_schema.model_dump(mode="json"))
        
        return CareerRecommendationResponse(
            id=rec.id, resume_id=rec.resume_id,
            recommendations=[r.model_dump() for r in rec_schema.recommendations],
            created_at=rec.created_at
        )
