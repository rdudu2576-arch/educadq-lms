# EducaDQ EAD - DOCUMENTAÇÃO COMPLETA DE APIs

---

## 📚 ÍNDICE

1. [APIs Internas (tRPC)](#apis-internas-trpc)
2. [APIs REST Externas](#apis-rest-externas)
3. [Webhooks](#webhooks)
4. [Autenticação](#autenticação)
5. [Exemplos de Requisições](#exemplos-de-requisições)

---

## 🔌 APIs INTERNAS (tRPC)

### Base URL
```
http://localhost:3000/api/trpc (Desenvolvimento)
https://educadq-ead.com.br/api/trpc (Produção)
```

### 1. CURSOS (courses)

#### `courses.getAll`
```
Tipo: Query
Acesso: Público
Descrição: Listar todos os cursos

Parâmetros:
{
  "limit": 20,      // Número de resultados
  "offset": 0       // Deslocamento
}

Resposta:
[
  {
    "id": 60001,
    "title": "Conselheiro Terapeuta em Dependência Química",
    "description": "Formação completa com 300 horas...",
    "price": 2000.00,
    "hours": 300,
    "coverUrl": "https://...",
    "trailerUrl": "https://youtube.com/watch?v=...",
    "professorId": 1,
    "minGrade": 70,
    "maxInstallments": 1,
    "createdAt": "2026-03-08T...",
    "updatedAt": "2026-03-08T..."
  }
]
```

#### `courses.getFreeCourses`
```
Tipo: Query
Acesso: Público
Descrição: Listar apenas cursos gratuitos (price = 0)

Parâmetros:
{
  "limit": 20,
  "offset": 0
}

Resposta: [Array de cursos com price = 0]
```

#### `courses.getBySlug`
```
Tipo: Query
Acesso: Público
Descrição: Obter curso por slug

Parâmetros:
{
  "slug": "conselheiro-terapeuta"
}

Resposta: {Objeto do curso}
```

#### `courses.create`
```
Tipo: Mutation
Acesso: Protegido (Admin)
Descrição: Criar novo curso

Parâmetros:
{
  "title": "Novo Curso",
  "description": "Descrição...",
  "price": 1500.00,
  "hours": 100,
  "coverUrl": "https://...",
  "trailerUrl": "https://youtube.com/...",
  "professorId": 1,
  "minGrade": 70,
  "maxInstallments": 3
}

Resposta: {Objeto do curso criado}
```

#### `courses.update`
```
Tipo: Mutation
Acesso: Protegido (Admin/Professor)
Descrição: Atualizar curso

Parâmetros:
{
  "courseId": 60001,
  "title": "Título Atualizado",
  "description": "...",
  "price": 2000.00,
  "hours": 300,
  "coverUrl": "...",
  "trailerUrl": "...",
  "professorId": 1,
  "minGrade": 70,
  "maxInstallments": 1
}

Resposta: {Objeto do curso atualizado}
```

#### `courses.delete`
```
Tipo: Mutation
Acesso: Protegido (Admin)
Descrição: Deletar curso

Parâmetros:
{
  "courseId": 60001
}

Resposta: {success: true}
```

---

### 2. AULAS (lessons)

#### `lessons.getByCourse`
```
Tipo: Query
Acesso: Protegido
Descrição: Listar aulas de um curso

Parâmetros:
{
  "courseId": 60001
}

Resposta:
[
  {
    "id": 1,
    "moduleId": 1,
    "title": "Aula 1 - Fundamentos",
    "content": "Conteúdo...",
    "type": "text",
    "order": 1,
    "createdAt": "2026-03-08T...",
    "updatedAt": "2026-03-08T..."
  }
]
```

#### `lessons.create`
```
Tipo: Mutation
Acesso: Protegido (Professor)
Descrição: Criar nova aula

Parâmetros:
{
  "courseId": 60001,
  "moduleId": 1,
  "title": "Aula 2 - Neurobiologia",
  "content": "Conteúdo da aula...",
  "type": "text",
  "order": 2
}

Resposta: {Objeto da aula criada}

NOTA: BUG CONHECIDO - Dialog não dispara mutation
WORKAROUND: Usar endpoint REST em /api/lessons/create
```

#### `lessons.update`
```
Tipo: Mutation
Acesso: Protegido (Professor)
Descrição: Atualizar aula

Parâmetros:
{
  "lessonId": 1,
  "title": "Título Atualizado",
  "content": "Novo conteúdo...",
  "type": "text",
  "order": 1
}

Resposta: {Objeto da aula atualizado}
```

#### `lessons.delete`
```
Tipo: Mutation
Acesso: Protegido (Professor)
Descrição: Deletar aula

Parâmetros:
{
  "lessonId": 1
}

Resposta: {success: true}
```

---

### 3. AVALIAÇÕES (assessments)

#### `assessments.getByLesson`
```
Tipo: Query
Acesso: Protegido
Descrição: Listar avaliações de uma aula

Parâmetros:
{
  "lessonId": 1
}

Resposta:
[
  {
    "id": 1,
    "lessonId": 1,
    "question": "Qual é a definição de dependência?",
    "options": [
      {"id": 1, "text": "Opção A", "isCorrect": true},
      {"id": 2, "text": "Opção B", "isCorrect": false},
      ...
    ],
    "createdAt": "2026-03-08T..."
  }
]
```

#### `assessments.create`
```
Tipo: Mutation
Acesso: Protegido (Professor)
Descrição: Criar avaliação

Parâmetros:
{
  "lessonId": 1,
  "question": "Pergunta?",
  "options": [
    {"text": "Opção A", "isCorrect": true},
    {"text": "Opção B", "isCorrect": false},
    {"text": "Opção C", "isCorrect": false},
    {"text": "Opção D", "isCorrect": false},
    {"text": "Opção E", "isCorrect": false}
  ]
}

Resposta: {Objeto da avaliação criada}
```

#### `assessments.submitAnswer`
```
Tipo: Mutation
Acesso: Protegido (Aluno)
Descrição: Enviar resposta de avaliação

Parâmetros:
{
  "assessmentId": 1,
  "selectedOptionId": 1
}

Resposta:
{
  "isCorrect": true,
  "score": 100,
  "message": "Resposta correta!"
}
```

---

### 4. PROGRESSO (progress)

#### `progress.getByStudent`
```
Tipo: Query
Acesso: Protegido
Descrição: Obter progresso do aluno

Parâmetros:
{
  "studentId": 1,
  "courseId": 60001
}

Resposta:
{
  "studentId": 1,
  "courseId": 60001,
  "lessonsCompleted": 5,
  "totalLessons": 10,
  "percentage": 50,
  "status": "in_progress",
  "startedAt": "2026-03-01T...",
  "completedAt": null
}
```

#### `progress.markLessonComplete`
```
Tipo: Mutation
Acesso: Protegido (Aluno)
Descrição: Marcar aula como concluída

Parâmetros:
{
  "studentId": 1,
  "lessonId": 1
}

Resposta: {success: true}
```

---

### 5. MATRÍCULAS (enrollments)

#### `enrollments.getByStudent`
```
Tipo: Query
Acesso: Protegido
Descrição: Listar cursos do aluno

Parâmetros:
{
  "studentId": 1
}

Resposta:
[
  {
    "id": 1,
    "studentId": 1,
    "courseId": 60001,
    "status": "active",
    "enrolledAt": "2026-03-01T...",
    "completedAt": null
  }
]
```

#### `enrollments.create`
```
Tipo: Mutation
Acesso: Protegido (Admin/Aluno)
Descrição: Matricular aluno em curso

Parâmetros:
{
  "studentId": 1,
  "courseId": 60001
}

Resposta: {Objeto da matrícula criada}
```

---

### 6. PAGAMENTOS (payments)

#### `payments.getByStudent`
```
Tipo: Query
Acesso: Protegido
Descrição: Listar pagamentos do aluno

Parâmetros:
{
  "studentId": 1
}

Resposta:
[
  {
    "id": 1,
    "studentId": 1,
    "courseId": 60001,
    "amount": 2000.00,
    "installment": 1,
    "totalInstallments": 1,
    "dueDate": "2026-03-15",
    "status": "pending",
    "createdAt": "2026-03-01T..."
  }
]
```

#### `payments.create`
```
Tipo: Mutation
Acesso: Protegido (Admin)
Descrição: Registrar pagamento

Parâmetros:
{
  "studentId": 1,
  "courseId": 60001,
  "amount": 2000.00,
  "installment": 1,
  "totalInstallments": 1,
  "dueDate": "2026-03-15"
}

Resposta: {Objeto do pagamento criado}
```

---

### 7. USUÁRIOS (users)

#### `users.getAll`
```
Tipo: Query
Acesso: Protegido (Admin)
Descrição: Listar todos os usuários

Parâmetros:
{
  "limit": 20,
  "offset": 0,
  "role": "student" // Opcional: admin, professor, student
}

Resposta: [Array de usuários]
```

#### `users.getById`
```
Tipo: Query
Acesso: Protegido
Descrição: Obter usuário por ID

Parâmetros:
{
  "userId": 1
}

Resposta: {Objeto do usuário}
```

#### `users.update`
```
Tipo: Mutation
Acesso: Protegido
Descrição: Atualizar usuário

Parâmetros:
{
  "userId": 1,
  "name": "Novo Nome",
  "email": "novo@email.com",
  "role": "professor"
}

Resposta: {Objeto do usuário atualizado}
```

#### `users.delete`
```
Tipo: Mutation
Acesso: Protegido (Admin)
Descrição: Deletar usuário

Parâmetros:
{
  "userId": 1
}

Resposta: {success: true}
```

---

### 8. RELATÓRIOS (reports)

#### `reports.generateCourseReport`
```
Tipo: Query
Acesso: Protegido (Admin)
Descrição: Gerar relatório de curso

Parâmetros:
{
  "courseId": 60001,
  "format": "xlsx" // ou "json", "csv"
}

Resposta: {url: "https://...", filename: "report.xlsx"}
```

#### `reports.generateStudentReport`
```
Tipo: Query
Acesso: Protegido (Admin)
Descrição: Gerar relatório de aluno

Parâmetros:
{
  "studentId": 1,
  "format": "xlsx"
}

Resposta: {url: "https://...", filename: "student-report.xlsx"}
```

#### `reports.generatePaymentReport`
```
Tipo: Query
Acesso: Protegido (Admin)
Descrição: Gerar relatório de pagamentos

Parâmetros:
{
  "startDate": "2026-01-01",
  "endDate": "2026-03-08",
  "format": "xlsx"
}

Resposta: {url: "https://...", filename: "payment-report.xlsx"}
```

---

## 🌐 APIs REST EXTERNAS

### 1. STRIPE CHECKOUT

#### POST /api/stripe/checkout
```
Descrição: Criar sessão de checkout Stripe

Body:
{
  "courseId": 60001,
  "studentId": 1,
  "amount": 2000.00,
  "currency": "BRL"
}

Resposta:
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/pay/cs_test_..."
}

Uso: Redirecionar para url para pagamento
```

---

### 2. MERCADO PAGO CHECKOUT

#### POST /api/mercadopago/checkout
```
Descrição: Criar preferência de pagamento Mercado Pago

Body:
{
  "courseId": 60001,
  "studentId": 1,
  "amount": 2000.00
}

Resposta:
{
  "preferenceId": "123456789",
  "initPoint": "https://www.mercadopago.com.br/checkout/v1/..."
}

Uso: Redirecionar para initPoint para pagamento
```

---

### 3. LIÇÕES (REST - WORKAROUND)

#### POST /api/lessons/create
```
Descrição: Criar aula (Workaround para bug do tRPC)

Headers:
{
  "Authorization": "Bearer {JWT_TOKEN}",
  "Content-Type": "application/json"
}

Body:
{
  "courseId": 60001,
  "moduleId": 1,
  "title": "Aula 1",
  "content": "Conteúdo...",
  "type": "text",
  "order": 1
}

Resposta:
{
  "id": 1,
  "courseId": 60001,
  "moduleId": 1,
  "title": "Aula 1",
  "content": "Conteúdo...",
  "type": "text",
  "order": 1
}
```

---

## 🔔 WEBHOOKS

### 1. STRIPE WEBHOOK

#### POST /api/stripe/webhook
```
Descrição: Receber eventos do Stripe

Headers:
{
  "stripe-signature": "t=...,v1=..."
}

Body: {Evento do Stripe}

Eventos Monitorados:
- checkout.session.completed
- payment_intent.succeeded
- invoice.paid
- customer.created

Ações:
- Criar matrícula do aluno
- Registrar pagamento
- Enviar confirmação por email
- Alertar admin
```

---

### 2. MERCADO PAGO WEBHOOK

#### POST /api/mercadopago/webhook
```
Descrição: Receber notificações do Mercado Pago

Body:
{
  "id": "123456789",
  "topic": "payment",
  "resource": "/v1/payments/123456789"
}

Ações:
- Verificar status do pagamento
- Atualizar matrícula
- Enviar confirmação
```

---

## 🔐 AUTENTICAÇÃO

### OAuth 2.0 (Manus)

#### 1. Iniciar Login
```
GET https://manus.im/oauth/authorize?
  client_id={VITE_APP_ID}&
  redirect_uri=https://educadq-ead.com.br/api/oauth/callback&
  response_type=code&
  scope=openid profile email&
  state={random_state}
```

#### 2. Callback
```
GET /api/oauth/callback?code={code}&state={state}

Ações:
1. Trocar código por token
2. Obter dados do usuário
3. Criar/atualizar usuário no banco
4. Gerar JWT
5. Redirecionar para dashboard
```

#### 3. JWT Token
```
Header:
{
  "Authorization": "Bearer {JWT_TOKEN}"
}

Payload:
{
  "userId": 1,
  "email": "user@example.com",
  "role": "student",
  "iat": 1234567890,
  "exp": 1234571490
}

Assinado com: JWT_SECRET = 6Jce7YR7eAV3yTsJN2sVMU
```

---

## 📝 EXEMPLOS DE REQUISIÇÕES

### JavaScript/Fetch

```javascript
// Listar cursos
const response = await fetch('https://educadq-ead.com.br/api/trpc/courses.getAll', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const courses = await response.json();

// Criar aula (REST)
const lessonResponse = await fetch('https://educadq-ead.com.br/api/lessons/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseId: 60001,
    moduleId: 1,
    title: 'Aula 1',
    content: 'Conteúdo...',
    type: 'text',
    order: 1
  })
});
const lesson = await lessonResponse.json();

// Criar checkout Stripe
const checkoutResponse = await fetch('https://educadq-ead.com.br/api/stripe/checkout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    courseId: 60001,
    studentId: 1,
    amount: 2000.00,
    currency: 'BRL'
  })
});
const { url } = await checkoutResponse.json();
window.location.href = url;
```

### cURL

```bash
# Listar cursos
curl -X GET 'https://educadq-ead.com.br/api/trpc/courses.getAll' \
  -H 'Authorization: Bearer {TOKEN}' \
  -H 'Content-Type: application/json'

# Criar aula
curl -X POST 'https://educadq-ead.com.br/api/lessons/create' \
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

# Criar checkout Stripe
curl -X POST 'https://educadq-ead.com.br/api/stripe/checkout' \
  -H 'Authorization: Bearer {TOKEN}' \
  -H 'Content-Type: application/json' \
  -d '{
    "courseId": 60001,
    "studentId": 1,
    "amount": 2000.00,
    "currency": "BRL"
  }'
```

---

**FIM DA DOCUMENTAÇÃO DE APIs**

Data: 08/03/2026
