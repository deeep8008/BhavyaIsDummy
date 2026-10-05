import os
from pathlib import Path
from dataclasses import dataclass, field

@dataclass
class Settings:
    PROJECT_NAME: str = "ForecastIQ Backend"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Root paths
    BACKEND_DIR: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent)
    ROOT_PROJECT_DIR: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent.parent)
    
    # Storage paths
    STORAGE_DIR: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "storage")
    UPLOADS_DIR: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "storage" / "uploads")
    PROCESSED_DIR: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "storage" / "processed")
    ARTIFACTS_DIR: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "storage" / "artifacts")
    RESULTS_DIR: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent / "storage" / "results")
    
    # Pre-existing benchmark datasets path
    DATASETS_DIR: Path = field(default_factory=lambda: Path(__file__).resolve().parent.parent.parent.parent / "datasets")
    
    # Allowed CORS Origins for frontend
    CORS_ORIGINS: list = field(default_factory=lambda: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ])

    def setup_directories(self) -> None:
        """Ensures all necessary local storage directories exist."""
        for path in [
            self.STORAGE_DIR,
            self.UPLOADS_DIR,
            self.PROCESSED_DIR,
            self.ARTIFACTS_DIR,
            self.RESULTS_DIR,
        ]:
            path.mkdir(parents=True, exist_ok=True)

settings = Settings()
settings.setup_directories()

