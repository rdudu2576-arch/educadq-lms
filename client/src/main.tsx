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
import { createMockLink } from "@/lib/mockLink";
import "./index.css";

const queryClient = new QueryClient();

// Verificar se estamos em modo bypass
const isBypassMode = () => {
  try {
    return localStorage.getItem('educadq-bypass-role') !== null;
  } catch {
    return false;
  }
};

const redirectToLoginIfUnauthorized = (error: unknown, queryKey?: any) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  // Se estamos em modo bypass, ignorar erros de rede completamente
  if (isBypassMode()) {
    console.warn("[BYPASS MODE] Ignorando erro de rede:", error.message);
    return;
  }

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
    
    // Silenciar erros de rede em modo bypass
    if (!isBypassMode()) {
      console.error("[API Query Error]", error);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    
    // Silenciar erros de rede em modo bypass
    if (!isBypassMode()) {
      console.error("[API Mutation Error]", error);
    }
  }
});

// Criar o cliente tRPC com suporte a bypass
const createTrpcClient = () => {
  // Se estiver em modo bypass, usar o mockLink como primeiro link
  if (isBypassMode()) {
    console.warn("🔓 MODO BYPASS ATIVO - Mock Link habilitado para tRPC");
    
    return trpc.createClient({
      links: [
        createMockLink(),
      ],
    });
  }

  // Em modo normal, usar httpBatchLink
  return trpc.createClient({
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
};

const trpcClient = createTrpcClient();

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
