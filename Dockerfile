FROM python:3.5-alpine

# Install PostgreSQL dependencies
RUN apt-get update -y
RUN api-get install -y curl
RUN apt-get purge nodejs npm
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs
RUN node --version

# Copy your application code to the container (make sure you create a .dockerignore file if any large files or directories should be excluded)
RUN mkdir /var/app/
WORKDIR  /var/app/
COPY . /var/app/

# Install dependencies
RUN pip install -r requirements.txt

# Build tasks
RUN python manage.py test
RUN npm install
RUN ./node_modules/.bin/gulp build
RUN python manage.py collectstatic --noinput

# uWSGI will listen on this port
EXPOSE 8000

# Start uWSGI
CMD ["python", "/var/app/manage.py", "runserver", "0.0.0.0:8080"]
