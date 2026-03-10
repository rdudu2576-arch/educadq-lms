FROM node:20

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# Copy the rest of the application
COPY . .

# Build the project (Vite + Server)
RUN pnpm run build

# Expose the port
EXPOSE 3000

# Start the server
CMD ["pnpm", "start"]
