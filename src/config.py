"""
This module contains the configuration settings for the FastAPI application.
"""

import speech_recognition as sr
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Cargar las variables de entorno del archivo .env
load_dotenv()

class Settings(BaseSettings):
    """
    Configuration settings for the application, using Pydantic for validation.
    """
    dev_env: bool = False  # Valor por defecto si no está en el .env

    class Config:
        """
        Configuration settings for the Pydantic model.
        """
        env_file = ".env"  # Especifica el archivo .env

# Inicializar las configuraciones
settings = Settings()

# Inicializar el reconocedor de voz
recognizer = sr.Recognizer()

# Utiliza la variable settings.dev_env en lugar de os.getenv
print(settings.dev_env)
