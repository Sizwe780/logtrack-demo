FROM python:3.11

# Set the working directory to the project root in the container.
WORKDIR /app

# Copy the requirements file and install dependencies first for better caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project files into the container.
COPY . .

# Run Django commands. The `migrate` command is now configured to handle the database
# URL correctly via a direct environment variable.
RUN DATABASE_URL=sqlite:///db.sqlite3 python manage.py collectstatic --noinput
RUN DATABASE_URL=sqlite:///db.sqlite3 python manage.py migrate

# Expose the port for Gunicorn.
EXPOSE 8080

# The entrypoint script is also copied and made executable.
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Start the application.
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
