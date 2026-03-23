// contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { fakeAuthLogin } from '../authV2/fakeAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No ambiente do Manus, vamos usar o modo bypass por padrão para facilitar os testes solicitados
    const bypassAuth = import.meta.env.VITE_BYPASS_AUTH === 'true' || true;
    const bypassRole = import.meta.env.VITE_BYPASS_AUTH_ROLE || 'admin';

    if (bypassAuth) {
      const simulatedUser = fakeAuthLogin(bypassRole);
      setUser(simulatedUser);
      setLoading(false);
      console.warn('🔓 MODO BYPASS ATIVO:', simulatedUser);
    } else {
      // Aqui viria a autenticação real com Supabase/Firebase
      setUser(null);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
