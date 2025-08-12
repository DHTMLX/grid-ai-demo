FROM node:16-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ARG OPENAI_API_KEY
ARG OPENAI_BASE_URL
ARG CORS_ALLOWED_ORIGINS
RUN echo "OPENAI_API_KEY=${OPENAI_API_KEY}" > .env && \
    echo "OPENAI_BASE_URL=${OPENAI_BASE_URL}" >> .env && \
    echo "CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}" >> .env

EXPOSE 3001

CMD ["npm", "start"]
