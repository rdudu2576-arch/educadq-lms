# Guia de Download - EducaDQ Plataforma EAD

## 📦 Arquivos Disponíveis para Download

### 1. Arquivo Completo do Projeto
**Nome:** `educadq-ead-complete.tar.gz`
**Tamanho:** 358 KB
**Conteúdo:** Código-fonte completo do projeto (sem node_modules)

## 🚀 Como Usar os Arquivos

### Passo 1: Descompactar o Arquivo

```bash
# Linux/Mac
tar -xzf educadq-ead-complete.tar.gz

# Windows (usando 7-Zip ou WinRAR)
# Clique com botão direito > Extrair aqui
```

### Passo 2: Instalar Dependências

```bash
cd educadq-ead
pnpm install
# ou
npm install
```

### Passo 3: Configurar Variáveis de Ambiente

Crie arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/educadq

# JWT
JWT_SECRET=sua_chave_secreta_aqui

# OAuth
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=seu_token_aqui
MERCADO_PAGO_PUBLIC_KEY=sua_chave_publica_aqui

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_aqui
EMAIL_FROM=noreply@educadq.com
```

### Passo 4: Executar em Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# O servidor estará disponível em http://localhost:3000
```

### Passo 5: Build para Produção

```bash
# Compilar para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

## 📁 Estrutura do Projeto

```
educadq-ead/
├── client/                          # Frontend React
│   ├── src/
│   │   ├── pages/                  # Páginas da aplicação
│   │   ├── components/             # Componentes reutilizáveis
│   │   ├── hooks/                  # Custom hooks
│   │   ├── lib/                    # Utilitários
│   │   └── contexts/               # React contexts
│   └── index.html
├── server/                          # Backend Express
│   ├── domain/                     # Lógica de negócio (DDD)
│   │   ├── users/                 # Autenticação e usuários
│   │   ├── courses/               # Cursos e aulas
│   │   ├── payments/              # Pagamentos e retries
│   │   ├── professionals/         # Profissionais
│   │   └── articles/              # Artigos e conteúdo
│   ├── infra/                      # Infraestrutura
│   │   ├── db.ts                  # Funções de banco
│   │   └── userRoleManagement.ts  # Gerenciamento de papéis
│   ├── services/                   # Serviços de negócio
│   ├── jobs/                       # Jobs agendados
│   ├── _core/                      # Framework core
│   └── routers.ts                  # Agregador de routers
├── drizzle/                         # Banco de dados
│   ├── schema.ts                   # Schema do banco
│   └── migrations/                 # Migrations
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🗄️ Banco de Dados

### Criar Banco de Dados

```sql
CREATE DATABASE educadq CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Executar Migrations

```bash
pnpm db:push
```

### Seed de Dados (Opcional)

```bash
pnpm db:seed
```

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Gerar relatório de cobertura
pnpm test:coverage
```

## 📊 Funcionalidades Implementadas

### ✅ Autenticação
- JWT com cookies httpOnly
- Refresh tokens (15min access + 7 dias refresh)
- OAuth integrado

### ✅ Gerenciamento de Usuários
- 3 papéis: Admin, Professor, Aluno
- Hierarquia de papéis
- Auditoria de mudanças
- Permissões granulares

### ✅ Cursos
- Criação e edição de cursos
- Aulas em vídeo (YouTube)
- Aulas ao vivo (Google Meet)
- Aulas em texto com imagens
- Materiais complementares (Google Drive)
- Progresso de alunos
- Bloqueio de aulas futuras

### ✅ Avaliações
- Múltipla escolha (5 alternativas)
- Distribuição equilibrada de respostas
- Nota mínima configurável
- Aprovação automática

### ✅ Pagamentos
- Integração Mercado Pago
- Múltiplos métodos: Cartão, PIX, Débito, Boleto
- Parcelamento até 12x
- Webhooks automáticos
- Retry automático com backoff exponencial
- Notificações inteligentes

### ✅ Relatórios
- Cursos e alunos matriculados
- Taxa de conclusão
- Progresso individual
- Pagamentos (pago, pendente, atrasado)
- Exportação em Excel

### ✅ Sistema de Retry
- Backoff exponencial
- Múltiplos canais de notificação
- Dashboard de monitoramento
- Auditoria completa

### ✅ Proteção de Conteúdo
- Bloqueio de CTRL+C
- Bloqueio de CTRL+V
- Bloqueio de seleção de texto
- Bloqueio de botão direito

### ✅ Anti-compartilhamento
- Detecção de múltiplos IPs
- Detecção de múltiplos dispositivos
- Bloqueio de sessões paralelas

## 🔧 Configuração de Provedores

### Mercado Pago

1. Criar conta em https://www.mercadopago.com.br
2. Obter credenciais em: Configurações > Credenciais
3. Adicionar em `.env.local`:
   ```env
   MERCADO_PAGO_ACCESS_TOKEN=APP_USR_...
   MERCADO_PAGO_PUBLIC_KEY=APP_USR_...
   ```

### Google OAuth

1. Criar projeto em https://console.cloud.google.com
2. Criar credenciais OAuth 2.0
3. Adicionar URLs autorizadas
4. Obter Client ID e Secret

### Gmail (Para Emails)

1. Ativar 2FA na conta Google
2. Gerar senha de aplicativo
3. Usar em `.env.local`:
   ```env
   SMTP_USER=seu_email@gmail.com
   SMTP_PASSWORD=sua_senha_de_app
   ```

## 📱 Responsividade

A plataforma é totalmente responsiva para:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)
- ✅ Smart TV (4K)

## 🔐 Segurança

- ✅ Autenticação JWT
- ✅ Criptografia de senha (bcrypt)
- ✅ Proteção contra SQL injection
- ✅ Proteção contra brute force
- ✅ Proteção de sessão
- ✅ CORS configurado
- ✅ Rate limiting
- ✅ Validação de entrada

## 📚 Documentação

Arquivos de documentação inclusos:

- `RETRY_SYSTEM.md` - Sistema de retry de pagamentos
- `USER_ROLE_SYSTEM.md` - Sistema de papéis e permissões
- `FIXES_IMPLEMENTED.md` - Correções implementadas
- `IMPLEMENTATION_CODE.md` - Código de implementação
- `ADVANCED_FEATURES.md` - Funcionalidades avançadas
- `REESTRUTURACAO.md` - Reestruturação DDD

## 🆘 Troubleshooting

### Erro: "Cannot find module"
```bash
# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Database connection failed"
```bash
# Verificar credenciais em .env.local
# Verificar se MySQL está rodando
# Executar migrations: pnpm db:push
```

### Erro: "Port 3000 already in use"
```bash
# Usar porta diferente
PORT=3001 pnpm dev
```

### Erro: "OAuth callback failed"
```bash
# Verificar URLs autorizadas no console Google
# Verificar VITE_OAUTH_PORTAL_URL em .env.local
```

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar documentação incluída
2. Verificar logs do servidor
3. Verificar console do navegador (F12)
4. Contatar suporte técnico

## 🚀 Deploy

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Docker

```bash
# Construir imagem
docker build -t educadq-ead .

# Executar container
docker run -p 3000:3000 educadq-ead
```

## 📝 Licença

Projeto desenvolvido para EducaDQ - Centro de Formação e Estudos sobre Álcool e outras Drogas LTDA.

---

**Versão:** 1.0.0
**Data:** Março de 2026
**Desenvolvido por:** Manus AI
