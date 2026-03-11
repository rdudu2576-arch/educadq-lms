# Sistema de Retry Automático para Pagamentos

## Visão Geral

Sistema completo de reprocessamento automático de pagamentos falhados com backoff exponencial, notificações inteligentes e monitoramento em tempo real.

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│ Pagamento Falha                                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ PaymentRetryEngine.createRetry()                        │
│ - Cria registro em payment_retries                      │
│ - Calcula próxima tentativa (backoff exponencial)       │
│ - Notifica aluno                                        │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ Scheduled Job (a cada 5 minutos)                        │
│ processPaymentRetries()                                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│ PaymentRetryEngine.processRetry()                       │
│ - Verifica se é hora de tentar                          │
│ - Reprocessa pagamento com provedor ativo              │
│ - Atualiza status                                       │
│ - Notifica resultado                                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   SUCESSO                    FALHA
   - Cria matrícula          - Incrementa retryCount
   - Libera acesso           - Calcula próxima tentativa
   - Notifica aluno          - Notifica aluno
   - Registra em logs        - Verifica se atingiu máximo
                             - Se sim: marca como abandoned
```

## Componentes

### 1. Schema do Banco (`drizzle/paymentRetrySchema.ts`)

#### Tabela: `payment_retries`
```sql
CREATE TABLE payment_retries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  paymentId INT NOT NULL,
  studentId INT NOT NULL,
  courseId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  originalError TEXT,
  retryCount INT DEFAULT 0,
  maxRetries INT DEFAULT 5,
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, success, failed, abandoned
  lastRetryAt TIMESTAMP,
  nextRetryAt TIMESTAMP,
  backoffMultiplier DECIMAL(3, 2) DEFAULT 2.0,
  initialDelaySeconds INT DEFAULT 300,
  lastErrorMessage TEXT,
  paymentMethod VARCHAR(50),
  installments INT DEFAULT 1,
  notificationsSent INT DEFAULT 0,
  lastNotificationAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

#### Tabela: `retry_notifications`
```sql
CREATE TABLE retry_notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  retryId INT NOT NULL,
  studentId INT NOT NULL,
  type VARCHAR(50) NOT NULL, -- email, sms, push, in_app
  status VARCHAR(50) DEFAULT 'pending', -- pending, sent, failed
  message TEXT,
  sentAt TIMESTAMP,
  failureReason TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

#### Tabela: `retry_metrics`
```sql
CREATE TABLE retry_metrics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  date VARCHAR(10) NOT NULL, -- YYYY-MM-DD
  totalRetries INT DEFAULT 0,
  successfulRetries INT DEFAULT 0,
  failedRetries INT DEFAULT 0,
  abandonedRetries INT DEFAULT 0,
  totalAmountRecovered DECIMAL(12, 2) DEFAULT 0,
  averageRetryCount DECIMAL(5, 2) DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW() ON UPDATE NOW()
);
```

### 2. Retry Engine (`server/domain/payments/retryEngine.ts`)

**Funções principais:**

```typescript
// Calcular próxima tentativa com backoff exponencial
calculateNextRetryTime(retryCount, config)
// Delay = initialDelay * (backoffMultiplier ^ retryCount)
// Exemplo: 300s * (2.0 ^ 0) = 300s (5 min)
//          300s * (2.0 ^ 1) = 600s (10 min)
//          300s * (2.0 ^ 2) = 1200s (20 min)
//          300s * (2.0 ^ 3) = 2400s (40 min)
//          300s * (2.0 ^ 4) = 4800s (80 min)

// Criar novo retry
createRetry(paymentId, error)

// Processar retry
processRetry(retryId)

// Obter retries pendentes
getPendingRetries()

// Obter estatísticas
getRetryStats(days)
```

**Configuração padrão:**
```typescript
{
  maxRetries: 5,              // Máximo de tentativas
  initialDelaySeconds: 300,   // 5 minutos
  backoffMultiplier: 2.0,     // Dobra a cada tentativa
  maxDelaySeconds: 86400      // Máximo de 24 horas entre tentativas
}
```

### 3. Serviço de Notificações (`server/domain/payments/retryNotificationService.ts`)

**Canais suportados:**
- Email
- SMS
- Push notifications
- In-app notifications

**Eventos:**
- `notifyPaymentFailed()` - Pagamento falhou, tentaremos novamente
- `notifyPaymentRecovered()` - Pagamento foi reprocessado com sucesso
- `notifyPaymentAbandoned()` - Pagamento falhou após máximo de tentativas
- `notifyAdminCriticalFailure()` - Falha crítica para admin

### 4. Job Scheduler (`server/jobs/retryProcessor.ts`)

**Jobs configurados:**

```typescript
// A cada 5 minutos
schedule.scheduleJob("*/5 * * * *", () => {
  processPaymentRetries();
});

// Diariamente às 00:00
schedule.scheduleJob("0 0 * * *", () => {
  updateRetryMetrics();
});

// Toda segunda-feira às 02:00
schedule.scheduleJob("0 2 * * 1", () => {
  cleanupOldRetries();
});
```

### 5. Router de Gerenciamento (`server/domain/payments/retryManagementRouter.ts`)

**Rotas disponíveis:**

```typescript
// Admin
GET /api/trpc/retryManagement.listRetries
GET /api/trpc/retryManagement.getRetryDetails
POST /api/trpc/retryManagement.processRetryNow
POST /api/trpc/retryManagement.cancelRetry
GET /api/trpc/retryManagement.getRetryStats
GET /api/trpc/retryManagement.getRetryNotificationHistory
POST /api/trpc/retryManagement.resendRetryNotification
POST /api/trpc/retryManagement.updateRetryConfig
GET /api/trpc/retryManagement.getRetryConfig
GET /api/trpc/retryManagement.generateRetryReport

// Aluno
GET /api/trpc/retryManagement.getMyPendingRetries
```

### 6. Dashboard Admin (`client/src/pages/AdminRetryMonitoring.tsx`)

**Funcionalidades:**

- ✅ Visualizar todas as tentativas de retry
- ✅ Filtrar por status, aluno, data
- ✅ Processar retry manualmente
- ✅ Cancelar retry
- ✅ Reenviar notificações
- ✅ Visualizar estatísticas em tempo real
- ✅ Exportar relatórios
- ✅ Gráficos de tendência

**Estatísticas exibidas:**
- Taxa de sucesso
- Valor total recuperado
- Retries pendentes
- Média de tentativas por pagamento

## Fluxo de Funcionamento

### Cenário 1: Pagamento Falha

```
1. Aluno tenta pagar R$ 299.90
2. Provedor de pagamento retorna erro: "Card declined"
3. Sistema chama PaymentRetryEngine.createRetry()
4. Cria registro em payment_retries com status "pending"
5. Calcula próxima tentativa: agora + 5 minutos
6. Envia notificação ao aluno: "Tentaremos novamente em 5 minutos"
7. Aluno recebe email/SMS/push/notificação in-app
```

### Cenário 2: Processamento de Retry

```
1. Job scheduler executa a cada 5 minutos
2. Busca retries com status "pending" e nextRetryAt <= agora
3. Para cada retry:
   a. Marca como "processing"
   b. Obtém provedor ativo (PaymentProviderFactory)
   c. Tenta reprocessar pagamento
   d. Se sucesso:
      - Marca como "success"
      - Cria matrícula automática
      - Libera acesso ao curso
      - Notifica aluno: "Pagamento confirmado!"
      - Notifica admin
   e. Se falha:
      - Incrementa retryCount
      - Calcula próxima tentativa (backoff exponencial)
      - Se retryCount >= maxRetries:
        - Marca como "abandoned"
        - Notifica aluno: "Pagamento falhou após 5 tentativas"
        - Notifica admin
      - Se retryCount < maxRetries:
        - Marca como "failed"
        - Notifica aluno: "Tentaremos novamente em X horas"
```

### Cenário 3: Mudança de Provedor

```
1. Admin muda provedor de Mercado Pago para Stripe
2. Próximos retries usam Stripe automaticamente
3. Webhooks de Stripe são processados
4. Histórico de retries é mantido
5. Estatísticas continuam sendo coletadas
```

## Backoff Exponencial

**Cálculo:**
```
delay = initialDelay * (backoffMultiplier ^ retryCount)

Exemplo com initialDelay=300s e backoffMultiplier=2.0:
- Tentativa 1: 300s * 2^0 = 300s (5 min)
- Tentativa 2: 300s * 2^1 = 600s (10 min)
- Tentativa 3: 300s * 2^2 = 1200s (20 min)
- Tentativa 4: 300s * 2^3 = 2400s (40 min)
- Tentativa 5: 300s * 2^4 = 4800s (80 min)

Total: 5 + 10 + 20 + 40 + 80 = 155 minutos (2.5 horas)
```

**Benefícios:**
- Reduz carga no provedor de pagamento
- Aumenta chance de sucesso (problema pode ser temporário)
- Evita spam de tentativas
- Economiza recursos

## Notificações

### Email
```html
Assunto: Seu pagamento não foi processado
Corpo: Sua tentativa de pagamento de R$ 299.90 não foi processada.
       Não se preocupe! Tentaremos novamente em 5 minutos.
       Tentativa 1 de 5
       Se o problema persistir, entre em contato com nosso suporte.
```

### SMS
```
EducaDQ: Seu pagamento de R$ 299.90 não foi processado. 
Tentaremos novamente em 5 min. Suporte: 41 98891-3431
```

### Push
```
Título: Pagamento Pendente
Corpo: Tentaremos processar seu pagamento novamente em 5 minutos.
```

### In-App
```
Tipo: warning
Título: Pagamento Pendente
Mensagem: Sua tentativa de pagamento falhou. 
          Tentaremos novamente em 5 horas.
```

## Métricas e Relatórios

### Estatísticas Diárias
- Total de retries
- Retries bem-sucedidos
- Retries falhados
- Retries abandonados
- Taxa de sucesso
- Valor total recuperado
- Média de tentativas

### Relatórios
- Por período (data inicial e final)
- Formatos: JSON, CSV, PDF
- Detalhes de cada retry
- Histórico de notificações

## Segurança

- ✅ Validação de credenciais antes de reprocessar
- ✅ Limite de máximo de tentativas (5 por padrão)
- ✅ Logs de todas as tentativas
- ✅ Notificações de falha crítica para admin
- ✅ Isolamento por provedor de pagamento

## Integração com Provedores

### Mercado Pago
```typescript
const provider = PaymentProviderFactory.getActiveProvider();
const payment = await provider.createPayment({
  amount: 299.90,
  description: "Retry - Course 123",
  paymentMethod: "credit_card",
  installments: 1,
  email: "aluno@example.com",
});
```

### Stripe (quando implementado)
```typescript
// Mesmo padrão, provedor muda automaticamente
const provider = PaymentProviderFactory.getActiveProvider(); // Stripe
const payment = await provider.createPayment(...);
```

## Configuração

### Variáveis de Ambiente
```bash
# Retry Configuration
RETRY_MAX_RETRIES=5
RETRY_INITIAL_DELAY_SECONDS=300
RETRY_BACKOFF_MULTIPLIER=2.0
RETRY_MAX_DELAY_SECONDS=86400

# Notification Channels
RETRY_NOTIFY_EMAIL=true
RETRY_NOTIFY_SMS=false
RETRY_NOTIFY_PUSH=true
RETRY_NOTIFY_IN_APP=true
```

### Alterar Configuração via Admin
```typescript
// Admin pode alterar configuração
POST /api/trpc/retryManagement.updateRetryConfig
{
  maxRetries: 5,
  initialDelaySeconds: 300,
  backoffMultiplier: 2.0,
  maxDelaySeconds: 86400
}
```

## Monitoramento

### Dashboard Admin
- Visualizar todos os retries
- Filtrar por status, aluno, data
- Processar manualmente
- Cancelar retry
- Reenviar notificações
- Exportar relatórios

### Alertas
- Falha crítica de pagamento
- Taxa de sucesso baixa
- Muitos retries abandonados
- Problema com provedor de pagamento

## Troubleshooting

### Retry não está sendo processado
1. Verificar se job scheduler está ativo
2. Verificar logs do servidor
3. Verificar status do retry (deve ser "pending")
4. Verificar se nextRetryAt <= agora

### Notificações não estão sendo enviadas
1. Verificar configuração de canais
2. Verificar credenciais de email/SMS
3. Verificar logs de notificação
4. Reenviar manualmente via admin

### Pagamento não está sendo reprocessado
1. Verificar credenciais do provedor
2. Verificar status do provedor (ativo?)
3. Verificar limite de tentativas
4. Processar manualmente via admin

## Próximos Passos

1. **Implementar Stripe** - Adicionar suporte completo
2. **Implementar PayPal** - Adicionar suporte completo
3. **Dashboard de Analytics** - Gráficos mais detalhados
4. **Alertas em Tempo Real** - Notificar admin de falhas críticas
5. **Machine Learning** - Prever taxa de sucesso por método de pagamento
6. **A/B Testing** - Testar diferentes estratégias de backoff
