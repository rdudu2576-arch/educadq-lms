export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  // Retornar a URL da página de login local em vez de redirecionar para OAuth
  return "/login";
};
