FROM python:3.12.2-slim-bullseye

RUN apt-get update \
    && apt-get install -y --no-install-recommends --no-install-suggests \
    build-essential libpq-dev \
    && pip install --no-cache-dir --upgrade pip

WORKDIR /app 
COPY ./requirements.txt /app
RUN pip install --no-cache-dir --requirement /app/requirements.txt
COPY . /app 

EXPOSE 5000

CMD ["python3", "manage.py", "runserver", "0.0.0.0:5000"]