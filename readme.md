# Audio Sentiment Analysis App

Este proyecto es una aplicación para el análisis de sentimiento y detección de emociones a partir de archivos de audio. Utiliza modelos avanzados de reconocimiento de voz para transcribir audio y aplicar análisis de sentimiento y clasificación emocional, incluyendo emociones como felicidad, tristeza, enojo, miedo y neutralidad.

## Características

- Transcripción automática de audio en texto despues de terminar de grabar el audio.
- Análisis de sentimientos a partir de la transcripción.
- Detección de emociones en el audio.
- API REST con FastAPI.
- Contenedor Docker para fácil despliegue.

## Requisitos

Antes de comenzar, asegúrate de tener los siguientes requisitos instalados en tu máquina:

- [Docker](https://www.docker.com/products/docker-desktop) (necesario para construir y ejecutar la aplicación).

## Pasos para la instalación

Sigue estos pasos para configurar y ejecutar la aplicación en tu máquina local.

### 1. Clonar el repositorio

Primero, clona el repositorio en tu máquina local utilizando Git:

```bash
git https://github.com/Esneider23/Audio-Sentiment-Analysis.git
cd audio-sentiment-analysis
```

### 2. Crea el archivo .env

En base al archivo .env.example construye el archivo .env el cual sera utilizado para las varibles de entorno

### 3. Construir la imagen de Docker
Ejecuta el siguiente comando para construir la imagen de Docker de la aplicación:
```bash
docker build -t my-audio-app .
```

### 4. Ejecutar la aplicación
Una vez que la imagen haya sido construida, ejecuta el siguiente comando para iniciar la aplicación en un contenedor Docker
```bash
docker run -p 8000:8000 --env-file .env my-audio-app
```
### 5. Entra a la App
http://127.0.0.1:8000
