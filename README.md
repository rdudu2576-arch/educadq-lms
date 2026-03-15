# 📚 EducaDQ - Plataforma EAD

Plataforma de educação a distância leve, segura e escalável para o **Centro de Formação e Estudos sobre Álcool e outras Drogas LTDA — EducaDQ**.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node](https://img.shields.io/badge/node-18%2B-green)

---

## 🎯 Características Principais

### Para Alunos
- ✅ Acesso a cursos adquiridos
- ✅ Aulas em vídeo (YouTube), texto e ao vivo (Google Meet)
- ✅ Barra de progresso visual por curso
- ✅ Avaliações com múltipla escolha
- ✅ Download de materiais complementares
- ✅ Acompanhamento de desempenho

### Para Professores
- ✅ Criação de aulas (vídeo, texto, ao vivo)
- ✅ Criação de avaliações
- ✅ Acompanhamento de desempenho dos alunos
- ✅ Alertas de conclusão

### Para Administradores
- ✅ Cadastro de cursos, professores e alunos
- ✅ Liberação manual de acesso
- ✅ Gerenciamento de pagamentos e parcelas
- ✅ Geração de relatórios em Excel
- ✅ Sistema de alertas automáticos

### Segurança
- ✅ Autenticação com 3 níveis de acesso (Admin, Professor, Aluno)
- ✅ Proteção anti-compartilhamento (detecção de múltiplos IPs/dispositivos)
- ✅ Proteção de conteúdo (anti-copy, anti-print screen)
- ✅ Criptografia de dados
- ✅ Sessões seguras

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| **Frontend** | Next.js 14 + React 19 | Interface responsiva e rápida |
| **Backend** | Express.js + tRPC | API type-safe e performática |
| **Banco de Dados** | PostgreSQL (Supabase) | Dados estruturados e seguros |
| **Autenticação** | Supabase Auth | OAuth 2.0 e sessões seguras |
| **Armazenamento** | Supabase Storage | Arquivos e materiais |
| **Styling** | Tailwind CSS 4 | Design moderno e responsivo |
| **Componentes** | shadcn/ui | UI consistente e acessível |
| **Testes** | Vitest | Testes unitários e integração |
| **Deploy** | Vercel + GitHub Actions | CI/CD automático |

### Estrutura do Projeto

```
educadq-ead/
├── client/                    # Frontend (Next.js)
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Utilitários
│   │   ├── contexts/         # React contexts
│   │   └── index.css         # Estilos globais
│   └── public/               # Arquivos estáticos
├── server/                    # Backend (Express.js)
│   ├── routers.ts            # Procedures tRPC
│   ├── db.ts                 # Query helpers
│   ├── storage.ts            # S3 helpers
│   └── _core/                # Framework core
├── drizzle/                   # Migrations e schema
│   ├── schema.ts             # Definição das tabelas
│   └── migrations/           # Arquivos SQL
├── shared/                    # Código compartilhado
├── DEPLOYMENT.md             # Guia de deploy
└── README.md                 # Este arquivo
```

---

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- pnpm 10+
- Git
- Conta no Supabase (opcional para desenvolvimento)

### Instalação Local

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/educadq-ead.git
cd educadq-ead

# Instale as dependências
pnpm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Inicie o servidor de desenvolvimento
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```bash
# Banco de Dados
DATABASE_URL=postgresql://user:password@host:5432/educadq

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anonima

# Autenticação
JWT_SECRET=seu-jwt-secret-aleatorio

# OAuth
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
```

---

## 📋 Funcionalidades Detalhadas

### Sistema de Cursos

Cada curso contém:
- **Título, descrição e carga horária**
- **Capa (imagem JPG)** e trailer (YouTube)
- **Professor responsável**
- **Nota mínima para aprovação**
- **Configuração de parcelas** (valor, entrada, número de parcelas)

### Sistema de Aulas

Três tipos de aulas:
1. **Vídeo YouTube**: Incorporação de vídeos
2. **Texto**: Conteúdo em Markdown com imagens
3. **Ao Vivo**: Links do Google Meet

### Sistema de Avaliações

- **Múltipla escolha** com 5 alternativas
- **Distribuição equilibrada** de respostas corretas
- **Avaliações por aula** ou **final do curso**
- **Nota mínima configurável**
- **Alertas automáticos** para aprovação

### Sistema de Progresso

- **Barra de progresso** visual por curso
- **Bloqueio de aulas futuras** até conclusão da anterior
- **Rastreamento de aulas assistidas**
- **Cálculo automático de progresso**

### Sistema de Pagamentos

- **Configuração de parcelas** pelo administrador
- **Alertas automáticos** antes do vencimento
- **Chave PIX**: 41 98891-3431
- **Relatórios de pagamento** em Excel

### Sistema Anti-Compartilhamento

- **Detecção de múltiplos IPs** simultâneos
- **Detecção de múltiplos dispositivos**
- **Bloqueio de sessões paralelas**
- **Exigência de novo login** em caso de suspeita

### Proteção de Conteúdo

- **Desabilitar CTRL+C** (cópia)
- **Desabilitar CTRL+V** (cola)
- **Desabilitar seleção de texto**
- **Desabilitar botão direito**
- **Desabilitar Print Screen**
- **Desabilitar inspeção de elementos**

---

## 🔐 Segurança

### Implementações de Segurança

1. **Autenticação Segura**
   - OAuth 2.0 com Supabase
   - JWT com expiração
   - Refresh tokens

2. **Proteção de Dados**
   - Criptografia em trânsito (HTTPS)
   - Criptografia em repouso (PostgreSQL)
   - Senhas com hash bcrypt

3. **Prevenção de Ataques**
   - Proteção contra SQL Injection (Drizzle ORM)
   - Proteção contra XSS (React sanitization)
   - CSRF tokens
   - Rate limiting

4. **Monitoramento**
   - Logs de auditoria
   - Alertas de segurança
   - Detecção de anomalias

---

## 📊 Relatórios

O sistema gera relatórios em Excel (.xlsx) com:

### Relatório de Cursos
- Cursos cadastrados
- Alunos matriculados
- Taxa de conclusão
- Receita total

### Relatório de Alunos
- Cursos em andamento
- Progresso individual
- Notas nas avaliações
- Data de conclusão

### Relatório de Pagamentos
- Pagamentos realizados
- Pagamentos pendentes
- Atrasos
- Parcelas vencidas

---

## 🎨 Identidade Visual

A plataforma utiliza a identidade visual do EducaDQ:

- **Cor Primária**: Azul Meia-Noite (#0D2333)
- **Cor Secundária**: Azul Turquesa (#06B2C9)
- **Fonte**: Inter (Google Fonts)
- **Logotipo**: Livro aberto com cérebro

---

## 📱 Responsividade

A plataforma é totalmente responsiva e suporta:

- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)
- ✅ Smart TV (4K)

---

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
pnpm test

# Testes com cobertura
pnpm test:coverage

# Testes em modo watch
pnpm test:watch
```

### Cobertura de Testes

- ✅ Procedures tRPC
- ✅ Query helpers
- ✅ Componentes React
- ✅ Hooks customizados
- ✅ Autenticação

---

## 🚀 Deploy

### Deploy na Vercel

Para instruções completas de deploy, consulte [DEPLOYMENT.md](./DEPLOYMENT.md).

**Resumo rápido:**

```bash
# 1. Faça push para o GitHub
git push origin main

# 2. Vercel automaticamente fará o deploy
# 3. Acesse seu domínio customizado
```

### Variáveis de Ambiente em Produção

Configure as seguintes variáveis no Vercel:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `JWT_SECRET`
- `VITE_APP_ID`
- `OWNER_OPEN_ID`
- `OWNER_NAME`

---

## 📈 Performance

### Otimizações Implementadas

- **Code splitting** automático com Next.js
- **Image optimization** com next/image
- **Lazy loading** de componentes
- **Caching** de queries com tRPC
- **Database indexing** nas tabelas principais
- **CDN** para assets estáticos

### Métricas

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3.5s

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](./LICENSE) para detalhes.

---

## 📞 Contato

**EducaDQ - Centro de Formação e Estudos sobre Álcool e outras Drogas**

- 📧 Email: contato@educadq.com.br
- 📱 WhatsApp: 41 98891-3431
- 🌐 Website: www.educadq.com.br
- 📍 Redes Sociais: @educadq

---

## 🗺️ Roadmap

### v1.0 (Atual)
- ✅ Sistema de cursos e aulas
- ✅ Avaliações com múltipla escolha
- ✅ Sistema de progresso
- ✅ Painéis de Admin, Professor e Aluno
- ✅ Proteção de conteúdo

### v1.1 (Próximo)
- 🔄 Certificados automáticos
- 🔄 Integração com pagamentos online (Stripe)
- 🔄 Aplicativo mobile (React Native)
- 🔄 Sistema de recomendação IA
- 🔄 Chat em tempo real

### v2.0 (Futuro)
- 🔄 Gamificação (badges, pontos)
- 🔄 Comunidade de alunos
- 🔄 Integração com redes sociais
- 🔄 Analytics avançado
- 🔄 Marketplace de cursos

---

## 📚 Documentação Adicional

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia completo de deploy
- [API.md](./API.md) - Documentação da API tRPC
- [DATABASE.md](./DATABASE.md) - Schema do banco de dados
- [SECURITY.md](./SECURITY.md) - Políticas de segurança

---

**Desenvolvido com ❤️ para EducaDQ**

Última atualização: Março de 2026  
Versão: 1.0.0
// Deploy com novas variáveis de ambiente
