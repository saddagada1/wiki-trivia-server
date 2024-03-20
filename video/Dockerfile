FROM node:20-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends --no-install-suggests \
    chromium ffmpeg

WORKDIR /app

COPY ./public /app/public

COPY package*.json /app

RUN npm install

COPY . .

RUN npx tsc

CMD ["node", "dist/index.js"]