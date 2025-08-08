# Use Node.js LTS version
FROM node:18-alpine

# Install wget for health checks
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci --only=production

# Install development dependencies needed for building
RUN npm install --save-dev typescript ts-node tsconfig-paths

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/
COPY doc/ ./doc/

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 5000

# Start the application
CMD ["sh", "-c", "npm run create-root && npm start"]