import { eq } from "drizzle-orm";
import { getDb, getUserByEmail } from "../infra/db.js";
import { users } from "../infra/schema.pg.js";
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "educadq-auth",
  });
}

// ============================================================================
// TYPES
// ============================================================================

export interface JWTPayload {
  id: number;
  email: string;
  role: "admin" | "professor" | "user";
}

// ============================================================================
// JWT TOKEN MANAGEMENT (FIREBASE)
// ============================================================================

/**
 * Verify Firebase ID Token
 * @param token - Firebase ID token to verify
 * @returns Decoded payload if valid, null if invalid
 */
export async function verifyFirebaseToken(token: string): Promise<JWTPayload | null> {
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    const email = decodedToken.email;

    if (!email) return null;

    // Buscar o usuário no nosso banco pelo email do Firebase
    const user = await getUserByEmail(email);
    
    if (!user) {
      console.log(`[Auth] User with email ${email} not found in local database`);
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      role: user.role as "admin" | "professor" | "user",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Auth] Firebase token verification failed: ${errorMessage}`);
    return null;
  }
}

// Mantendo as funções antigas por compatibilidade de tipos se necessário, 
// mas marcando-as ou adaptando-as
export function verifyToken(token: string): JWTPayload | null {
  // Esta função agora é síncrona mas a verificação do Firebase é assíncrona.
  // No contexto do tRPC, usaremos a versão assíncrona.
  return null; 
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Get user by ID
 * @param id - User ID
 * @returns User data or null if not found
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`[Auth] Failed to get user by ID: ${error instanceof Error ? error.message : "Unknown error"}`);
    return null;
  }
}

// Stub functions for other parts of the system that might still call them
export async function hashPassword(password: string) { return password; }
export async function comparePassword(password: string, hash: string) { return true; }
export function generateToken(payload: any) { return "firebase-token-used"; }
export async function loginUser(email: string, password: any) { 
  const user = await getUserByEmail(email);
  if (!user) throw new Error("User not found");
  return { user, token: "firebase-token-used" };
}
