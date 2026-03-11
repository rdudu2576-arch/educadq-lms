FROM node:20

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

COPY . .

# Build do backend
RUN pnpm run build:server

# Start
CMD ["pnpm", "start"]
