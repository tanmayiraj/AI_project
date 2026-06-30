from sqlalchemy.orm import Session
from uuid import UUID
from typing import Any
from app.models.models import JobDescription

class JobRepository:
    @staticmethod
    def create(
        db: Session, user_id: UUID, title: str, description: str,
        company: str | None = None,
        required_skills: Any = None,
        experience: str | None = None,
        education: str | None = None
    ) -> JobDescription:
        job = JobDescription(
            user_id=user_id,
            title=title,
            description=description,
            company=company,
            required_skills=required_skills,
            experience=experience,
            education=education
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job

    @staticmethod
    def get_by_id(db: Session, job_id: UUID) -> JobDescription | None:
        return db.query(JobDescription).filter(JobDescription.id == job_id).first()

    @staticmethod
    def get_all_for_user(db: Session, user_id: UUID) -> list[JobDescription]:
        return db.query(JobDescription).filter(JobDescription.user_id == user_id).all()

    @staticmethod
    def delete(db: Session, job: JobDescription) -> None:
        db.delete(job)
        db.commit()
