# 📋 Plano de Implementação - Sistema de Login Completo

## Fase 1: Corrigir Cache de Sessão
- [ ] Implementar endpoint de logout que invalida sessão no servidor
- [ ] Limpar cache de autenticação no frontend
- [ ] Testar logout completo

## Fase 2: Breadcrumb Navigation
- [ ] Criar componente Breadcrumb reutilizável
- [ ] Adicionar breadcrumb em todas as páginas do admin
- [ ] Adicionar breadcrumb em páginas de aluno

## Fase 3: Confirmação de Ações Destrutivas
- [ ] Criar componente ConfirmDialog
- [ ] Adicionar confirmação para deletar cursos
- [ ] Adicionar confirmação para deletar usuários
- [ ] Adicionar confirmação para deletar pagamentos

## Fase 4: Sistema de Múltiplas Contas
- [ ] Criar tabela device_accounts no banco
- [ ] Implementar endpoint GET /device-accounts
- [ ] Implementar endpoint DELETE /device-accounts/:id
- [ ] Atualizar página /login com lista de contas salvas
- [ ] Implementar seleção de conta salva

## Fase 5: Campos Dinâmicos de Registro
- [ ] Criar tabela registration_fields no banco
- [ ] Criar tabela user_registration_data no banco
- [ ] Implementar endpoint GET /registration-fields
- [ ] Atualizar página /register com campos dinâmicos
- [ ] Implementar aba "Campos de Registro" no admin

## Fase 6: Recuperação de Senha
- [ ] Criar tabela password_reset_tokens no banco
- [ ] Implementar endpoint POST /forgot-password
- [ ] Implementar endpoint POST /reset-password
- [ ] Criar página /forgot-password
- [ ] Criar página /reset-password
- [ ] Implementar envio de email com token

## Fase 7: Testes e Auditoria
- [ ] Testar registro completo
- [ ] Testar login tradicional
- [ ] Testar múltiplas contas
- [ ] Testar recuperação de senha
- [ ] Testar rate limiting
- [ ] Testar logout
- [ ] Testar página 403
- [ ] Gerar relatório de auditoria
