FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Expose port
EXPOSE 3000
ENV PORT=3000
ENV HOST=0.0.0.0

# Start production server
CMD ["node", ".output/server/index.mjs"]
