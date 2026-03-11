# Usar Node 20 como base
FROM node:20

# Criar diretório de trabalho
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm

# Copiar apenas package.json e pnpm-lock.yaml para aproveitar cache
COPY package.json pnpm-lock.yaml* ./

# Instalar todas as dependências (prod + dev) sem travar no lockfile
RUN pnpm install --prod=false --no-frozen-lockfile

# Copiar o restante do código
COPY . .

# Build do projeto (Vite + TypeScript)
RUN pnpm run build

# Expor a porta padrão Vite (ajuste se necessário)
EXPOSE 5173

# Comando padrão para iniciar o app
CMD ["pnpm", "run", "start"]
