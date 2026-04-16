# --- Stage 1: Build Frontend ---
FROM node:20-alpine as build-stage
WORKDIR /app/frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ .
RUN npm run build

# --- Stage 2: Runtime ---
FROM python:3.12-slim

# Install system dependencies
# Note: We keep libpq-dev for Python database libraries
RUN apt-get update && apt-get install -y \
    nginx \
    build-essential portaudio19-dev libpq-dev git \
    && rm -rf /var/lib/apt/lists/*

# Setup non-root user for HF Spaces (UID 1000)
RUN useradd -m -u 1000 user
WORKDIR /home/user/app

# Copy Backend and install requirements
COPY --chown=user Backend/requirements.txt ./Backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r Backend/requirements.txt

COPY --chown=user Backend/ ./Backend/
COPY --chown=user --from=build-stage /app/frontend/dist /usr/share/nginx/html

# Copy Configs
COPY --chown=user nginx.conf /etc/nginx/sites-available/default
COPY --chown=user start.sh ./start.sh
RUN chmod +x ./start.sh

# Environment variables
ENV PORT=7860
EXPOSE 7860

# Set the non-root user
USER user

# Run the startup script
CMD ["./start.sh"]