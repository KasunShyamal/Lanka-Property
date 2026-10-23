# Multi-stage Dockerfile for LankaProperty NestJS Backend
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Security: Run as non-root node user
USER node

COPY --chown=node:node package*.json ./
RUN npm ci --only=production

COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/main"]
