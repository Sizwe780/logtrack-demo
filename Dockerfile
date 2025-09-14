FROM python:3.11

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend folder into container
COPY backend/ ./backend

# Set working directory to backend (where manage.py lives)
WORKDIR /app/backend

# Collect static files and run migrations
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

EXPOSE 8000

CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]