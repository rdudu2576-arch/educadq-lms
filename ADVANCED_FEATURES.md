# Funcionalidades Avançadas Implementadas

## 1. WEBHOOKS DO MERCADO PAGO

### Arquivo: `server/domain/payments/webhookHandler.ts`

Processa webhooks do Mercado Pago automaticamente:

```typescript
// Fluxo:
1. Mercado Pago envia webhook com status de pagamento
2. handleMercadoPagoWebhook() processa o evento
3. Atualiza status do pagamento no banco
4. Se aprovado: cria matrícula automática
5. Notifica admin e aluno
```

**Eventos suportados:**
- `approved` → Pagamento aprovado (libera acesso ao curso)
- `pending` → Pagamento pendente
- `rejected` → Pagamento rejeitado
- `cancelled` → Pagamento cancelado

**Integração:**
```bash
# Configurar webhook no Mercado Pago:
URL: https://seu-dominio.com/api/trpc/webhooks.mercadoPago
Eventos: payment.created, payment.updated
```

## 2. REFRESH TOKENS

### Arquivo: `server/_core/refreshToken.ts`

Sistema de tokens com expiração curta + refresh tokens:

```typescript
// Access Token: 15 minutos
// Refresh Token: 7 dias

// Fluxo de autenticação:
1. Login → generateTokenPair() → 2 cookies httpOnly
2. Access token usado em requisições
3. Quando expira → frontend envia refresh token
4. Backend valida e gera novo access token
5. Logout em todos os dispositivos possível
```

**Funções principais:**
- `generateAccessToken()` - Token de curta duração
- `generateRefreshToken()` - Token de longa duração
- `generateTokenPair()` - Ambos os tokens
- `verifyAccessToken()` - Valida token de acesso
- `verifyRefreshToken()` - Valida token de refresh
- `setAccessTokenCookie()` - Armazena em cookie
- `setRefreshTokenCookie()` - Armazena em cookie
- `clearTokenCookies()` - Remove ambos os cookies

**Uso:**
```typescript
// No login
const { accessToken, refreshToken } = generateTokenPair({
  userId: user.id,
  email: user.email,
  role: user.role,
});

setAccessTokenCookie(res, accessToken);
setRefreshTokenCookie(res, refreshToken);
```

## 3. SISTEMA DE CONFIGURAÇÃO DE PROVEDORES

### Arquivos:
- `drizzle/paymentProviderSchema.ts` - Schema do banco
- `server/domain/payments/providerConfigRouter.ts` - Rotas de configuração
- `server/domain/payments/providerFactory.ts` - Factory pattern
- `client/src/pages/AdminPaymentConfig.tsx` - Painel admin

### Tabelas do Banco:

```sql
-- payment_providers
CREATE TABLE payment_providers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL UNIQUE,
  isActive BOOLEAN DEFAULT FALSE,
  apiKey VARCHAR(500) NOT NULL,
  publicKey VARCHAR(500),
  webhookSecret VARCHAR(500),
  webhookUrl VARCHAR(500),
  supportedMethods TEXT, -- JSON
  maxInstallments INT DEFAULT 12,
  feePercentage VARCHAR(10),
  minAmount VARCHAR(10),
  maxAmount VARCHAR(10),
  config TEXT, -- JSON
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);

-- payment_provider_logs
CREATE TABLE payment_provider_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  providerId INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT, -- JSON
  changedBy INT NOT NULL,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

### Provedores Suportados:

#### 1. Mercado Pago
- Métodos: Cartão Crédito, Débito, PIX, Boleto
- Parcelas: até 12x
- Taxa: 2.99%

#### 2. Stripe
- Métodos: Cartão Crédito, Débito
- Parcelas: até 12x
- Taxa: 2.90%

#### 3. PayPal
- Métodos: Cartão Crédito, PayPal Wallet
- Parcelas: até 12x
- Taxa: 3.49%

### Fluxo de Troca de Provedor:

```typescript
// 1. Admin acessa painel
AdminPaymentConfig.tsx

// 2. Seleciona novo provedor
setActiveProvider("stripe")

// 3. Insere credenciais
apiKey, publicKey, webhookSecret

// 4. Testa conexão
handleTestConnection() → validaCredenciais()

// 5. Salva configuração
handleSaveConfiguration() → updateProvider()

// 6. Ativa novo provedor
handleSwitchProvider() → switchActiveProvider()

// 7. Sistema automaticamente usa novo provedor
PaymentProviderFactory.getActiveProvider()
```

## 4. FACTORY PATTERN PARA PROVEDORES

### Arquivo: `server/domain/payments/providerFactory.ts`

```typescript
// Usar em qualquer lugar do código:
const provider = PaymentProviderFactory.getActiveProvider();

// Criar pagamento (automático com provedor ativo)
const payment = await provider.createPayment({
  amount: 99.90,
  description: "Curso de Especialização",
  paymentMethod: "credit_card",
  installments: 3,
  email: "aluno@example.com",
});

// Verificar status
const status = await provider.getPaymentStatus(paymentId);

// Reembolsar
const refund = await provider.refundPayment(paymentId);
```

## 5. PAINEL DE CONFIGURAÇÃO DO ADMIN

### Arquivo: `client/src/pages/AdminPaymentConfig.tsx`

**Funcionalidades:**
- ✅ Visualizar todos os provedores disponíveis
- ✅ Configurar credenciais de cada provedor
- ✅ Testar conexão antes de ativar
- ✅ Trocar provedor ativo dinamicamente
- ✅ Visualizar histórico de mudanças
- ✅ Gerenciar máximo de parcelas
- ✅ Configurar taxa de processamento

**Interface:**
```
┌─────────────────────────────────────────┐
│ Configuração de Pagamentos              │
├─────────────────────────────────────────┤
│ [Mercado Pago] [Stripe] [PayPal]        │
├─────────────────────────────────────────┤
│ Mercado Pago                            │
│ Taxa: 2.99% | Máx: 12x                 │
│                                         │
│ Métodos: [Crédito] [Débito] [PIX] [Boleto]
│                                         │
│ API Key: [••••••••••]                   │
│ Public Key: [••••••••••]                │
│ Webhook Secret: [••••••••••]            │
│ Máx Parcelas: [12]                      │
│ Taxa: [2.99]%                           │
│                                         │
│ [Testar Conexão] [Salvar] [Ativar]     │
│                                         │
│ ✓ Conexão bem-sucedida!                │
└─────────────────────────────────────────┘
```

## 6. INTEGRAÇÃO AUTOMÁTICA

### Como funciona:

```typescript
// 1. Sistema inicia
// PaymentProviderFactory.setActiveProvider("mercado_pago", apiKey)

// 2. Admin muda provedor
// switchActiveProvider("stripe")

// 3. Sistema automaticamente usa novo provedor
const provider = PaymentProviderFactory.getActiveProvider(); // Stripe
const payment = await provider.createPayment(...); // Usa Stripe API

// 4. Webhook chega
// handleMercadoPagoWebhook() ou handleStripeWebhook()

// 5. Pagamento é processado com novo provedor
```

## 7. ROTAS IMPLEMENTADAS

```typescript
// Webhooks
POST /api/trpc/webhooks.mercadoPago
POST /api/trpc/webhooks.stripe
POST /api/trpc/webhooks.paypal

// Configuração de provedores
GET /api/trpc/payments.listProviders (admin)
GET /api/trpc/payments.getActiveProvider
POST /api/trpc/payments.updateProvider (admin)
POST /api/trpc/payments.switchActiveProvider (admin)
POST /api/trpc/payments.testProviderConnection (admin)
GET /api/trpc/payments.getProviderLogs (admin)
GET /api/trpc/payments.getSupportedProviders

// Refresh tokens
POST /api/trpc/auth.refreshToken
POST /api/trpc/auth.logout (limpa ambos os cookies)
```

## 8. VARIÁVEIS DE AMBIENTE

```bash
# JWT
JWT_SECRET=seu_secret_key_aqui

# Mercado Pago (padrão)
MERCADO_PAGO_ACCESS_TOKEN=seu_token
MERCADO_PAGO_PUBLIC_KEY=sua_public_key

# Stripe (opcional)
STRIPE_API_KEY=sua_api_key
STRIPE_PUBLIC_KEY=sua_public_key

# PayPal (opcional)
PAYPAL_CLIENT_ID=seu_client_id
PAYPAL_SECRET=seu_secret

# Webhooks
WEBHOOK_MERCADO_PAGO_SECRET=seu_secret
WEBHOOK_STRIPE_SECRET=seu_secret
WEBHOOK_PAYPAL_SECRET=seu_secret
```

## 9. FLUXO COMPLETO DE PAGAMENTO

```
1. Aluno seleciona curso e método de pagamento
   ↓
2. Frontend chama createPayment()
   ↓
3. Backend obtém provedor ativo (PaymentProviderFactory)
   ↓
4. Cria pagamento com provedor (Mercado Pago/Stripe/PayPal)
   ↓
5. Retorna URL de checkout
   ↓
6. Aluno completa pagamento
   ↓
7. Provedor envia webhook
   ↓
8. handleWebhook() processa confirmação
   ↓
9. Se aprovado:
   - Atualiza status para "paid"
   - Cria matrícula automática
   - Libera acesso ao curso
   - Notifica admin e aluno
   ↓
10. Aluno pode acessar curso
```

## 10. MUDANÇA DE PROVEDOR - PASSO A PASSO

```
1. Admin acessa: /admin/payment-config
   ↓
2. Seleciona novo provedor (ex: Stripe)
   ↓
3. Insere credenciais:
   - API Key
   - Public Key
   - Webhook Secret
   ↓
4. Clica "Testar Conexão"
   - Sistema valida credenciais
   - Testa API do provedor
   - Mostra resultado
   ↓
5. Se OK, clica "Salvar Configuração"
   - Armazena credenciais no banco
   - Cria log de mudança
   ↓
6. Clica "Ativar Este Provedor"
   - Desativa provedor anterior
   - Ativa novo provedor
   - Cria log de ativação
   ↓
7. Sistema automaticamente usa novo provedor
   - Próximos pagamentos usam Stripe
   - Webhooks de Stripe são processados
   - Mercado Pago é desativado
```

## 11. SEGURANÇA

- ✅ API Keys armazenadas criptografadas no banco
- ✅ Webhooks validados com assinatura do provedor
- ✅ Acesso ao painel restrito a admins
- ✅ Logs de todas as mudanças de configuração
- ✅ Refresh tokens com expiração curta
- ✅ Cookies httpOnly, Secure, SameSite

## 12. PRÓXIMOS PASSOS

1. Implementar Stripe e PayPal completamente
2. Adicionar suporte a mais provedores (PagSeguro, Cielo)
3. Dashboard de análise de pagamentos
4. Relatórios de receita por provedor
5. Testes automatizados de webhooks
6. Monitoramento de falhas de pagamento
