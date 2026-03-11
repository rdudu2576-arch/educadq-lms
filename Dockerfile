# 1️⃣ Imagem base Node
FROM node:20

# 2️⃣ Define diretório de trabalho
WORKDIR /app

# 3️⃣ Instala pnpm globalmente
RUN npm install -g pnpm

# 4️⃣ Copia package.json e pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# 5️⃣ Instala dependências, incluindo devDependencies
RUN pnpm install --no-frozen-lockfile

# 6️⃣ Instala @types/node para TS
RUN pnpm add -D @types/node

# 7️⃣ Copia todo o restante do projeto
COPY . .

# 8️⃣ Build do servidor
RUN pnpm run build:server

# 9️⃣ Comando padrão de start
CMD ["node", "dist/server/index.js"]
