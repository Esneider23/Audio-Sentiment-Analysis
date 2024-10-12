import os
import subprocess
import speech_recognition as sr
from fastapi import Request, UploadFile, File, APIRouter, HTTPException
from fastapi.templating import Jinja2Templates
from src.network import response
from src.config import recognizer

# Initialize templates
templates = Jinja2Templates(directory=os.path.join(os.getcwd(), "src/templates"))

# Define the router for audio routes
audio_router = APIRouter()


def convert_to_wav_pcm(input_path, output_path):
    """
    Convert an audio file to WAV PCM format.
    :param input_path: Path to the input audio file.
    :param output_path: Path to save the output audio file.
    :return: True if the conversion was successful, False otherwise.
    """
    try:
        print(f"Converting {input_path} to WAV PCM format...")
        result = subprocess.run([
            'ffmpeg', '-i', input_path, '-ar', '16000', '-ac', '1', output_path
        ], capture_output=True, text=True, check=True)

        # Logging the output from ffmpeg for debugging
        print("FFmpeg stdout:", result.stdout)
        print("FFmpeg stderr:", result.stderr)

        print(f"Audio converted successfully to {output_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error converting audio: {e}")
        print(f"FFmpeg stdout: {e.stdout}")
        print(f"FFmpeg stderr: {e.stderr}")
        return False


class AudioController:
    """
    Controller class for handling audio-related requests.
    """

    @staticmethod
    async def index(request: Request):
        """
        Render the index page.
        """
        return templates.TemplateResponse("index.html", {"request": request})

    @staticmethod
    async def transcribe_audio(audio_data: UploadFile = File(...)):
        """
        The function transcribes the audio from an uploaded file.
        """
        print("Transcribing audio...")
        tmp_folder = "tmp"
        os.makedirs(tmp_folder, exist_ok=True)

        temp_audio_path = os.path.join(tmp_folder, 'audio.wav')
        converted_audio_path = os.path.join(tmp_folder, 'converted_audio.wav')

        try:
            # Save the audio file temporarily
            with open(temp_audio_path, "wb") as f:
                f.write(await audio_data.read())

            # Log file paths for debugging
            print(f"Temporary audio path: {temp_audio_path}")
            print(f"Converted audio path: {converted_audio_path}")

            # Validate that the file exists and is not empty
            if not os.path.exists(temp_audio_path) or os.path.getsize(temp_audio_path) == 0:
                raise HTTPException(
                    status_code=400, detail="Audio file not found or is empty after saving")

            # Convert audio to WAV PCM if necessary
            if not convert_to_wav_pcm(temp_audio_path, converted_audio_path):
                raise HTTPException(
                    status_code=500, detail="Error converting audio to WAV PCM format")

            # Validate that the converted audio file exists and is not empty
            if not os.path.exists(converted_audio_path) or os.path.getsize(converted_audio_path) == 0:
                raise HTTPException(
                    status_code=500, detail="Converted audio file not found or is empty")

            # Transcribe the audio
            with sr.AudioFile(converted_audio_path) as source:
                audio = recognizer.record(source)
                text = recognizer.recognize_google(audio, language="es-ES")
                return response.success("Audio transcribed successfully", text)

        except sr.UnknownValueError:
            print("Could not understand the audio.")
            return response.error("Could not understand the audio", 400)
        except sr.RequestError as e:
            print(f"Could not request results from Google Speech Recognition service; {e}")
            return response.error(f"Could not request results from Google Speech Recognition service; {e}", 500)
        except Exception as e:
            print(f"Error processing audio: {e}")
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
