FROM python:3.11-slim

# Set the working directory to the app directory
WORKDIR /app

# Copy the entire project into the container
COPY . .

# Install dependencies from the requirements file
RUN pip install --no-cache-dir -r requirements.txt

# Change directory to the backend folder to run Django commands
WORKDIR /app/backend

# Run migrations and collect static files
RUN python manage.py migrate --noinput
RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8000

# Command to run the application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "core.wsgi:application"]
