#!/bin/bash
set -e
echo "Waiting for PostgreSQL to become available..."

until psql $DATABASE_URL -c '\q'; do

>&2 echo "Postgres is unavailable - sleeping"
sleep 1
done

>&2 echo "Postgres is up - executing command"

echo "Applying database migrations..."

python manage.py migrate --noinput
PORT=${PORT:-8080}

echo "Starting Gunicorn on port $PORT..."
sleep 5


# Start Gunicorn with the correct application path and bind address
exec gunicorn backend.core.wsgi:application --chdir backend --bind 0.0.0.0:$PORT