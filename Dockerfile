# Use Node.js 22 LTS as base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for SQLite and other native modules
RUN apk add --no-cache \
    sqlite \
    python3 \
    make \
    g++ \
    git

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create directory for database and artifacts
RUN mkdir -p /app/data /app/artifacts

# Expose port (adjust if your app uses a different port)
EXPOSE 6700

# Set environment variables
ENV NODE_ENV=production
ENV MASTRA_DB_PATH=/app/data/mastra.db
ENV TARGET_PATH=/app/artifacts
ENV DESKTOP_PATH=/Users/ryanhansen/Desktop/
ENV CONTAINER_DESKTOP_PATH=/app/desktop/

# Start the application
CMD ["npm", "start"]