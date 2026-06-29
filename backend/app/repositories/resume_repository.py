from sqlalchemy.orm import Session
from uuid import UUID
from app.models.models import Resume

class ResumeRepository:
    @staticmethod
    def create(
        db: Session, 
        user_id: UUID, 
        original_filename: str, 
        stored_filename: str, 
        file_path: str, 
        parsed_content: str
    ) -> Resume:
        resume = Resume(
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            parsed_content=parsed_content
        )
        db.add(resume)
        db.commit()
        db.refresh(resume)
        return resume

    @staticmethod
    def get_by_user(db: Session, user_id: UUID) -> list[Resume]:
        return db.query(Resume).filter(Resume.user_id == user_id).all()

    @staticmethod
    def get_by_id_and_user(db: Session, resume_id: UUID, user_id: UUID) -> Resume | None:
        return db.query(Resume).filter(
            Resume.id == resume_id, 
            Resume.user_id == user_id
        ).first()

    @staticmethod
    def delete(db: Session, resume: Resume) -> None:
        db.delete(resume)
        db.commit()
