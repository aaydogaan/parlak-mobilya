FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci || npm install

# Copy source code
COPY . .

# Build production bundle
ENV NODE_ENV=production
RUN npm run build

# Runner stage
FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Create app directory with secure permissions
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

# Run as non-root user
USER node

# Expose port
EXPOSE 3000

# Start production server
CMD ["node", ".output/server/index.mjs"]
