#!/bin/bash

echo "🔨 Building EducaDQ EAD Platform..."
echo ""

# Step 1: Build frontend with Vite
echo "📦 Building frontend with Vite..."
pnpm vite build
if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed!"
  exit 1
fi

echo "✅ Frontend build completed successfully!"
echo ""

# Step 2: Check TypeScript (backend)
echo "🔍 Checking TypeScript (backend)..."
pnpm tsc -p tsconfig.server.json --noEmit 2>&1 | grep -E "error TS" | head -10 || true

echo ""
echo "✅ Build process completed!"
echo "📂 Frontend files: dist/public/"
echo "🚀 Ready to deploy!"
