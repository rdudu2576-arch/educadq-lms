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

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setFbLoading(false);
      
      // Quando o estado do Firebase muda, invalidamos a query do tRPC
      // para que o backend também se atualize se necessário
      utils.auth.me.invalidate();
    });
    return () => unsubscribe();
  }, [utils]);

  // Backend query to get user details (role, etc)
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    // Só habilitamos se tivermos um usuário no Firebase
    enabled: !!firebaseUser,
  });

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // Opcionalmente chamar o logout do backend para limpar cookies
      // mas o principal agora é o Firebase
      utils.auth.me.setData(undefined, null);
      await utils.auth.me.invalidate();
    } catch (error: unknown) {
      console.error("Erro ao fazer logout:", error);
      throw error;
    }
  }, [utils]);

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
      firebaseUser,
      loading: fbLoading || (!!firebaseUser && meQuery.isLoading),
      error: meQuery.error ?? null,
      isAuthenticated: !!firebaseUser && !!meQuery.data,
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    firebaseUser,
    fbLoading,
  ]);

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading) return;
    if (state.user) return;
    if (typeof window === "undefined") return;
    if (window.location.pathname === redirectPath) return;

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
