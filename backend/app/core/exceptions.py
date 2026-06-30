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

class GeminiAPIException(Exception):
    def __init__(self, status_code: int, error: str, message: str):
        self.status_code = status_code
        self.error = error
        self.message = message
        super().__init__(message)
