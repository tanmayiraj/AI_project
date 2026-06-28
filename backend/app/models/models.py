import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Float, JSON, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("Resume", back_populates="owner")
    jobs = relationship("JobDescription", back_populates="owner")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    file_path = Column(String, nullable=False)
    parsed_content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="resumes")
    analyses = relationship("Analysis", back_populates="resume")

class JobDescription(Base):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="jobs")
    analyses = relationship("Analysis", back_populates="job")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resume_id = Column(UUID(as_uuid=True), ForeignKey("resumes.id"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))
    match_score = Column(Float, nullable=False)
    feedback_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    resume = relationship("Resume", back_populates="analyses")
    job = relationship("JobDescription", back_populates="analyses")
