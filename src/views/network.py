"""
The module contains the routes for the FastAPI application.
"""

from fastapi import APIRouter, Request, UploadFile, File, WebSocket
from .controllers.audio import AudioController
from .controllers.ia import IAController
from .controllers.websocket import WebSocketController

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


@views_router.post("/analyze-transcription")
async def analyze_sentiment(request: Request):
    """
    Analyzes the sentiment of the given transcription.
    """
    data = await request.json()
    transcription = data.get("transcription")
    ia_controller = IAController()
    return ia_controller.analyze_sentiment_transcription(transcription)

@views_router.post("/predict-emotion")
async def predict_emotion(audio_data: UploadFile = File(...)):
    """
    Predicts the emotion from the audio file.
    """
    ia_controller = IAController()
    return await ia_controller.analyze_sentiment_audio(audio_data)


@views_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    The function handles the websocket connection.
    """
    ws_controller = WebSocketController()
    return await ws_controller.websocket_endpoint(websocket)
