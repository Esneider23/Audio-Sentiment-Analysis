import os
from fastapi import HTTPException
from src.utils.convert_wav import convert_to_wav_pcm

async def handle_audio_file(audio_file, input_audio_path, converted_audio_path):
    """
    Saves the audio file temporarily, validates its existence and size, and converts it to WAV PCM format.

    :param audio_file: The audio file uploaded by the user.
    :param input_audio_path: The temporary path where the original audio file will be saved.
    :param converted_audio_path: The path where the converted audio file will be saved.
    :return: The path of the converted audio file.
    """
    try:
        # Save the audio file temporarily
        with open(input_audio_path, 'wb') as temp_audio:
            temp_audio.write(await audio_file.read())

        # Check if the audio file has been saved correctly
        if not os.path.exists(input_audio_path) or os.path.getsize(input_audio_path) == 0:
            raise HTTPException(
                status_code=400, detail="Audio file not found or empty after saving"
            )

        # Remove the converted audio file if it exists to avoid overwrite issues
        if os.path.exists(converted_audio_path):
            os.remove(converted_audio_path)

        # Convert the audio file to WAV PCM format
        if not convert_to_wav_pcm(input_audio_path, converted_audio_path):
            raise HTTPException(
                status_code=500, detail="Error converting audio file to WAV PCM format"
            )

        # Validate that the converted audio file exists and is not empty
        if not os.path.exists(converted_audio_path) or os.path.getsize(converted_audio_path) == 0:
            raise HTTPException(
                status_code=500, detail="The converted audio file was not found or is empty"
            )

        return converted_audio_path

    except HTTPException as http_exc:
        raise http_exc  # Rethrow known HTTP exceptions
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error processing audio file: {str(e)}"
        ) from e
