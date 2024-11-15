"""
The module contains the audio processing logic.
"""
import os
import speech_recognition as sr
from fastapi import APIRouter, Request, UploadFile, File, FastAPI
from fastapi.templating import Jinja2Templates
from io import BytesIO
from src.network import response
from src.config import recognizer
from src.utils.create_folder import create_temp_folder, get_temp_file_path
from src.utils.handle_audio_file import handle_audio_file
import socketio
sio = socketio.AsyncServer(async_mode='asgi')
from fastapi_socketio import SocketManager


# Initialize templates
templates = Jinja2Templates(directory=os.path.join(os.getcwd(), "src/templates"))

# Define the router for audio routes
audio_router = APIRouter()


class AudioController:
    """
    Controller for handling audio requests.
    """

    @staticmethod
    async def index(request: Request):
        """
        Renders the index page.
        """
        return templates.TemplateResponse("index.html", {"request": request})

    @staticmethod
    async def transcribe_audio(audio_data: UploadFile = File(...)):
        """
        Function to transcribe audio from an uploaded file.
        """
        print("Transcribing audio...")
        tmp_folder = create_temp_folder("tmp")
        temp_audio_path = get_temp_file_path(tmp_folder, 'audio.wav')
        converted_audio_path = get_temp_file_path(tmp_folder, 'converted_audio.wav')

        try:
            # Process the uploaded audio file
            audio_path = await handle_audio_file(audio_data, temp_audio_path, converted_audio_path)

            # Transcribe the entire audio
            with sr.AudioFile(audio_path) as source:
                audio = recognizer.record(source)
                text = recognizer.recognize_google(audio, language="es-ES")
                return response.success("Audio transcribed successfully", text)

        except sr.UnknownValueError:
            print("Could not understand the audio.")
            return response.error("Could not understand the audio", 400)
        except sr.RequestError as e:
            print(f"Could not request results from the Google Speech Recognition service; {e}")
            return response.error(f"Could not request results from the Google Speech Recognition service; {e}", 500)
        except Exception as e:
            print(f"Error processing the audio: {e}")
            return response.error(f"An error occurred: {str(e)}", 500)
        finally:
            # Clean up temporary files after processing
            try:
                if os.path.exists(temp_audio_path):
                    os.remove(temp_audio_path)
                if os.path.exists(converted_audio_path):
                    os.remove(converted_audio_path)
                print("Temporary audio files deleted successfully.")
            except Exception as cleanup_error:
                print(f"Error during cleanup: {cleanup_error}")
    
    @staticmethod
    async def transcribe_audio_chunk(audio_chunk: bytes) -> str:
        """
        Transcribe un fragmento de audio recibido en tiempo real.
        """
        audio_io = BytesIO(audio_chunk)
        with sr.AudioFile(audio_io) as source:
            audio = recognizer.record(source)
            return recognizer.recognize_google(audio, language="es-ES")