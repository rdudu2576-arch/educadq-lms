import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { getLoginUrl } from "./const";
import { auth } from "@/lib/firebase";
import "./index.css";

// Verificar se estamos em modo bypass
const isBypassMode = () => {
  try {
    return localStorage.getItem('educadq-bypass-role') !== null;
  } catch {
    return false;
  }
};

// Se estiver em modo bypass, renderizar sem tRPC
if (isBypassMode()) {
  console.warn("🔓 MODO BYPASS ATIVO - Renderizando sem tRPC");
  
  const queryClient = new QueryClient();
  
  createRoot(document.getElementById("root")!).render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  );
} else {
  // Em modo normal, renderizar com tRPC
  const queryClient = new QueryClient();

  const redirectToLoginIfUnauthorized = (error: unknown, queryKey?: any) => {
    if (!(error instanceof TRPCClientError)) return;
    if (typeof window === "undefined") return;

    const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
    if (!isUnauthorized) return;

    const currentPath = window.location.pathname;
    
    // Lista de rotas públicas que NÃO devem redirecionar para login se não estiver autenticado
    const publicPaths = ["/", "/login", "/register", "/forgot-password", "/cursos", "/artigos", "/cursos-gratuitos"];
    const isPublicPath = publicPaths.includes(currentPath) || 
                         currentPath.startsWith("/artigos/") || 
                         currentPath.startsWith("/curso/") ||
                         currentPath.startsWith("/aluno/") ||
                         currentPath.startsWith("/profissional/");

    // A query 'auth.me' é usada para verificar o estado inicial e não deve causar redirecionamento global
    const isAuthMe = Array.isArray(queryKey) && queryKey[0] === 'auth' && queryKey[1] === 'me';
    
    if (isPublicPath || isAuthMe) {
      return;
    }

    window.location.href = getLoginUrl();
  };

  queryClient.getQueryCache().subscribe(event => {
    if (event.type === "updated" && event.action.type === "error") {
      const error = event.query.state.error;
      const queryKey = event.query.queryKey;
      redirectToLoginIfUnauthorized(error, queryKey);
      console.error("[API Query Error]", error);
    }
  });

  queryClient.getMutationCache().subscribe(event => {
    if (event.type === "updated" && event.action.type === "error") {
      const error = event.mutation.state.error;
      redirectToLoginIfUnauthorized(error);
      console.error("[API Mutation Error]", error);
    }
  });

  const trpcClient = trpc.createClient({
    links: [
      httpBatchLink({
        url: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/trpc` : "/api/trpc",
        transformer: superjson,
        async headers() {
          return {};
        },
        fetch(input, init) {
          return globalThis.fetch(input, {
            ...(init ?? {}),
            credentials: "include",
          });
        },
      }),
    ],
  });

  createRoot(document.getElementById("root")!).render(
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
