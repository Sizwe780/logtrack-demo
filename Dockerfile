FROM python:3.11-slim

# Set the working directory to the root of the app
WORKDIR /app

# Copy the entire project into the container
# This ensures that manage.py, requirements.txt, and the backend folder are all present.
COPY . .

# Install dependencies from the requirements file
RUN pip install --no-cache-dir -r requirements.txt

# Run migrations and collect static files
# These commands are run from the same directory where manage.py is located.
RUN python manage.py migrate --noinput
RUN python manage.py collectstatic --noinput

# Expose the port
EXPOSE 8000

# Command to run the application
# We use the correct, full Python path from the project root.
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "backend.core.wsgi:application"]
