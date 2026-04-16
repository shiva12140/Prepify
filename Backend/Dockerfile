# Use official Python runtime
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    portaudio19-dev \
    libpq-dev \
    python3-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# ✅ FIX 1: Upgrade pip to the latest version to avoid hash bugs
RUN pip install --upgrade pip

COPY requirements.txt .

# ✅ FIX 2: Install CPU-only PyTorch first
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# ✅ FIX 3: Install other requirements pointing to the CPU index
# This prevents it from trying to re-download the huge GPU version of torch
RUN pip install --no-cache-dir -r requirements.txt --extra-index-url https://download.pytorch.org/whl/cpu

# Copy the rest of the application code
COPY . .

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["python", "run.py"]