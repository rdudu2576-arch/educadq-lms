#!/bin/bash
set -e

echo "Starting Railway build process..."

# 1. Install dependencies
echo "Installing dependencies..."
pnpm install

# 2. Build Frontend
echo "Building Frontend..."
pnpm build

# 3. Build Server
echo "Building Server..."
# Create dist/server if it doesn't exist
mkdir -p dist/server

# Compile TypeScript for server
# Using -p to use the specific tsconfig for server
./node_modules/.bin/tsc -p tsconfig.server.json

# Copy package.json to dist if needed (usually not for Node.js apps on Railway)
# cp package.json dist/

echo "Build process completed successfully!"
