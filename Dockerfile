FROM python:3.11

# Set the working directory to the project root in the container.
WORKDIR /app

# Copy the requirements file and install dependencies first for better caching.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire project into the container's /app directory.
COPY . .

# Run Django commands using the correct path.
RUN python backend/manage.py collectstatic --noinput
RUN python backend/manage.py migrate

# Expose the port for Gunicorn.
EXPOSE 8080

# Copy and make the entrypoint script executable.
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Start the application.
ENTRYPOINT ["/bin/sh", "entrypoint.sh"]
