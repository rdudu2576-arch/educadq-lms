import { TRPCLink } from "@trpc/client";

// Dados mockados para o bypass
const mockData: Record<string, any> = {
  "auth.me": {
    id: "user-001",
    email: "user@educadq.com",
    name: "Usuário Teste",
    role: "aluno",
  },
  "auth.login": {
    success: true,
    message: "Login realizado com sucesso",
  },
  "auth.logout": {
    success: true,
    message: "Logout realizado com sucesso",
  },
  "admin.getStatistics": {
    totalCourses: 12,
    totalStudents: 245,
    totalRevenue: 15750.50,
    completionRate: 78,
  },
  "courses.listar": [
    {
      id: "curso-001",
      titulo: "Introdução ao Álcool e Drogas",
      descricao: "Curso fundamental sobre educação em saúde",
      cargaHoraria: 40,
      valor: 299.90,
      capaUrl: "https://via.placeholder.com/400x300?text=Curso+1",
      trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      professorResponsavel: "prof-001",
      notaMinima: 70,
      numeroParcelas: 3,
      status: "ativo",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
    {
      id: "curso-002",
      titulo: "Prevenção e Reabilitação",
      descricao: "Estratégias de prevenção e tratamento",
      cargaHoraria: 60,
      valor: 499.90,
      capaUrl: "https://via.placeholder.com/400x300?text=Curso+2",
      trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      professorResponsavel: "prof-002",
      notaMinima: 75,
      numeroParcelas: 4,
      status: "ativo",
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    },
  ],
  "courses.obter": {
    id: "curso-001",
    titulo: "Introdução ao Álcool e Drogas",
    descricao: "Curso fundamental sobre educação em saúde",
    cargaHoraria: 40,
    valor: 299.90,
    capaUrl: "https://via.placeholder.com/400x300?text=Curso+1",
    trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    professorResponsavel: "prof-001",
    notaMinima: 70,
    numeroParcelas: 3,
    status: "ativo",
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  },
};

// Mock Link para tRPC - Versão sem Observable
export const createMockLink = (): TRPCLink<any> => {
  return ({ next, op }) => {
    // Se estiver em modo bypass, retornar dados mockados
    const key = op.path;
    const data = mockData[key];

    // Se encontrou dados mockados, retornar imediatamente
    if (data !== undefined) {
      return {
        subscribe(observer: any) {
          // Simular delay mínimo
          setTimeout(() => {
            observer.next({
              result: {
                data,
              },
            });
            observer.complete();
          }, 50);

          // Retornar função de cleanup
          return () => {};
        },
      };
    }

    // Se não encontrou, passar para o próximo link
    return next(op);
  };
};
