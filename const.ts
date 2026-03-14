export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Manus OAuth removed – now redirects to internal login page.
export const getLoginUrl = () => {
  if (typeof window === "undefined") {
    return "/login";
  }

  const redirectUri = `${window.location.origin}/login`;
  return redirectUri;
};
