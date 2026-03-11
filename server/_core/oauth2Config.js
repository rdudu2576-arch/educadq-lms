import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
/**
 * Configurar OAuth2 com Google
 */
export function configureGoogleOAuth() {
    var googleClientID = process.env.GOOGLE_CLIENT_ID;
    var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    var googleCallbackURL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/api/auth/google/callback";
    if (!googleClientID || !googleClientSecret) {
        console.warn("[OAuth] Google OAuth não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET");
        return;
    }
    passport.use(new GoogleStrategy({
        clientID: googleClientID,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackURL,
    }, function (accessToken, refreshToken, profile, done) {
        var oauthProfile = {
            id: profile.id,
            displayName: profile.displayName,
            emails: profile.emails || [],
            photos: profile.photos || [],
            provider: "google",
        };
        done(null, oauthProfile);
    }));
    console.log("[OAuth] Google OAuth configurado");
}
/**
 * Configurar OAuth2 com GitHub
 */
export function configureGitHubOAuth() {
    var githubClientID = process.env.GITHUB_CLIENT_ID;
    var githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
    var githubCallbackURL = process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/api/auth/github/callback";
    if (!githubClientID || !githubClientSecret) {
        console.warn("[OAuth] GitHub OAuth não configurado. Defina GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET");
        return;
    }
    passport.use(new GitHubStrategy({
        clientID: githubClientID,
        clientSecret: githubClientSecret,
        callbackURL: githubCallbackURL,
    }, function (accessToken, refreshToken, profile, done) {
        var oauthProfile = {
            id: profile.id.toString(),
            displayName: profile.displayName || profile.username || "",
            emails: profile.emails || [],
            photos: profile.photos || [],
            provider: "github",
        };
        done(null, oauthProfile);
    }));
    console.log("[OAuth] GitHub OAuth configurado");
}
/**
 * Serializar usuário para sessão
 */
export function setupPassportSerialization() {
    passport.serializeUser(function (user, done) {
        done(null, user);
    });
    passport.deserializeUser(function (user, done) {
        done(null, user);
    });
}
/**
 * Inicializar OAuth2
 */
export function initializeOAuth2() {
    configureGoogleOAuth();
    configureGitHubOAuth();
    setupPassportSerialization();
}
