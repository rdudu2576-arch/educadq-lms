FROM node:20

WORKDIR /app

# Instala pnpm
RUN npm install -g pnpm

# Copia package.json e lockfile
COPY package.json pnpm-lock.yaml* ./

# Instala dependências
RUN pnpm install --no-frozen-lockfile

# Copia todo o projeto
COPY . .

# Build completo do server
RUN pnpm run build:server

# Comando final de start
CMD ["pnpm", "start"]
