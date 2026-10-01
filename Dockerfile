FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Expose port
EXPOSE 8080
ENV PORT=8080
ENV HOST=0.0.0.0

# Start server
CMD ["node", "scripts/with-app-env.mjs", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]
