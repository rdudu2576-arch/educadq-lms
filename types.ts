/**
 * SHARED TYPES - CONTRATO OBRIGATÓRIO
 * 
 * ⚠️ REGRA CRÍTICA:
 * Todos os tipos de User, Auth, Roles devem estar aqui.
 * Frontend E Backend devem importar DAQUI.
 * Nenhuma redefinição local é permitida.
 * 
 * Se você tentar redefinir localmente, o build falhará.
 */

// Re-export schema types
export type * from "../drizzle/schema";
export * from "./_core/errors";

// ============================================================================
// USER TYPES
// ============================================================================

export type UserRole = "admin" | "professor" | "user";

export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
  token?: string;
  message?: string;
}

export interface AuthContext {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// JWT PAYLOAD
// ============================================================================

export interface JWTPayload {
  id: number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// ============================================================================
// COURSE TYPES
// ============================================================================

export interface CourseEnrollment {
  id: number;
  userId: number;
  courseId: number;
  status: "active" | "completed" | "suspended";
  progress: number;
  enrolledAt: Date;
  completedAt: Date | null;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentProvider {
  id: number;
  name: string;
  type: "mercado_pago" | "stripe" | "payseguro";
  isActive: boolean;
  config: Record<string, string>;
  createdAt: Date;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export function isValidRole(role: unknown): role is UserRole {
  return role === "admin" || role === "professor" || role === "user";
}
