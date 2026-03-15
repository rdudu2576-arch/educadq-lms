#!/bin/bash

# Automated deployment script

# Build the project
npm install
npm run build

# Commit changes
git add .
git commit -m "Automated deployment on 2026-03-14 05:15:16"

# Push to GitHub
git push origin main