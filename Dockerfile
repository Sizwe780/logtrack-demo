FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything from repo root
COPY . .

# Collect static files and run migrations
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

EXPOSE 8000

CMD ["gunicorn", "backend.core.wsgi:application", "--bind", "0.0.0.0:8000"]