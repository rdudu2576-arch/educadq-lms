# Base image Node 20
FROM node:20

WORKDIR /app

RUN npm install -g pnpm

# Copiar tudo primeiro para o postinstall funcionar
COPY . .

# Instalar dependencias
RUN pnpm install --no-frozen-lockfile

# Build do servidor (TypeScript -> JavaScript via esbuild)
# O script scripts/build-server.ts gera dist/server/index.js
RUN pnpm run build:server

# Expor a porta
EXPOSE 3000

# Iniciar o servidor com o caminho correto gerado pelo esbuild
CMD ["node", "dist/server/index.js"]
