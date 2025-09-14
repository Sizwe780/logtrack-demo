#!/bin/bash
# Use Railway's dynamic port or default to 8000
PORT=${PORT:-8000}
exec gunicorn backend.core.wsgi:application --chdir backend --bind 0.0.0.0:$PORT