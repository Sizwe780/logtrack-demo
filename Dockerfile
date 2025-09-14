FROM python:3.11

# Set the working directory to the project root in the container.
# This is the directory where manage.py is located.
WORKDIR /app

# Copy the requirements file and install dependencies first for better caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the project files into the container.
COPY . .

# Run Django commands using the correct path from the working directory.
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

# Expose the port for Gunicorn.
EXPOSE 8080

# The entrypoint script is also copied and made executable.
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Start the application.
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
