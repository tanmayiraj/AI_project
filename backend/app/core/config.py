from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Career Copilot"
    API_V1_STR: str = "/api/v1"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Database
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_HOST: str
    POSTGRES_PORT: str
    POSTGRES_DB: str

    GEMINI_API_KEY: str

    # Upload
    UPLOAD_DIR: str = "app/uploads"
    MAX_UPLOAD_SIZE: int = 5242880
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".docx", ".txt"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def SQLALCHEMY_DATABASE_URI(self):
        return (
            f"postgresql+psycopg://"
            f"{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}"
            f"/{self.POSTGRES_DB}"
        )


settings = Settings()

print("=" * 60)
print("GEMINI =", settings.GEMINI_API_KEY)
print("LEN =", len(settings.GEMINI_API_KEY))
print("=" * 60)