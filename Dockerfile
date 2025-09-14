FROM python:3.11

# Set working directory inside the container
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy everything from repo root
COPY . .

# Collect static files and run migrations
# This step is crucial for production deployments
RUN python manage.py collectstatic --noinput

# The next two commands will create and apply the database migrations
RUN python manage.py makemigrations trips
RUN python manage.py migrate

# Expose the port that Gunicorn is listening on
EXPOSE 8080

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
