#!/bin/bash
# Use Railway's dynamic port or fallback to 8080 for consistency with Dockerfile
PORT=${PORT:-8080}
echo "Starting Gunicorn on port $PORT..."
exec gunicorn backend.core.wsgi:application --chdir backend --bind 0.0.0.0:$PORT
