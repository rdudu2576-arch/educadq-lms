# 1️⃣ Base image Node 20
FROM node:20

WORKDIR /app

RUN npm install -g pnpm

# Copiar tudo primeiro para o postinstall funcionar
COPY . .

RUN pnpm install --no-frozen-lockfile

RUN pnpm run build:server

CMD ["sh", "-c", "pnpm run migrate && node dist/server/index.js"]
