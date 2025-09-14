FROM python:3.11

# Set the working directory to the root of your Django project.
WORKDIR /app/backend

# Copy the requirements file and install dependencies first for better caching.
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy the entire project into the container's working directory.
COPY . /app

# The commands now directly reference the files within the working directory.
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

# Expose the port for Gunicorn.
EXPOSE 8080

# The entrypoint script is also copied and made executable.
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Start the application.
ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]