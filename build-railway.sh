#!/bin/bash
set -e

echo "Starting Railway build process..."

# 1. Install dependencies
echo "Installing dependencies..."
pnpm install

# 2. Build Full (Frontend & Server)
echo "Building Full Project..."
pnpm build

# Copy package.json to dist if needed (usually not for Node.js apps on Railway)
# cp package.json dist/

echo "Build process completed successfully!"
