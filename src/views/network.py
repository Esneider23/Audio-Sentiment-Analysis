"""
The module contains the routes for the FastAPI application.
"""

from fastapi import APIRouter, Request, UploadFile, File, HTTPException
from .controllers.audio import AudioController
from .controllers.ia import IAController

views_router = APIRouter()

@views_router.get("/")
async def index(request: Request):  # Accept request parameter
    """
    Render the index page.
    """
    return await AudioController.index(request)

@views_router.post("/transcribe")
async def transcribe_audio(audio_data: UploadFile = File(...)):
    """
    The audio received by the front-end is transcribed.
    """
    return await AudioController.transcribe_audio(audio_data)

@views_router.post("/analyze")
async def analyze_sentiment(request: Request):
    """
    Analyzes the sentiment of the given transcription.
    """
    data = await request.json()
    transcription = data.get("transcription")
    ia_controller = IAController()
    return ia_controller.analyze_sentiment(transcription)
