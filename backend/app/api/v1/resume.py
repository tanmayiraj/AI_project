from fastapi import APIRouter, Depends, UploadFile, File, status, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.models import User
from app.schemas.resume import ResumeResponse, ResumeUploadResponse
from app.services.resume_service import ResumeService
from app.core.exceptions import ResumeNotFoundException

router = APIRouter()

@router.post(
    "/upload", 
    response_model=ResumeUploadResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Upload a resume",
    description="Uploads a PDF resume, parses the text, and stores it in the database and local storage."
)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = ResumeService.process_and_save_resume(db, current_user.id, file)
    return ResumeUploadResponse(
        message="Resume uploaded successfully",
        resume=resume
    )

@router.get(
    "", 
    response_model=list[ResumeResponse],
    summary="Get all user resumes",
    description="Retrieves a list of all resumes uploaded by the current authenticated user."
)
async def get_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ResumeService.get_user_resumes(db, current_user.id)

@router.get(
    "/{resume_id}", 
    response_model=ResumeResponse,
    summary="Get a specific resume",
    description="Retrieves the details of a specific resume by its ID."
)
async def get_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return ResumeService.get_resume(db, resume_id, current_user.id)

@router.delete(
    "/{resume_id}", 
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a resume",
    description="Deletes a specific resume by its ID from the database and local storage."
)
async def delete_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ResumeService.delete_resume(db, resume_id, current_user.id)
    return None

@router.post(
    "/analyze/{resume_id}",
    summary="Analyze a resume",
    description="Uses Gemini AI to extract information, categorize skills, and score the resume."
)
async def analyze_resume(
    resume_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from app.services.resume_analyzer import ResumeAnalyzer
    return ResumeAnalyzer.analyze_and_store(db, resume_id, current_user.id)