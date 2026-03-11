# EducaDQ EAD - GUIA COMPLETO DE MIGRAÇÃO

**Data:** 08/03/2026  
**Versão do Projeto:** 92a50d62  
**Status:** 95% Funcional

---

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Passo 1: Exportar Projeto Atual](#passo-1-exportar-projeto-atual)
3. [Passo 2: Criar Nova Conta Manus](#passo-2-criar-nova-conta-manus)
4. [Passo 3: Criar Novo Projeto](#passo-3-criar-novo-projeto)
5. [Passo 4: Importar Código](#passo-4-importar-código)
6. [Passo 5: Configurar Banco de Dados](#passo-5-configurar-banco-de-dados)
7. [Passo 6: Configurar Variáveis de Ambiente](#passo-6-configurar-variáveis-de-ambiente)
8. [Passo 7: Reconfigurar Integrações Externas](#passo-7-reconfigurar-integrações-externas)
9. [Passo 8: Testar Funcionalidades](#passo-8-testar-funcionalidades)
10. [Passo 9: Deploy](#passo-9-deploy)
11. [Troubleshooting](#troubleshooting)

---

## ✅ PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

- [ ] Acesso à conta Manus atual (aocres01@gmail.com)
- [ ] Acesso à nova conta Manus com créditos suficientes
- [ ] Acesso a todas as contas externas (Stripe, Mercado Pago, etc.)
- [ ] Git instalado localmente
- [ ] Node.js 18+ instalado
- [ ] pnpm ou npm instalado
- [ ] MySQL CLI instalado (para backup do banco)
- [ ] Arquivo EDUCADQ_CREDENTIALS_AND_ACCOUNTS.md
- [ ] Arquivo EDUCADQ_COMPLETE_HANDOVER.md
- [ ] Arquivo educadq-ead-complete.tar.gz

---

## 🚀 PASSO 1: EXPORTAR PROJETO ATUAL

### 1.1 Fazer Backup do Código

```bash
# No seu computador local
cd ~/projetos
git clone https://github.com/seu-usuario/educadq-ead.git educadq-ead-backup
cd educadq-ead-backup
git log --oneline | head -20  # Ver histórico de commits
```

### 1.2 Fazer Backup do Banco de Dados

```bash
# Exportar dados do TiDB
mysql -h gateway03.us-east-1.prod.aws.tidbcloud.com \
       -P 4000 \
       -u Rt5BAgwciVnNQfN.d872fdae8ae9 \
       -p \
       Ur5C7aMSeVvtumGUex2bQ3 \
       --ssl-mode=REQUIRED \
       > educadq-backup.sql

# Verificar tamanho do backup
ls -lh educadq-backup.sql
```

### 1.3 Fazer Backup de Arquivos Estáticos

```bash
# Se houver imagens ou arquivos em S3
aws s3 sync s3://educadq-bucket ./educadq-s3-backup/
```

---

## 🆕 PASSO 2: CRIAR NOVA CONTA MANUS

### 2.1 Registrar Nova Conta

1. Ir para https://manus.im
2. Clicar em "Sign Up"
3. Usar novo email ou email existente
4. Completar registro
5. Verificar email
6. Fazer login

### 2.2 Adicionar Créditos

1. Ir para Settings → Billing
2. Adicionar método de pagamento
3. Comprar créditos (recomendado: mínimo 100 créditos)
4. Verificar saldo

### 2.3 Ativar Features Necessárias

1. Ir para Settings → Features
2. Ativar:
   - [ ] Database (MySQL/TiDB)
   - [ ] Server (Node.js/Express)
   - [ ] User Management (Manus Auth)
   - [ ] Email (SMTP)
   - [ ] Storage (S3)

---

## 📦 PASSO 3: CRIAR NOVO PROJETO

### 3.1 Criar Projeto no Manus

1. Ir para https://manus.im/projects
2. Clicar em "New Project"
3. Nome: `educadq-ead-v2`
4. Descrição: `EducaDQ - Plataforma EAD (Migração)`
5. Template: `Web App (tRPC + Manus Auth + Database)`
6. Features: `server`, `db`, `user`
7. Clicar em "Create"

### 3.2 Aguardar Inicialização

- Manus criará a estrutura do projeto
- Pode levar 2-5 minutos
- Você receberá notificação quando estiver pronto

### 3.3 Acessar Novo Projeto

1. Clicar no projeto `educadq-ead-v2`
2. Ir para "Code" para ver estrutura
3. Ir para "Preview" para testar servidor

---

## 💾 PASSO 4: IMPORTAR CÓDIGO

### 4.1 Conectar Repositório GitHub

1. No novo projeto Manus, ir para Settings → GitHub
2. Clicar em "Connect GitHub"
3. Autorizar Manus
4. Selecionar repositório `educadq-ead`
5. Selecionar branch `main`
6. Clicar em "Connect"

### 4.2 Fazer Push do Código

```bash
# No seu repositório local
cd educadq-ead-backup
git remote add new-manus https://github.com/seu-usuario/educadq-ead-v2.git
git push new-manus main

# Ou, se usar Manus CLI
manus project import ./educadq-ead-backup
```

### 4.3 Verificar Importação

1. Ir para Code panel no novo projeto
2. Verificar se todos os arquivos estão lá
3. Verificar se não há erros de compilação

---

## 🗄️ PASSO 5: CONFIGURAR BANCO DE DADOS

### 5.1 Opção A: Criar Novo Banco (Recomendado)

```bash
# No novo projeto Manus
# Ir para Database panel
# Manus criará automaticamente um novo cluster TiDB

# Aguardar criação (5-10 minutos)
# Você receberá a DATABASE_URL
```

### 5.2 Opção B: Migrar Dados do Banco Antigo

```bash
# 1. Exportar dados do banco antigo
mysql -h gateway03.us-east-1.prod.aws.tidbcloud.com \
       -P 4000 \
       -u Rt5BAgwciVnNQfN.d872fdae8ae9 \
       -p \
       Ur5C7aMSeVvtumGUex2bQ3 \
       --ssl-mode=REQUIRED \
       > educadq-data.sql

# 2. Conectar ao novo banco
mysql -h <novo-host> \
       -P 4000 \
       -u <novo-user> \
       -p \
       <novo-database> \
       --ssl-mode=REQUIRED

# 3. Importar dados
source educadq-data.sql;

# 4. Verificar dados
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM courses;
```

### 5.3 Executar Migrations

```bash
# No novo projeto
pnpm db:push

# Ou, se usar Drizzle Kit
pnpm exec drizzle-kit push:mysql
```

### 5.4 Seed de Dados (Opcional)

```bash
# Se houver script de seed
pnpm db:seed

# Ou, executar manualmente
pnpm tsx scripts/seed.ts
```

---

## 🔧 PASSO 6: CONFIGURAR VARIÁVEIS DE AMBIENTE

### 6.1 Ir para Secrets Manager

1. No novo projeto, ir para Settings → Secrets
2. Clicar em "Add Secret"

### 6.2 Adicionar Todas as Variáveis

Adicionar as seguintes variáveis (veja EDUCADQ_CREDENTIALS_AND_ACCOUNTS.md):

```
DATABASE_URL=mysql://...
JWT_SECRET=6Jce7YR7eAV3yTsJN2sVMU
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
MERCADO_PAGO_ACCESS_TOKEN=APP_USR_...
MERCADO_PAGO_PUBLIC_KEY=APP_USR_...
OAUTH_SERVER_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=...
BUILT_IN_FORGE_API_URL=https://forge.manus.ai
OPENAI_API_KEY=sk-...
OPENAI_API_BASE=https://api.manus.im/api/llm-proxy/v1
VITE_OAUTH_PORTAL_URL=https://manus.im
VITE_FRONTEND_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.ai
```

### 6.3 Verificar Variáveis

1. Ir para Preview
2. Abrir console do navegador
3. Verificar se não há erros de variáveis faltantes

---

## 🔗 PASSO 7: RECONFIGURAR INTEGRAÇÕES EXTERNAS

### 7.1 STRIPE

1. Ir para https://dashboard.stripe.com/webhooks
2. Clicar em "Add endpoint"
3. URL: `https://novo-dominio.manus.space/api/stripe/webhook`
4. Eventos: `checkout.session.completed`, `payment_intent.succeeded`
5. Clicar em "Add endpoint"
6. Copiar Webhook Secret
7. Atualizar STRIPE_WEBHOOK_SECRET em Secrets

### 7.2 MERCADO PAGO

1. Ir para https://www.mercadopago.com.br/developers/panel
2. Ir para "Webhooks"
3. Adicionar novo webhook
4. URL: `https://novo-dominio.manus.space/api/mercadopago/webhook`
5. Salvar

### 7.3 MANUS OAUTH

1. Ir para https://manus.im/settings
2. Ir para "OAuth Applications"
3. Atualizar Redirect URIs:
   - `https://novo-dominio.manus.space/api/oauth/callback`
4. Salvar

### 7.4 DOMÍNIOS

1. No novo projeto, ir para Settings → Domains
2. Adicionar domínio customizado (se tiver)
3. Ou usar domínio automático: `novo-dominio.manus.space`

---

## ✅ PASSO 8: TESTAR FUNCIONALIDADES

### 8.1 Testar Autenticação

- [ ] Ir para https://novo-dominio.manus.space
- [ ] Clicar em "Entrar"
- [ ] Fazer login com Manus OAuth
- [ ] Verificar se redireciona para dashboard

### 8.2 Testar Painel Admin

- [ ] Acessar /admin
- [ ] Verificar se lista de usuários carrega
- [ ] Verificar se lista de cursos carrega
- [ ] Tentar criar novo usuário
- [ ] Tentar editar curso

### 8.3 Testar Pagamentos (Stripe)

- [ ] Ir para página de cursos
- [ ] Clicar em "Comprar"
- [ ] Usar cartão de teste: 4242 4242 4242 4242
- [ ] Completar pagamento
- [ ] Verificar se matrícula foi criada

### 8.4 Testar Relatórios

- [ ] Ir para painel admin
- [ ] Gerar relatório de cursos
- [ ] Verificar se arquivo Excel é baixado
- [ ] Abrir e verificar dados

### 8.5 Testar Criação de Aulas

- [ ] Ir para editar curso
- [ ] Clicar em "Nova Aula"
- [ ] Preencher formulário
- [ ] Clicar em "Criar Aula"
- [ ] Verificar se aula aparece na lista

**Nota:** Se a criação de aulas não funcionar, é o bug conhecido. Use o endpoint REST em `/api/lessons/create`

---

## 🚀 PASSO 9: DEPLOY

### 9.1 Deploy Automático

1. Fazer push para `main` branch
2. Manus fará deploy automaticamente
3. Aguardar 2-5 minutos
4. Verificar se aplicação está online

### 9.2 Deploy Manual

```bash
# Se precisar fazer deploy manual
manus project deploy
```

### 9.3 Verificar Deploy

1. Ir para Dashboard
2. Verificar status do deploy
3. Clicar em "View Live"
4. Testar aplicação

---

## 🔍 TROUBLESHOOTING

### Problema: "Database connection failed"

**Solução:**
```bash
# 1. Verificar DATABASE_URL
echo $DATABASE_URL

# 2. Testar conexão
mysql -h <host> -P 4000 -u <user> -p <database> --ssl-mode=REQUIRED

# 3. Se não conectar, verificar:
# - Host está correto?
# - Username está correto?
# - Senha está correta?
# - IP está whitelisted?
# - SSL está habilitado?
```

### Problema: "OAuth login fails"

**Solução:**
```bash
# 1. Verificar VITE_OAUTH_PORTAL_URL
echo $VITE_OAUTH_PORTAL_URL

# 2. Verificar redirect URI em Manus
# https://manus.im/settings → OAuth Applications

# 3. Verificar JWT_SECRET
echo $JWT_SECRET

# 4. Limpar cookies e tentar novamente
```

### Problema: "Stripe webhook not received"

**Solução:**
```bash
# 1. Verificar webhook URL em Stripe
# https://dashboard.stripe.com/webhooks

# 2. Verificar se endpoint está correto
# https://novo-dominio.manus.space/api/stripe/webhook

# 3. Testar webhook
# stripe trigger payment_intent.succeeded

# 4. Verificar logs
# Ir para Stripe Dashboard → Developers → Webhooks → Endpoint
```

### Problema: "Criação de aulas não funciona"

**Solução:**
```bash
# 1. Bug conhecido - Dialog não dispara mutation
# 2. Usar REST API em vez de tRPC
# 3. Fazer POST para /api/lessons/create

curl -X POST 'https://novo-dominio.manus.space/api/lessons/create' \
  -H 'Authorization: Bearer {TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "courseId": 60001,
    "moduleId": 1,
    "title": "Aula 1",
    "content": "Conteúdo...",
    "type": "text",
    "order": 1
  }'
```

### Problema: "Aplicação não carrega"

**Solução:**
```bash
# 1. Verificar se servidor está rodando
# Ir para Dashboard → Dev Server Status

# 2. Verificar logs
# Ir para Dashboard → Logs

# 3. Fazer restart do servidor
# Clicar em "Restart Server"

# 4. Verificar variáveis de ambiente
# Ir para Settings → Secrets
```

---

## 📊 CHECKLIST DE MIGRAÇÃO

- [ ] Backup do código feito
- [ ] Backup do banco de dados feito
- [ ] Nova conta Manus criada
- [ ] Créditos adicionados
- [ ] Novo projeto criado
- [ ] Código importado
- [ ] Banco de dados configurado
- [ ] Variáveis de ambiente adicionadas
- [ ] Integrações externas reconfiguradas
- [ ] Autenticação testada
- [ ] Painel admin testado
- [ ] Pagamentos testados
- [ ] Relatórios testados
- [ ] Criação de aulas testada
- [ ] Deploy realizado
- [ ] Aplicação online e funcionando

---

## 📞 SUPORTE

Se encontrar problemas:

1. Consultar Troubleshooting acima
2. Verificar documentação: https://docs.manus.im
3. Contatar suporte Manus: https://help.manus.im
4. Email: aocres01@gmail.com

---

**FIM DO GUIA DE MIGRAÇÃO**

Data: 08/03/2026  
Versão: 92a50d62
