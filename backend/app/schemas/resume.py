from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class ResumeBase(BaseModel):
    original_filename: str = Field(..., description="The original name of the uploaded file.")

class ResumeResponse(ResumeBase):
    id: UUID = Field(..., description="The unique identifier of the resume.")
    user_id: UUID = Field(..., description="The ID of the user who owns the resume.")
    stored_filename: str = Field(..., description="The name of the file stored on the server.")
    file_path: str = Field(..., description="The relative path to the stored file.")
    created_at: datetime = Field(..., description="The timestamp when the resume was uploaded.")
    parsed_content: Optional[str] = Field(None, description="The extracted text from the resume (may be omitted in list views).")

    model_config = ConfigDict(from_attributes=True)

class ResumeUploadResponse(BaseModel):
    message: str = Field(..., description="A success message.")
    resume: ResumeResponse = Field(..., description="The created resume record.")
