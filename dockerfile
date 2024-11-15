# Imagen base de Python
FROM python:3.10-slim

# Instalar dependencias del sistema necesarias para audio y otras bibliotecas
RUN apt-get update && apt-get install -y ffmpeg libsndfile1

# Actualizar pip
RUN pip install --upgrade pip

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar únicamente requirements.txt primero para aprovechar la caché
COPY requirements.txt /app/requirements.txt

# Instalar las dependencias antes de copiar todo el código
RUN pip install --no-cache-dir -r /app/requirements.txt

# Descargar el lexicon de nltk
RUN python -m nltk.downloader vader_lexicon

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto
EXPOSE 8000

# Comando para ejecutar la aplicación
CMD ["python", "run.py"]
