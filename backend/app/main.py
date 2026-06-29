import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import engine, Base
from app.models import models
from app.middleware.logging import LoggingMiddleware
from app.core.exceptions import FileValidationException, DuplicateUploadException, ResumeNotFoundException

# NOTE: Dropping tables first during Sprint 1 transition since we added a column
# In production, use Alembic migrations instead.
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists on startup
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="API for AI Career Copilot",
    version="1.0.0"
)

# Add Logging Middleware (Task 4)
app.add_middleware(LoggingMiddleware)

# Set up CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers (Task 3)
@app.exception_handler(FileValidationException)
async def file_validation_exception_handler(request: Request, exc: FileValidationException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(DuplicateUploadException)
async def duplicate_upload_exception_handler(request: Request, exc: DuplicateUploadException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(ResumeNotFoundException)
async def resume_not_found_exception_handler(request: Request, exc: ResumeNotFoundException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.get("/")
def root():
    return {"message": "Welcome to AI Career Copilot API"}

from app.api.v1 import auth, resume

# Include routers
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"],
)

app.include_router(
    resume.router,
    prefix=f"{settings.API_V1_STR}/resume",
    tags=["Resume"],
)
