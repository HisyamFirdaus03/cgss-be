# Base image for building
FROM node:18-alpine AS builder

# Enable corepack and install dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN apk add --no-cache python3 make g++ \
    && npm install -g corepack@latest && corepack enable \
    && pnpm install --frozen-lockfile \
    && npm rebuild bcrypt --update-binary

# Copy source code and build
COPY . .

# Set environment variables needed for build
ENV NODE_ENV=production TZ=UTC

RUN pnpm build:prod

# Final lightweight production image
FROM node:18-alpine

WORKDIR /app

# Copy built artifacts and necessary files
COPY --from=builder /app/dist ./dist
COPY ./casbin ./casbin
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules

# Set environment variables for runtime
ENV NODE_ENV=production

# Start the application
CMD ["node", "./dist"]
