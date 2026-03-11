import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
export default function ProtectedRoute(_a) {
    var path = _a.path, Component = _a.component, requiredRole = _a.requiredRole;
    var _b = useAuth(), user = _b.user, loading = _b.loading;
    var _c = useLocation(), setLocation = _c[1];
    if (loading) {
        return (<Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary"/>
          <span className="ml-2 text-muted-foreground">Carregando...</span>
        </div>
      </Route>);
    }
    if (!user) {
        // Allow access to /login even when not authenticated
        if (path === "/login" || path === "/register") {
            return <Route path={path} component={Component}/>;
        }
        return (<Route path={path}>
        {function () {
                setLocation("/login");
                return null;
            }}
      </Route>);
    }
    if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
        return (<Route path={path}>
        <Redirect to="/403"/>
      </Route>);
    }
    return <Route path={path} component={Component}/>;
}
