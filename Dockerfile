# Use the official Python image as the base image for your Docker container.
# This version is based on Debian Linux and includes Python 3.11.
FROM python:3.11-slim

# Set environment variables to prevent Python from writing .pyc files and
# to ensure stdout/stderr streams are unbuffered. This is important for
# real-time logging.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container to /app.
WORKDIR /app

# Copy the requirements file into the container.
COPY requirements.txt .

# Install the Python dependencies from the requirements file.
# The --no-cache-dir flag prevents the pip cache from being stored in the image,
# which reduces the final image size.
RUN pip install --no-cache-dir -r requirements.txt

# Copy all the project files from your local directory into the container's /app directory.
COPY . .

# Set the file permissions for the entrypoint script to make it executable.
# This is a critical step to ensure the script can run when the container starts.
RUN chmod +x entrypoint.sh

# The `ENTRYPOINT` command specifies the script that the container will run.
# The shell form (without the square brackets) allows for shell expansion.
ENTRYPOINT ["/app/entrypoint.sh"]

# Expose port 8080 to the outside world, as this is the port your Gunicorn server
# will be listening on. Railway automatically handles mapping this port.
EXPOSE 8080

# This command is now just for informational purposes and provides a default
# command if the entrypoint is not set or if you run the image locally without
# a command. The entrypoint script will be executed instead.
CMD ["gunicorn", "backend.core.wsgi:application", "--bind", "0.0.0.0:8080"]