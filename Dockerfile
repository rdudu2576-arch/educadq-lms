# Usar Node.js 20 como base
FROM node:20

# Criar e definir o diretório de trabalho
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar apenas arquivos de lock e package para aproveitar cache
COPY package.json pnpm-lock.yaml* ./

# Instalar todas as dependências (prod + dev)
RUN pnpm install --frozen-lockfile --prod=false

# Copiar todo o código do projeto
COPY . .

# Build do projeto (Vite + TypeScript)
RUN pnpm run build

# Expor a porta (ajuste conforme seu app)
EXPOSE 5173

# Comando default ao rodar o container
CMD ["pnpm", "run", "start"]
