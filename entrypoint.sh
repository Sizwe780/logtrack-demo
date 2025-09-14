#!/bin/bash
set -e
echo "Applying database migrations..."

python manage.py migrate --noinput
PORT=${PORT:-8080}

echo "Starting Gunicorn on port $PORT..."
# Start Gunicorn with the correct application path and bind address
exec gunicorn backend.core.wsgi:application --bind 0.0.0.0:$PORT
