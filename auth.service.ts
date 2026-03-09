import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getDb } from "../infra/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = "7d";
const BCRYPT_ROUNDS = 10;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

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

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET!, {
    expiresIn: JWT_EXPIRY,
    algorithm: "HS256",
  });
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      algorithms: ["HS256"],
    });
    return decoded as JWTPayload;
  } catch (error) {
    console.error("[Auth] Token verification failed:", error);
    return null;
  }
}

/**
 * Login user with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
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

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.password) {
    throw new Error("User password not set");
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
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
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

  // Generate unique openId (email-based for now)
  const openId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create user
  const result = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role: "user",
    openId,
  });

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

/**
 * Get user by ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

/**
 * Create admin user (for initialization)
 */
export async function createAdminUser(
  email: string,
  password: string,
  name: string = "Administrator"
): Promise<void> {
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
  });

  console.log(`[Auth] Admin user created: ${email}`);
}
