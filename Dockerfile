FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything from repo root
COPY . .

# Collect static files and create migration files
# We only create the migration files during the build, not apply them.
RUN python manage.py collectstatic --noinput
RUN python manage.py makemigrations trips

# Expose the port that Gunicorn is listening on
EXPOSE 8080

# Copy and set permissions for the entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# The entrypoint script will handle migrations at runtime
ENTRYPOINT ["/entrypoint.sh"]