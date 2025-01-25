# Imagen base de Python
FROM python:3.10-slim

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar únicamente requirements.txt primero para aprovechar la caché
COPY requirements.txt .

# Instalar las dependencias antes de copiar todo el código
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de los archivos de la aplicación
COPY . .

# Exponer el puerto
EXPOSE 4000

# Comando para ejecutar la aplicación
CMD ["python", "run.py"]
