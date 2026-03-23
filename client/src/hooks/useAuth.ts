import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";
import { useAuth as useBypassAuth } from "@/contexts/AuthContext";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = getLoginUrl() } =
    options ?? {};
  
  // 1. Tentar obter o usuário do AuthContext (Bypass)
  const bypass = useBypassAuth();
  
  // 2. Query real do tRPC (para quando o bypass estiver desligado)
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: true,
    enabled: !bypass.user, // Só roda se não houver usuário bypass
  });

  const logoutMutation = trpc.auth.logout.useMutation();

  const logout = useCallback(async () => {
    try {
      // Se estiver em modo bypass, apenas recarregue ou limpe (o bypass é forçado no context)
      if (bypass.user) {
        window.location.href = "/login";
        return;
      }
      await logoutMutation.mutateAsync();
      window.location.href = "/login";
    } catch (error: unknown) {
      console.error("Erro ao fazer logout:", error);
      window.location.href = "/login";
    }
  }, [logoutMutation, bypass.user]);

  const state = useMemo(() => {
    // Prioridade total para o usuário do Bypass se ele existir
    const user = bypass.user || meQuery.data || null;
    const loading = bypass.loading || (bypass.user ? false : meQuery.isLoading);

    if (user) {
      localStorage.setItem(
        "manus-runtime-user-info",
        JSON.stringify(user)
      );
    }

    return {
      user,
      loading,
      error: meQuery.error ?? null,
      isAuthenticated: !!user,
    };
  }, [
    bypass.user,
    bypass.loading,
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated || state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    
    const currentPath = window.location.pathname;
    if (currentPath === redirectPath) return;
    
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
