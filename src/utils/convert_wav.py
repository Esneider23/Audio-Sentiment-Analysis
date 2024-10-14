"""
The module contains the logic to convert an audio file to WAV PCM format and create the folder tmp.
"""

import subprocess


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
