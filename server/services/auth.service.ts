import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { getDb, getUserByEmail } from "../infra/db.js";
import { users } from "../infra/schema.pg.js";
import bcrypt from "bcryptjs";

// ============================================================================
// CONSTANTS
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "7d";
const BCRYPT_ROUNDS = 10;
const JWT_ALGORITHM = "HS256";

// Validate configuration at module load time
if (!JWT_SECRET) {
  console.warn("[Auth] JWT_SECRET environment variable is not set. Using default for development.");
}

const SECRET = JWT_SECRET || "development-secret-key";

// ============================================================================
// TYPES
// ============================================================================

export interface JWTPayload {
  id: number;
  email: string;
  role: "admin" | "professor" | "user";
}

// ============================================================================
// PASSWORD HASHING
// ============================================================================

/**
 * Hash password with bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, BCRYPT_ROUNDS);
  } catch (error) {
    throw new Error(`Failed to hash password: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Compare plain text password with hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if passwords match
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Failed to compare passwords: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

// ============================================================================
// JWT TOKEN MANAGEMENT
// ============================================================================

/**
 * Generate JWT token
 * @param payload - Token payload
 * @returns Signed JWT token
 */
export function generateToken(payload: JWTPayload): string {
  try {
    return jwt.sign(payload, SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: JWT_ALGORITHM,
    });
  } catch (error) {
    throw new Error(`Failed to generate token: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload if valid, null if invalid
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET, {
      algorithms: [JWT_ALGORITHM],
    });
    return decoded as JWTPayload;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Auth] Token verification failed: ${errorMessage}`);
    return null;
  }
}

// Compatibility with context.ts
export async function verifyFirebaseToken(token: string): Promise<JWTPayload | null> {
  return verifyToken(token);
}

// ============================================================================
// USER AUTHENTICATION
// ============================================================================

/**
 * Login user with email and password
 * @param email - User email
 * @param password - User password
 * @returns User data and JWT token
 */
export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.password) {
    throw new Error("User account is not properly configured for password login");
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken({
    id: user.id,
    email: user.email!,
    role: user.role as "admin" | "professor" | "user",
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  };
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
