# Relatório de Problemas de UX - Navegação como Usuário Sem Conhecimento

## Problemas Identificados na Homepage

### 1. **Falta de Botão de Retorno**
- Não há botão "Voltar" ou "Home" em páginas internas
- Usuário fica preso em páginas de detalhe sem forma de retornar

### 2. **Navegação Confusa**
- Menu principal tem links para "Cursos", "Artigos", "Sobre", "Contato"
- Não está claro qual é a página atual
- Não há indicação visual de página ativa

### 3. **Falta de Breadcrumb**
- Não há navegação por breadcrumb em páginas de detalhe
- Usuário não sabe em que nível da hierarquia está

### 4. **Botões Não Funcionam**
- Botão "Explorar Cursos" (elemento 7) - precisa verificar se funciona
- Botões "Ver detalhes" em cursos - precisa verificar destino

### 5. **Falta de Informações de Contato Visíveis**
- WhatsApp (41) 98891-3431 aparece apenas no rodapé
- Email de contato não está visível
- Formulário de contato não está acessível

### 6. **Páginas Não Encontradas**
- Link "Sobre" - precisa verificar se existe página
- Link "Contato" - precisa verificar se existe página

### 7. **Responsividade**
- Menu mobile não está visível em telas pequenas
- Botões podem estar muito pequenos em celulares

## Próximos Passos

1. Testar clique em "Explorar Cursos"
2. Testar clique em "Ver detalhes" de um curso
3. Testar navegação para "Artigos"
4. Testar navegação para "Sobre"
5. Testar navegação para "Contato"
6. Testar login/cadastro
7. Testar dashboard do aluno
8. Testar busca de profissionais


## Problemas Adicionais Encontrados

### 8. **Curso Não Encontrado (Erro 404)**
- Ao clicar em "Ver detalhes" do primeiro curso, a página mostra "Curso não encontrado"
- Problema: Os cursos têm ID numérico (30001) mas a rota espera slug (ex: /curso/conselheiro-terapeuta)
- Solução: Usar slug em vez de ID nas rotas

### 9. **Botão "Voltar à página inicial" Funciona**
- ✅ Botão de retorno está presente na página de erro 404
- Mas falta em outras páginas internas

### 10. **Falta de Navegação em Páginas Internas**
- Páginas de detalhe não têm botão "Voltar"
- Não há breadcrumb navigation
- Usuário fica preso se não souber usar o botão de voltar do navegador

## Resumo de Problemas Críticos

1. **Rotas de Cursos Quebradas** - Usar slug em vez de ID
2. **Falta de Botões de Retorno** - Adicionar em todas as páginas internas
3. **Falta de Breadcrumb** - Adicionar navegação por breadcrumb
4. **Navegação Confusa** - Melhorar indicação de página ativa
5. **Páginas "Sobre" e "Contato" Não Testadas** - Verificar se existem

## Próximas Ações

1. Corrigir rotas de cursos para usar slug
2. Adicionar botão "Voltar" em todas as páginas
3. Adicionar breadcrumb navigation
4. Testar páginas "Sobre" e "Contato"
5. Implementar editor de conteúdo de páginas no admin
