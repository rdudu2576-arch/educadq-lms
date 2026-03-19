import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { auth } from "@/lib/firebase";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown, queryKey?: any) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
  if (!isUnauthorized) return;

  const currentPath = window.location.pathname;
  const isAuthMe = Array.isArray(queryKey) && queryKey[0] === 'auth' && queryKey[1] === 'me';
  
  if (currentPath === "/login" || currentPath === "/register" || isAuthMe) {
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
        // PROBLEMA IDENTIFICADO: O frontend tentava enviar um token do Firebase no header Authorization.
        // CAUSA RAIZ: O backend foi migrado para JWT/Cookies, tornando o token do Firebase irrelevante ou conflitante.
        // CORREÇÃO: Removida a lógica de header do Firebase. O backend agora usa cookies HttpOnly (credentials: "include").
        // POR QUE RESOLVE: Permite que o navegador envie automaticamente o cookie JWT, simplificando o fluxo.
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
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
