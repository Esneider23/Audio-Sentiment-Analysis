# Imagen base de Python
FROM python:3.10-slim

# Instalar ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar únicamente requirements.txt primero para aprovechar la caché
COPY requirements.txt requirements.txt

# Instalar las dependencias antes de copiar todo el código
RUN pip install --no-cache-dir -r requirements.txt

# Descargar el lexicon de nltk
RUN python -m nltk.downloader vader_lexicon

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto
EXPOSE 4000

# Comando para ejecutar la aplicación
CMD ["python", "run.py"]
