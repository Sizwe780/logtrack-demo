# Stage 1: Build dependencies
FROM python:3.11-slim as builder

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Final image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the installed dependencies from the builder stage
COPY --from=builder /app /app

# Copy the entire project
COPY . .

# Run migrations and collect static files
RUN python manage.py migrate --noinput
RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8000

# Command to run the application
# It will start the Gunicorn web server
CMD ["gunicorn", "backend.core.wsgi:application", "--bind", "0.0.0.0:8000"]
