FROM python:3.11-slim

# Set the working directory to the 'backend' directory
WORKDIR /app

# Copy the entire project into the container
COPY . .

# Set the new working directory to the 'backend' folder
WORKDIR /app/backend

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Run migrations and collect static files
RUN python manage.py migrate --noinput
RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]