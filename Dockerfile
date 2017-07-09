FROM python:3.5-alpine

# Install PostgreSQL dependencies
RUN apt-get update

ENV PYTHONUNBUFFERED 1

# Copy your application code to the container (make sure you create a .dockerignore file if any large files or directories should be excluded)
RUN mkdir /var/app/
WORKDIR  /var/app/
COPY . /var/app/

# Install dependencies
RUN pip install -r requirements.txt

# uWSGI will listen on this port
EXPOSE 8000

# Start uWSGI
CMD ["python", "/var/app/manage.py", "runserver", "0.0.0.0:8080"]
