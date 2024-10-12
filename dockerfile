# Imagen base de Python
FROM python:3.10-slim

# Instalar ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos necesarios
COPY requirements.txt requirements.txt
COPY .env .env
COPY run.py run.py
COPY src/ src/

# Instalar las dependencias
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m nltk.downloader vader_lexicon

# Exponer el puerto si tu aplicación corre en uno específico (modificar según el caso)
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["python", "run.py"]
