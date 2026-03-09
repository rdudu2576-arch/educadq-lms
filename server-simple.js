#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos do diretório dist/public
const publicPath = path.join(__dirname, 'dist', 'public');

console.log(`[Server] Public path: ${publicPath}`);
console.log(`[Server] Public path exists: ${fs.existsSync(publicPath)}`);

// Middleware para servir arquivos estáticos
app.use(express.static(publicPath, {
  maxAge: '1d',
  etag: false
}));

// Fallback para SPA - servir index.html para todas as rotas não encontradas
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  console.log(`[Server] Serving index.html for route: ${req.path}`);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error(`[Server] index.html not found at: ${indexPath}`);
    res.status(404).send('Frontend build not found. Please run: npm run build');
  }
});

app.listen(PORT, () => {
  console.log(`[Server] ✅ Listening on port ${PORT}`);
  console.log(`[Server] 🌐 Frontend: http://localhost:${PORT}`);
  console.log(`[Server] 📁 Serving files from: ${publicPath}`);
});
