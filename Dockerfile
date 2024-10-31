# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# Generate Prisma client during build only
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Create node user and set ownership
RUN chown -R node:node /app

# Switch to node user
USER node

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy prisma schema and generate client
COPY --from=builder /app/prisma ./prisma
RUN npx prisma generate

# Copy built files
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start:prod"]
