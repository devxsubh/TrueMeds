FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py ./
COPY utils.py ./
COPY model/ ./model/

# Copy checkpoints from parent directory at runtime via volume mount

EXPOSE 8000

CMD ["python", "app.py"]

