"""
This module contains the FastAPI application factory.
"""

from pathlib import Path
from starlette.staticfiles import StaticFiles
from fastapi import FastAPI
from src.views.network import views_router
from fastapi.templating import Jinja2Templates
import os

def create_app() -> FastAPI:
    """
    Create and configure the FastAPI application.
    :return: The configured FastAPI application
    """
    # Get the base directory of the current file
    BASE_DIR = Path(__file__).resolve().parent

    # Configure Jinja2 templates directory
    templates = Jinja2Templates(directory=os.path.join(os.getcwd(), "src/templates"))

    print(f"Templates Directory: {BASE_DIR / 'templates'}")

    # Create the FastAPI app instance
    app = FastAPI()

    # Mount the static files directory for serving CSS, JS, etc.
    app.mount(
        "/static", StaticFiles(directory=str(BASE_DIR / "static")), name="static")

    # Include your router directly
    app.include_router(views_router)


    return app
