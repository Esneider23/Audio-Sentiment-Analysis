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


## A tener en cuenta

### 1. Analisis
En esta aplicación tenemos en cuenta dos tipos de analisis:  
-  A) Analisis por transcripción:
el primero corresponde a un analisis de texto el cual nace por el procesamiento del audio y luego procesamiento del texto utilizando mecanismo de IA para poder indicar el sentimiento que se encuentra en el texto
- B) Analisis por audio:
En este segundo analisis se utiliza directamanete el audio que fue grabado se utiliza se utilizan modelos de inteligencia artificial gratuitos para poder realizar dicha tarea.

### Resultados
Luego de realizar ambos analisis puede existir diferencias las cuales son normales debido al tipo de analisis y la forma en como se procede puesto que mientras a nivel de analisis de texto no se tiene en cuenta la fuerza las palabras, entonaciones o cualquier modismo que pueda identificar fuertes sentimientos ya que al ser texto plano no se entienden diferencias claros, en el tipo de analisis por audio pueden existir cambios por sea por el ruido del mismo, o cualquier otro distrayente.
