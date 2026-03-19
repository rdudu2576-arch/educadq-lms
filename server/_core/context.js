// 🔥 Importa o Firebase Admin (backend)
import admin from "firebase-admin";

/**
 * 🚀 Inicializa o Firebase Admin
 * Isso conecta seu backend ao Firebase
 * Só roda uma vez (evita erro em hot reload / serverless)
 */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // 🔑 Dados da sua service account (vem do .env)
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

      // ⚠️ Corrige quebra de linha da chave privada
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

/**
 * 🎯 FUNÇÃO PRINCIPAL DO CONTEXTO (tRPC)
 * Aqui o backend tenta descobrir quem é o usuário
 */
export async function createContext(opts) {
  // 👤 Começa sem usuário autenticado
  let user = null;

  try {
    /**
     * 🔴 ANTES (REMOVIDO):
     * Seu código antigo usava:
     * opts.req.cookies?.token ❌
     *
     * 👉 Isso NÃO funciona com Firebase
     */

    /**
     * ✅ AGORA:
     * Pegamos o token do HEADER Authorization
     * Exemplo:
     * Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6...
     */
    const authHeader = opts.req.headers.authorization;

    /**
     * 🔍 Verifica se existe token e se está no formato correto
     */
    if (authHeader && authHeader.startsWith("Bearer ")) {
      
      // ✂️ Remove o "Bearer " e pega só o token
      const token = authHeader.split(" ")[1];

      /**
       * 🔥 Valida o token com o Firebase
       * Se for válido → retorna dados do usuário
       */
      const decoded = await admin.auth().verifyIdToken(token);

      /**
       * 👤 Cria o objeto user que o tRPC vai usar
       */
      user = {
        id: decoded.uid,
        email: decoded.email,
      };
    }

  } catch (error) {
    /**
     * ⚠️ Se der qualquer erro:
     * - token inválido
     * - token expirado
     * - erro no Firebase
     *
     * 👉 usuário continua NULL (não autenticado)
     */
    console.error("[Auth] Context error:", error);
    user = null;
  }

  /**
   * 📦 Retorno do contexto
   * Isso é o que chega no ctx.user lá no tRPC
   */
  return {
    req: opts.req,
    res: opts.res,

    // 🔥 ESSA LINHA É A MAIS IMPORTANTE
    user,
  };
}
