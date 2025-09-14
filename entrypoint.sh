#!/bin/bash
# Use Railway's dynamic port or fallback to 8000
PORT=${PORT:-8000}
echo "Starting Gunicorn on port $PORT..."
exec gunicorn backend.core.wsgi:application --chdir backend --bind 0.0.0.0:$PORT