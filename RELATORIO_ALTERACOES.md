# Relatório de Alterações - Plataforma EducaDQ (AuthV2 Bypass)

Este relatório detalha todas as modificações realizadas no repositório para implementar a autenticação bypass temporária, dashboards específicos e proteções de conteúdo conforme o prompt técnico.

## 1. Autenticação e Contexto (AuthV2)
- **`client/src/authV2/fakeAuth.js`**: Criado módulo com perfis simulados para Admin, Professor, Aluno e Desenvolvedor, incluindo permissões específicas.
- **`client/src/contexts/AuthContext.jsx`**: Implementado contexto reativo que gerencia o estado de login bypass localmente via `localStorage`. Renomeado de `.js` para `.jsx` para compatibilidade com Vite/Vercel.
- **`client/src/hooks/useAuth.ts`**: Refatorado para priorizar o estado do bypass e desabilitar automaticamente queries ao servidor (tRPC) quando um usuário simulado está ativo.

## 2. Interface e Dashboards
- **`client/src/pages/LoginPage.tsx`**: Totalmente reconstruída para interceptar e-mails de teste (`admin@educadq.com`, etc.) antes de qualquer chamada de rede. Adicionado suporte a parâmetro de URL `?role=admin` para preenchimento automático e redirecionamento local.
- **`client/src/pages/AdminDashboard.jsx`**: Atualizado para permitir acesso aos perfis `admin` e `desenvolvedor`. Corrigidos guards de permissão.
- **`client/src/pages/MonitorPage.jsx`**: Atualizado para permitir acesso ao perfil `desenvolvedor`, com ferramentas de depuração (Logs, WebSocket simulado, State Inspector).
- **`client/src/components/ProtectedRoute.tsx`**: Ajustado para validar os novos papéis (`professor`, `aluno`, `desenvolvedor`) e garantir o fluxo correto de redirecionamento.

## 3. Sistema de Aulas e Proteção
- **`client/src/components/AulaProtegida.jsx`**: Criado componente que implementa:
  - Bloqueio de `CTRL+C` e `CTRL+V`.
  - Bloqueio de seleção de texto.
  - Bloqueio de menu de contexto (botão direito).
- **`client/src/pages/CourseView.tsx`**: Integrado o componente de proteção nas aulas de texto e adicionado o botão "Continuar" para navegação entre módulos.

## 4. Estabilidade e Deploy (Vercel)
- **`client/src/main.tsx`**: Modificação crítica para silenciar erros de rede globais (`ENOTFOUND base`). Implementada lógica que **remove o `trpc.Provider`** quando o modo bypass está ativo, garantindo que o frontend funcione 100% offline em relação ao backend.
- **Correção de Extensões**: Renomeação de arquivos `.js` para `.jsx` e atualização de todas as importações para evitar erros de build no ambiente de produção.

## 5. Backend (Servidor)
- **`server/domain/courses/courses.ts`**: Adicionado procedimento de exclusão (`delete`) ao roteador de cursos para completar o CRUD administrativo.

---
**Status Atual:** O deploy na Vercel está em estado `READY`. O sistema deve permitir o acesso imediato via link de bypass sem exibir erros de rede.
