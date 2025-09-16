# Use a slim Python image for a smaller container size
FROM python:3.11-slim

# Set the working directory to the root of the app
WORKDIR /app

# Copy the entire project into the container
COPY . .

# Install dependencies from the requirements file
RUN pip install --no-cache-dir -r requirements.txt

# Run migrations and collect static files
RUN python manage.py migrate --noinput
RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8000

# Command to run the application using Gunicorn
# This is the line that makes your app start
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.core.wsgi:application"]
