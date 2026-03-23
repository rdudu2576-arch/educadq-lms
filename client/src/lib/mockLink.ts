import { TRPCLink } from "@trpc/client";
import { observable } from "@trpc/server/observable";

// Dados mockados para o bypass
const mockData = {
  admin: {
    getStatistics: {
      totalCourses: 12,
      totalStudents: 245,
      totalRevenue: 15750.50,
      completionRate: 78,
    },
  },
  courses: {
    list: [
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
  },
  auth: {
    me: {
      id: "user-001",
      email: "user@educadq.com",
      name: "Usuário Teste",
      role: "aluno",
    },
    login: {
      success: true,
      message: "Login realizado com sucesso",
    },
    logout: {
      success: true,
      message: "Logout realizado com sucesso",
    },
  },
};

// Mock Link para tRPC
export const createMockLink = (): TRPCLink<any> => {
  return ({ next, op }) => {
    return observable((observer) => {
      // Simular delay de rede
      const timer = setTimeout(() => {
        try {
          const path = op.path.split(".");
          let data: any = mockData;

          // Navegar pela estrutura de dados mockados
          for (const segment of path) {
            if (data && typeof data === "object" && segment in data) {
              data = data[segment];
            } else {
              // Se não encontrar, retornar um objeto vazio
              data = {};
              break;
            }
          }

          // Retornar o resultado mockado
          observer.next({
            result: {
              data,
            },
          });
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 100); // Simular 100ms de latência

      return () => clearTimeout(timer);
    });
  };
};
