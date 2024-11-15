import socketio
from fastapi import FastAPI
from fastapi_socketio import SocketManager
from .audio import AudioController
from fastapi import WebSocket

# Create the FastAPI application
app = FastAPI()

# Create the Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi')

# Configure the SocketManager
socket_manager = SocketManager(app=app, socketio_server=sio)

class WebSocketController:
    def __init__(self):
        # Define Socket.IO events
        @sio.event
        async def connect(sid, environ):
            """
            Handles client connection to Socket.IO
            """
            print(f"Connected: {sid}")

        @sio.event
        async def disconnect(sid):
            """
            Handles client disconnection from Socket.IO
            """
            print(f"Disconnected: {sid}")

        @sio.event
        async def audio_chunk(sid, audio_data):
            """
            Receives real-time audio chunks and transcribes them.
            """
            try:
                # Transcribe the audio chunks using the AudioController
                text = await AudioController.transcribe_audio_chunk(audio_data)
                # Send the transcription back to the client
                await sio.emit("transcription", {"text": text}, to=sid)
            except Exception as e:
                # Send an error message to the client in case of failure
                await sio.emit("error", {"message": str(e)}, to=sid)