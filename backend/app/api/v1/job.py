from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.job import (
    JobDescriptionCreate,
    JobDescriptionResponse,
    JobMatchResponse,
)
from app.repositories.job_repository import JobRepository
from app.services.intelligence_service import IntelligenceService
import app.services.pdf_parser as pdf_parser

router = APIRouter()


@router.post("/upload/text", response_model=JobDescriptionResponse)
async def upload_job_text(
    job_in: JobDescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.gemini_service import GeminiService

    details = GeminiService.extract_job_details(job_in.description)

    return JobRepository.create(
        db=db,
        user_id=current_user.id,
        title=job_in.title,
        description=job_in.description,
        company=details.company,
        required_skills=details.required_skills,
        experience=details.experience,
        education=details.education,
    )


@router.post("/upload/pdf", response_model=JobDescriptionResponse)
async def upload_job_pdf(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    import uuid
    import os
    from app.core.config import settings
    from app.services.gemini_service import GeminiService

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    temp_path = os.path.join(
        settings.UPLOAD_DIR,
        f"temp_{uuid.uuid4()}.pdf"
    )

    try:
        # Save uploaded PDF
        content = await file.read()

        with open(temp_path, "wb") as f:
            f.write(content)

        print("=" * 60)
        print("JOB PDF RECEIVED")
        print("Filename:", file.filename)
        print("Temp Path:", temp_path)
        print("=" * 60)

        # Extract text
        parsed_text = pdf_parser.extract_text_from_pdf(temp_path)

        print("TEXT LENGTH:", len(parsed_text))

        if len(parsed_text.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="No text found inside PDF."
            )

        print(parsed_text[:500])

        # Gemini extraction
        details = GeminiService.extract_job_details(parsed_text)

        # Save in DB
        job = JobRepository.create(
            db=db,
            user_id=current_user.id,
            title=title,
            description=parsed_text,
            company=details.company,
            required_skills=details.required_skills,
            experience=details.experience,
            education=details.education,
        )

        print("JOB SAVED SUCCESSFULLY")

        return job

    except Exception as e:
        print("=" * 60)
        print("JOB UPLOAD ERROR")
        print(type(e).__name__)
        print(str(e))
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)


@router.get("", response_model=list[JobDescriptionResponse])
async def list_jobs(
    current_user: User =Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return JobRepository.get_all_for_user(db, current_user.id)


@router.get("/{job_id}", response_model=JobDescriptionResponse)
async def get_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = JobRepository.get_by_id(db, job_id)

    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")

    return job


@router.delete("/{job_id}", status_code=204)
async def delete_job(
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = JobRepository.get_by_id(db, job_id)

    if not job or job.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Job not found")

    JobRepository.delete(db, job)

    return None


@router.post("/match", response_model=JobMatchResponse)
async def match_resume_to_job(
    resume_id: UUID,
    job_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    match, _ = IntelligenceService.match_resume_to_job(
        db,
        resume_id,
        job_id,
        current_user.id,
    )

    return match