
## Arquitetura

Usuário → Next.js Frontend → API Routes → Drizzle ORM → Supabase PostgreSQL

Serviços externos:
YouTube → vídeos
Google Drive → materiais
Google Meet → aulas ao vivo

Infraestrutura:

GitHub → código
GitHub Actions → CI
Vercel → deploy

### Papéis

ADMIN
- cria cursos
- gerencia alunos
- pagamentos
- relatórios

PROFESSOR
- cria aulas
- avaliações
- acompanha desempenho

ALUNO
- consome cursos
- realiza avaliações
- acompanha progresso
