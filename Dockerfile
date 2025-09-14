# Use the official Python image
FROM python:3.11-slim

# Set the working directory to the 'backend' directory
WORKDIR /app/backend

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Run migrations and collect static files
RUN python manage.py migrate --noinput
RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]