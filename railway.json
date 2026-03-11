# 1️⃣ Base image Node 20
FROM node:20

# 2️⃣ Diretório de trabalho
WORKDIR /app

# 3️⃣ Instalar pnpm globalmente
RUN npm install -g pnpm

# 4️⃣ Copiar arquivos de lock e package.json
COPY package.json pnpm-lock.yaml* ./

# 5️⃣ Instalar dependências
RUN pnpm install --no-frozen-lockfile

# 6️⃣ Copiar todo o projeto
COPY . .

# 7️⃣ Build do servidor (TypeScript)
RUN pnpm run build:server

# 8️⃣ Rodar migrations e iniciar servidor
CMD ["sh", "-c", "pnpm run migrate && node dist/server/index.js"]
