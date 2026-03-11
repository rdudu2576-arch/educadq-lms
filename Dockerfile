# Imagem base Node
FROM node:20

# Diretório de trabalho
WORKDIR /app

# Instala pnpm globalmente
RUN npm install -g pnpm

# Copia package.json e lockfile
COPY package.json pnpm-lock.yaml* ./

# Instala todas dependências
RUN pnpm install --no-frozen-lockfile

# Instala tipos do Node para TS
RUN pnpm add -D @types/node

# Copia todo o restante do projeto
COPY . .

# Build do servidor
RUN pnpm run build:server

# Comando padrão para start
CMD ["node", "dist/server/index.js"]
