from sqlalchemy.orm import Session
from uuid import UUID
from app.models.models import JobMatch, SkillGap, LearningRoadmap, CareerRecommendation

class IntelligenceRepository:
    @staticmethod
    def create_job_match(db: Session, user_id: UUID, resume_id: UUID, job_id: UUID, score: float, detailed_analysis_json: dict | None = None) -> JobMatch:
        match = JobMatch(
            user_id=user_id, 
            resume_id=resume_id, 
            job_id=job_id, 
            match_score=score,
            detailed_analysis_json=detailed_analysis_json
        )
        db.add(match)
        db.commit()
        db.refresh(match)
        return match

    @staticmethod
    def get_job_match(db: Session, resume_id: UUID, job_id: UUID) -> JobMatch | None:
        return db.query(JobMatch).filter(JobMatch.resume_id == resume_id, JobMatch.job_id == job_id).first()

    @staticmethod
    def create_skill_gap(db: Session, user_id: UUID, resume_id: UUID, job_id: UUID, missing_skills_json: dict) -> SkillGap:
        gap = SkillGap(user_id=user_id, resume_id=resume_id, job_id=job_id, missing_skills_json=missing_skills_json)
        db.add(gap)
        db.commit()
        db.refresh(gap)
        return gap

    @staticmethod
    def get_skill_gap(db: Session, resume_id: UUID, job_id: UUID) -> SkillGap | None:
        return db.query(SkillGap).filter(SkillGap.resume_id == resume_id, SkillGap.job_id == job_id).first()

    @staticmethod
    def get_skill_gap_by_resume(db: Session, resume_id: UUID) -> list[SkillGap]:
        return db.query(SkillGap).filter(SkillGap.resume_id == resume_id).all()

    @staticmethod
    def create_roadmap(db: Session, user_id: UUID, resume_id: UUID, roadmap_json: dict) -> LearningRoadmap:
        roadmap = LearningRoadmap(user_id=user_id, resume_id=resume_id, roadmap_json=roadmap_json)
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)
        return roadmap

    @staticmethod
    def get_roadmap(db: Session, resume_id: UUID) -> LearningRoadmap | None:
        return db.query(LearningRoadmap).filter(LearningRoadmap.resume_id == resume_id).order_by(LearningRoadmap.created_at.desc()).first()

    @staticmethod
    def create_career_recommendation(db: Session, user_id: UUID, resume_id: UUID, recommendations_json: dict) -> CareerRecommendation:
        rec = CareerRecommendation(user_id=user_id, resume_id=resume_id, recommendations_json=recommendations_json)
        db.add(rec)
        db.commit()
        db.refresh(rec)
        return rec

    @staticmethod
    def get_career_recommendations(db: Session, resume_id: UUID) -> CareerRecommendation | None:
        return db.query(CareerRecommendation).filter(CareerRecommendation.resume_id == resume_id).order_by(CareerRecommendation.created_at.desc()).first()
