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
        # 1. Validation
        if not file.filename.endswith(tuple(settings.ALLOWED_EXTENSIONS)):
            raise FileValidationException(f"Invalid file type. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}")
        
        # We can't strictly check size before reading in FastAPI without reading chunks,
        # but a basic check can be done reading into memory or spooling.
        # For simplicity and given prompt rules, we'll read and check size.
        file_content = file.file.read()
        if len(file_content) > settings.MAX_UPLOAD_SIZE:
            raise FileValidationException(f"File size exceeds the maximum limit of {settings.MAX_UPLOAD_SIZE} bytes.")
        
        # Reset file pointer after reading for saving
        file.file.seek(0)
        
        # 2. Setup Storage
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        original_filename = file.filename
        file_extension = os.path.splitext(original_filename)[1]
        stored_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, stored_filename)

        # 3. Save File
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 4. Extract Text
        try:
            parsed_content = extract_text_from_pdf(file_path)
        except Exception as e:
            # If parsing fails, we should probably delete the file and raise
            if os.path.exists(file_path):
                os.remove(file_path)
            raise FileValidationException(f"Failed to parse PDF: {str(e)}")

        # 5. Database Persistence
        return ResumeRepository.create(
            db=db,
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_path=file_path,
            parsed_content=parsed_content
        )

    @staticmethod
    def get_user_resumes(db: Session, user_id: UUID):
        return ResumeRepository.get_by_user(db, user_id)

    @staticmethod
    def get_resume(db: Session, resume_id: UUID, user_id: UUID):
        resume = ResumeRepository.get_by_id_and_user(db, resume_id, user_id)
        if not resume:
            raise ResumeNotFoundException()
        return resume

    @staticmethod
    def delete_resume(db: Session, resume_id: UUID, user_id: UUID):
        resume = ResumeRepository.get_by_id_and_user(db, resume_id, user_id)
        if not resume:
            raise ResumeNotFoundException()
        
        # Delete file from disk
        if os.path.exists(resume.file_path):
            os.remove(resume.file_path)
            
        # Delete from DB
        ResumeRepository.delete(db, resume)
