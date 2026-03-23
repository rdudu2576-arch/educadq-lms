import { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";

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

// Mock Link para tRPC - Versão Simplificada
export const createMockLink = (): TRPCLink<any> => {
  return ({ next, op }) => {
    return observable((observer) => {
      // Construir a chave de dados baseada no caminho
      const key = op.path;
      
      // Simular delay de rede
      const timer = setTimeout(() => {
        try {
          // Buscar dados mockados pela chave
          const data = mockData[key] || {};

          // Retornar o resultado mockado no formato esperado pelo tRPC
          observer.next({
            result: {
              data,
            },
          });
          observer.complete();
        } catch (error) {
          console.error("[Mock Link Error]", error);
          observer.error(error);
        }
      }, 100); // Simular 100ms de latência

      return () => clearTimeout(timer);
    });
  };
};
