import { eq, and, desc, asc, gte, lte, inArray, isNotNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  users,
  courses,
  modules,
  lessons,
  lessonMaterials,
  enrollments,
  lessonProgress,
  assessments,
  questions,
  questionOptions,
  studentAnswers,
  assessmentResults,
  payments,
  certificates,
  notifications,
  articles,
  studentProfiles,
  subscriptionPayments,
  auditLogs,
  fraudDetection,
  integrityChecks,
  pageContent,
  InsertUser,
} from "./schema.pg.js";

const { Pool } = pg;

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: pg.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });
      _db = drizzle(_pool);
      console.log("[Database] Persistent PostgreSQL connection pool initialized");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USERS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { ...user };
  
  await db.insert(users).values(values).onConflictDoUpdate({
    target: users.openId,
    set: values
  });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] ?? undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "admin" | "professor" | "user") {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set({ role }).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function getUserByEmail(email: string) {
  if (!email) return undefined;
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? undefined;
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "professor" | "user";
  additionalData?: any;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const openId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const values: any = {
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role,
    openId: openId,
  };

  if (data.additionalData) {
    values.cpf = data.additionalData.cpf;
    values.phone = data.additionalData.phone;
    values.address = data.additionalData.address;
    values.city = data.additionalData.city;
    values.state = data.additionalData.state;
    values.zip = data.additionalData.cep;
    values.rg = data.additionalData.rg;
    values.age = parseInt(data.additionalData.age);
    values.neighborhood = data.additionalData.neighborhood;
    values.complement = data.additionalData.complement;
    values.number = data.additionalData.number;
  }

  const result = await db.insert(users).values(values).returning();
  return result[0];
}

export async function updateUser(userId: number, data: {
  name?: string;
  bio?: string;
  avatar?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set(data).where(eq(users.id, userId));
  return getUserById(userId);
}

// ============================================================================
// COURSES
// ============================================================================

export async function createCourse(data: {
  title: string;
  description?: string;
  coverUrl?: string;
  trailerUrl?: string;
  courseHours: number;
  price: string;
  minimumGrade?: number;
  maxInstallments?: number;
  professorId: number;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(courses).values({
    title: data.title,
    description: data.description,
    coverUrl: data.coverUrl,
    trailerUrl: data.trailerUrl,
    courseHours: data.courseHours,
    price: data.price,
    minimumGrade: data.minimumGrade ?? 70,
    maxInstallments: data.maxInstallments ?? 1,
    professorId: data.professorId,
  }).returning();
  return result[0];
}

export async function getCourses(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.isActive, true)).orderBy(desc(courses.createdAt)).limit(limit).offset(offset);
}

export async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).orderBy(desc(courses.createdAt));
}

export async function getCourseById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getCoursesByProfessor(professorId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(courses).where(eq(courses.professorId, professorId));
}

export async function updateCourse(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(courses).set(data).where(eq(courses.id, id));
  return getCourseById(id);
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
}

// ============================================================================
// MODULES
// ============================================================================

export async function createModule(data: { courseId: number; title: string; description?: string; order: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const result = await db.insert(modules).values(data).returning();
  return result[0] ?? null;
}

export async function getModulesByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(asc(modules.order));
}

export async function getModuleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateModule(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(modules).set(data).where(eq(modules.id, id));
  return getModuleById(id);
}

export async function deleteModule(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(modules).where(eq(modules.id, id));
}

// ============================================================================
// LESSONS
// ============================================================================

export async function createLesson(data: {
  moduleId: number;
  title: string;
  description?: string;
  type: "video" | "live" | "text" | "material";
  content?: string;
  videoUrl?: string;
  liveUrl?: string;
  order?: number;
  durationMinutes?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  let order = data.order;
  if (!order || order === 0) {
    const lastLesson = await db.select().from(lessons)
      .where(eq(lessons.moduleId, data.moduleId))
      .orderBy(desc(lessons.order))
      .limit(1);
    order = lastLesson.length ? lastLesson[0].order + 1 : 1;
  }
  
  const lessonData = { ...data, order };
  const result = await db.insert(lessons).values(lessonData as any).returning();
  return result[0] ?? null;
}

export async function getLessonsByModule(moduleId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).orderBy(asc(lessons.order));
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result[0] ?? null;
}

export async function updateLesson(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(lessons).set(data).where(eq(lessons.id, id));
  return getLessonById(id);
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lessons).where(eq(lessons.id, id));
}

export async function getLessonsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  const courseModules = await getModulesByCourse(courseId);
  if (courseModules.length === 0) return [];
  const moduleIds = courseModules.map(m => m.id);
  return db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).orderBy(asc(lessons.order));
}
