"""
This is the main entry point of the FastAPI application
"""
import uvicorn
from src.create_app import create_app
from src.config import settings

app = create_app()

if __name__ == "__main__":
    HOST = "127.0.0.1" if settings.dev_env else "0.0.0.0"
    print(f"Running in development environment: {settings.dev_env}")
    print(f"Server running at http://{HOST}:8000")

    uvicorn.run(
        "run:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.dev_env,
    )
