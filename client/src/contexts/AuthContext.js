// contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { fakeAuthLogin } from '../authV2/fakeAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Modo bypass forçado conforme prompt técnico
    const bypassAuth = true;
    
    // Tenta pegar o papel do localStorage ou query param para facilitar a troca de perfil
    const searchParams = new URLSearchParams(window.location.search);
    const roleParam = searchParams.get('role');
    const savedRole = localStorage.getItem('educadq-bypass-role');
    
    const bypassRole = roleParam || savedRole || 'admin';

    if (bypassAuth) {
      if (roleParam) localStorage.setItem('educadq-bypass-role', roleParam);
      
      const simulatedUser = fakeAuthLogin(bypassRole);
      setUser(simulatedUser);
      setLoading(false);
      console.warn('🔓 MODO BYPASS ATIVO:', simulatedUser);
    } else {
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
