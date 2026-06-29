from fastapi import HTTPException, status

class FileValidationException(HTTPException):
    def __init__(self, detail: str):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class DuplicateUploadException(HTTPException):
    def __init__(self, detail: str = "A file with this name has already been uploaded."):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)

class ResumeNotFoundException(HTTPException):
    def __init__(self, detail: str = "Resume not found."):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
