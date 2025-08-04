FROM node:18.19.0

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application code
COPY backend ./backend
COPY frontend ./frontend

# Build arguments for secrets (passed during Docker build)
ARG OPENAI_API_KEY
ARG OPENAI_BASE_URL
ARG CORS_ALLOWED_ORIGINS

# Set environment variables (will be overridden by docker-compose if needed)
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV OPENAI_BASE_URL=$OPENAI_BASE_URL
ENV CORS_ALLOWED_ORIGINS=$CORS_ALLOWED_ORIGINS

# Build frontend (assuming npm run build is defined)
RUN cd frontend && npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]