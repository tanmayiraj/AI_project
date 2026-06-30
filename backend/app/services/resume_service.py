import os
import uuid
import shutil
from fastapi import UploadFile
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.config import settings
from app.core.exceptions import FileValidationException, ResumeNotFoundException
from app.repositories.resume_repository import ResumeRepository
from app.services.pdf_parser import extract_text_from_pdf


class ResumeService:
    @staticmethod
    def process_and_save_resume(db: Session, user_id: UUID, file: UploadFile):

        print("STEP 1 - Started upload")

        # 1. Validation
        if not file.filename.endswith(tuple(settings.ALLOWED_EXTENSIONS)):
            raise FileValidationException(
                f"Invalid file type. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        print("STEP 2 - File validation passed")

        file_content = file.file.read()

        print("STEP 3 - File read completed")

        if len(file_content) > settings.MAX_UPLOAD_SIZE:
            raise FileValidationException(
                f"File size exceeds the maximum limit of {settings.MAX_UPLOAD_SIZE} bytes."
            )

        file.file.seek(0)

        print("STEP 4 - File pointer reset")

        # 2. Setup Storage
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

        original_filename = file.filename
        file_extension = os.path.splitext(original_filename)[1]
        stored_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

        print("STEP 5 - Storage path created")

        # 3. Save File
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("STEP 6 - File saved")

        # 4. Extract Text
        try:
            parsed_content = extract_text_from_pdf(file_path)
            print("STEP 7 - PDF parsed successfully")
        except Exception as e:
            print("PDF ERROR:", str(e))
            if os.path.exists(file_path):
                os.remove(file_path)
            raise FileValidationException(f"Failed to parse PDF: {str(e)}")

        # 5. Database Persistence
        print("STEP 8 - Saving to database")

        resume = ResumeRepository.create(
            db=db,
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            parsed_content=parsed_content,
        )

        print("STEP 9 - Database saved successfully")

        return resume

    @staticmethod
    def get_user_resumes(db: Session, user_id: UUID):
        return ResumeRepository.get_by_user(db, user_id)

    @staticmethod
    def get_resume(db: Session, resume_id: UUID, user_id: UUID):
        resume = ResumeRepository.get_by_id_and_user(db, resume_id, user_id)
        if not resume:
            raise ResumeNotFoundException()
        
        # Build dictionary to include analysis
        resume_dict = {
            "id": resume.id,
            "user_id": resume.user_id,
            "original_filename": resume.original_filename,
            "stored_filename": resume.stored_filename,
            "file_path": resume.file_path,
            "parsed_content": resume.parsed_content,
            "created_at": resume.created_at,
            "analysis": None
        }

        if getattr(resume, "resume_analysis", None):
            analysis = resume.resume_analysis
            resume_dict["analysis"] = {
                "ats_score": analysis.ats_score,
                "extracted_information": analysis.extracted_information,
                "categorized_skills": analysis.categorized_skills,
                "feedback_json": analysis.feedback_json,
                "resume_summary": analysis.resume_summary,
                "created_at": analysis.created_at
            }
        
        return resume_dict

    @staticmethod
    def delete_resume(db: Session, resume_id: UUID, user_id: UUID):
        resume = ResumeRepository.get_by_id_and_user(db, resume_id, user_id)
        if not resume:
            raise ResumeNotFoundException()

        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)

        ResumeRepository.delete(db, resume)