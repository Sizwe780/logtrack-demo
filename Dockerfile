FROM python:3.11

# Set working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the backend contents
COPY backend/manage.py /app/
COPY backend/core /app/core
COPY backend/trips /app/trips

# Collect static files and run migrations
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

EXPOSE 8000

CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]