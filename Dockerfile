FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends python3 python3-pip python3-venv libglib2.0-0 libgl1 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN python3 -m venv /opt/cutoutbg-venv && /opt/cutoutbg-venv/bin/pip install --no-cache-dir -e '.[ml]'
ENV PATH=/opt/cutoutbg-venv/bin:$PATH
EXPOSE 4100
