# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.18.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="NestJS/Prisma"

# NestJS/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3

# Copy package files first for better caching
COPY package*.json pnpm-lock.yaml ./

# Copy prisma schema before installing dependencies
COPY prisma ./prisma

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install

# Generate Prisma Client
RUN pnpm prisma generate

# Copy application code
COPY . .

# Build application
RUN pnpm run build


# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install pnpm globally in the final stage
RUN npm install -g pnpm

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "pnpm", "run", "start" ]
