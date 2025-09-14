# Use the official Python image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project
COPY . .

# Expose the port
EXPOSE 8080

# Command to run the application
# It will run migrations and then start the Gunicorn server
CMD python manage.py migrate --noinput && gunicorn backend.core.wsgi:application --chdir backend --bind 0.0.0.0:${PORT:-8080}
