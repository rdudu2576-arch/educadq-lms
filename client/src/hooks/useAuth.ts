import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  const utils = trpc.useUtils();
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [fbLoading, setFbLoading] = useState(true);

  // PROBLEMA IDENTIFICADO: O hook useAuth dependia exclusivamente do estado do Firebase.
  // CAUSA RAIZ: O sistema foi migrado para JWT/Cookies no backend, mas o frontend ainda buscava o Firebase.
  // CORREÇÃO: Alterado para depender da query 'me' do tRPC, que valida o cookie JWT.
  // POR QUE RESOLVE: Garante que a sessão seja persistida via cookies, independente do Firebase.
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
  });

  const logoutMutation = trpc.auth.logout.useMutation();

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
      window.location.href = "/login";
    } catch (error: unknown) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  }, [utils, logoutMutation]);

  const state = useMemo(() => {
    const user = meQuery.data ?? null;
    
    if (user) {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(user)
      );
    }

    return {
      user,
      loading: meQuery.isLoading,
      error: meQuery.error ?? null,
      isAuthenticated: !!meQuery.data,
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
  ]);

  useEffect(() => {
    // Só redireciona se explicitamente solicitado e se não estiver carregando
    if (!redirectOnUnauthenticated || state.loading) return;
    
    // Se já estiver autenticado, não redireciona
    if (state.user) return;
    
    if (typeof window === "undefined") return;
    
    const currentPath = window.location.pathname;

    // Evita loop de redirecionamento
    if (currentPath === redirectPath) return;
    
    // Lista de rotas públicas que NUNCA devem redirecionar automaticamente via hook
    const publicPaths = ["/", "/login", "/register", "/forgot-password", "/cursos", "/artigos", "/cursos-gratuitos"];
    const isPublicPath = publicPaths.includes(currentPath) || 
                         currentPath.startsWith("/artigos/") || 
                         currentPath.startsWith("/curso/") ||
                         currentPath.startsWith("/aluno/") ||
                         currentPath.startsWith("/profissional/");

    if (isPublicPath) return;

    window.location.href = redirectPath;
  }, [
    redirectOnUnauthenticated,
    redirectPath,
    state.loading,
    state.user,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
