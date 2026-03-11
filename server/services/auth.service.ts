import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { getDb } from "../infra/db.js";
import { users } from "../infra/schema.pg.js";
import bcrypt from "bcryptjs";

// ============================================================================
// CONSTANTS
// ============================================================================

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "7d";
const BCRYPT_ROUNDS = 10;
const JWT_ALGORITHM = "HS256" as const;

// Validate configuration at module load time
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

// ============================================================================
// TYPES
// ============================================================================

export interface JWTPayload {
  id: number;
  email: string;
  role: "admin" | "professor" | "user";
}

export interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: "admin" | "professor" | "user";
  };
  token: string;
}

export interface RegisterResponse {
  user: {
    id: number;
    email: string;
    name: string | null;
    role: "admin" | "professor" | "user";
  };
  token: string;
}

// ============================================================================
// PASSWORD HASHING
// ============================================================================

/**
 * Hash password with bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 * @throws Error if hashing fails
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
 * @returns True if passwords match, false otherwise
 * @throws Error if comparison fails
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
 * @throws Error if token generation fails
 */
export function generateToken(payload: JWTPayload): string {
  try {
    return jwt.sign(payload, JWT_SECRET!, {
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
 * @throws Never - returns null on error instead
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      algorithms: [JWT_ALGORITHM],
    });
    return decoded as JWTPayload;
  } catch (error) {
    // Log error but don't throw - authentication is optional for public procedures
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Auth] Token verification failed: ${errorMessage}`);
    return null;
  }
}

// ============================================================================
// USER AUTHENTICATION
// ============================================================================

/**
 * Login user with email and password
 * @param email - User email
 * @param password - User password
 * @returns User data and JWT token
 * @throws Error if login fails
 */
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  // Validate inputs
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Get database connection
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Find user by email
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];

  // Validate user exists
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Validate user has password set
  if (!user.password) {
    throw new Error("User account is not properly configured");
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  // Generate token
  const token = generateToken({
    id: user.id,
    email: user.email!,
    role: user.role as "admin" | "professor" | "user",
  });

  return {
    user: {
      id: user.id,
      email: user.email!,
      name: user.name,
      role: user.role as "admin" | "professor" | "user",
    },
    token,
  };
}

/**
 * Register new user
 * @param email - User email
 * @param password - User password
 * @param name - User name
 * @returns User data and JWT token
 * @throws Error if registration fails
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
  // Validate inputs
  if (!email || !password || !name) {
    throw new Error("Email, password, and name are required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Get database connection
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Check if user already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate unique openId
  const openId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create user
  const result = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role: "user",
    openId,
  } as any);

  // Get created user
  const newUserResult = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const newUser = newUserResult[0];

  if (!newUser) {
    throw new Error("Failed to create user");
  }

  // Generate token
  const token = generateToken({
    id: newUser.id,
    email: newUser.email!,
    role: newUser.role as "admin" | "professor" | "user",
 });

  return {
    user: {
      id: newUser.id,
      email: newUser.email!,
      name: newUser.name,
      role: newUser.role as "admin" | "professor" | "user",
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

/**
 * Create admin user (for initialization)
 * @param email - Admin email
 * @param password - Admin password
 * @param name - Admin name
 * @throws Error if creation fails
 */
export async function createAdminUser(
  email: string,
  password: string,
  name: string = "Administrator"
): Promise<void> {
  // Validate inputs
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Get database connection
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Check if admin already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`[Auth] Admin user ${email} already exists`);
    return;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate unique openId
  const openId = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create admin user
  await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role: "admin",
    openId,
  } as any);

  console.log(`[Auth] Admin user created: ${email}`);
}

/**
 * Update user password
 * @param userId - User ID
 * @param newPassword - New password
 * @throws Error if update fails
 */
export async function updateUserPassword(userId: number, newPassword: string): Promise<void> {
  // Validate inputs
  if (!newPassword || newPassword.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Get database connection
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password
  await db
    .update(users)
    .set({ password: hashedPassword} as any)
    .where(eq(users.id, userId));
}

/**
 * Update user role (admin only)
 * @param userId - User ID
 * @param newRole - New role
 * @throws Error if update fails
 */
export async function updateUserRole(
  userId: number,
  newRole: "admin" | "professor" | "user"
): Promise<void> {
  // Validate inputs
  if (!newRole || !["admin", "professor", "user"].includes(newRole)) {
    throw new Error("Invalid role");
  }

  // Get database connection
  const db = await getDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Update user role
  await db
    .update(users)
    .set({ role: newRole} as any)
    .where(eq(users.id, userId));
}
