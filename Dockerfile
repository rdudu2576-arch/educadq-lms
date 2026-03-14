# Base image Node 20
FROM node:20

WORKDIR /app

# Copiar package.json primeiro para cache
COPY package*.json ./

RUN npm install

# Copiar resto do projeto
COPY . .

RUN npm run build:server

CMD ["sh", "-c", "npm run migrate && node dist/server/index.js"]
