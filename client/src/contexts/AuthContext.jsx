// contexts/AuthContext.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fakeAuthLogin } from '../authV2/fakeAuth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = useCallback((role) => {
    const simulatedUser = fakeAuthLogin(role);
    setUser(simulatedUser);
    localStorage.setItem('educadq-bypass-role', role);
    console.warn('🔓 LOGIN BYPASS REALIZADO:', simulatedUser);
    return simulatedUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('educadq-bypass-role');
    console.warn('🔒 LOGOUT BYPASS REALIZADO');
  }, []);

  useEffect(() => {
    // Modo bypass forçado conforme prompt técnico
    const bypassAuth = true;
    
    // Tenta pegar o papel do localStorage ou query param para facilitar a troca de perfil
    const searchParams = new URLSearchParams(window.location.search);
    const roleParam = searchParams.get('role');
    const savedRole = localStorage.getItem('educadq-bypass-role');
    
    // Se houver role na URL, ele tem prioridade e limpa o login anterior se for diferente
    const bypassRole = roleParam || savedRole;

    if (bypassAuth && bypassRole) {
      if (roleParam) localStorage.setItem('educadq-bypass-role', roleParam);
      
      const simulatedUser = fakeAuthLogin(bypassRole);
      setUser(simulatedUser);
      setLoading(false);
      console.warn('🔓 MODO BYPASS ATIVO:', simulatedUser);
    } else {
      // Se não houver nada, apenas para de carregar mas mantém nulo
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
