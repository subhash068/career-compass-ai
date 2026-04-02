# Multi-stage Dockerfile for optimized build
FROM python:3.11 AS builder
WORKDIR /app
# Upgrade pip first
RUN pip install --no-cache-dir --upgrade pip
# Copy requirements first for caching
COPY requirements.txt .
# Install PyTorch CPU version first (largest dep, cache layer)
RUN pip install --no-cache-dir \
    torch torchvision