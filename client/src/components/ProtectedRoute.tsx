import { Route, Redirect } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>;
  requiredRole?: "admin" | "user" | "professor" | "aluno" | "desenvolvedor";
}

export default function ProtectedRoute({ path, component: Component, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Carregando...</span>
        </div>
      </Route>
    );
  }

  if (!user) {
    // Allow access to /login even when not authenticated
    if (path === "/login" || path === "/register") {
      return <Route path={path} component={Component} />;
    }
    
    return (
      <Route path={path}>
        {() => {
          setLocation("/login");
          return null;
        }}
      </Route>
    );
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin" && user.role !== "desenvolvedor") {
    return (
      <Route path={path}>
        <Redirect to="/403" />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
