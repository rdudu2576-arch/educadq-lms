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
    // PROBLEMA IDENTIFICADO: O backend estava tentando conectar a um host inexistente ("base"),
    // causando erro ENOTFOUND. Isso ocorre quando a DATABASE_URL está mal configurada ou vazia.
    // CAUSA RAIZ: Falta de validação da URL de conexão antes de inicializar o Pool.
    // CORREÇÃO: Adicionada validação explícita e log de erro detalhado.
    // POR QUE RESOLVE: Impede que o driver tente resolver um host inválido e fornece feedback claro nos logs.
    if (process.env.DATABASE_URL.includes("base") || !process.env.DATABASE_URL.startsWith("postgres")) {
      console.error("[Database] Erro: DATABASE_URL inválida ou contém host 'base' incorreto.");
      return null;
    }

    try {
      _pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
        max: 20,
      });

      _pool.on('error', (err) => {
        console.error('[Database] Unexpected error on idle client', err);
        _db = null;
        _pool = null;
      });

      _db = drizzle(_pool);
      console.log("[Database] Persistent PostgreSQL connection pool initialized");
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { ...user };
  
  await db.insert(users).values(values as any).onConflictDoUpdate({
    target: users.openId,
    set: values as any
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
  await db.update(users).set({ role } as any).where(eq(users.id, userId));
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

  const result = await db.insert(users).values(values as any).returning();
  return result[0];
}

export async function updateUser(userId: number, data: {
  name?: string;
  bio?: string;
  avatar?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set(data as any).where(eq(users.id, userId));
  return getUserById(userId);
}

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
  } as any).returning();
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
  await db.update(courses).set(data as any).where(eq(courses.id, id));
  return getCourseById(id);
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(courses).set({ isActive: false } as any).where(eq(courses.id, id));
}

export async function createModule(data: { courseId: number; title: string; description?: string; order: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  const result = await db.insert(modules).values(data as any).returning();
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
  await db.update(modules).set(data as any).where(eq(modules.id, id));
  return getModuleById(id);
}

export async function deleteModule(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(modules).where(eq(modules.id, id));
}

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
  await db.update(lessons).set(data as any).where(eq(lessons.id, id));
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

export async function getArticles(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).orderBy(desc(articles.createdAt)).limit(limit).offset(offset);
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return result[0] ?? null;
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createArticle(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(articles).values(data as any).returning();
  return result[0]?.id ?? null;
}

export async function updateArticle(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(articles).set(data as any).where(eq(articles.id, id));
  return getArticleById(id);
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(articles).where(eq(articles.id, id));
}

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).orderBy(desc(payments.createdAt));
}

export async function updatePayment(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(payments).set(data as any).where(eq(payments.id, id));
  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getOverduePayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(
    and(
      eq(payments.status, "overdue"),
      lte(payments.dueDate, new Date())
    )
  );
}

export async function getRanking(limit = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(studentProfiles).where(eq(studentProfiles.isPublic, true)).orderBy(desc(studentProfiles.score)).limit(limit);
}

export async function getOrCreateStudentProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  let profile = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  if (profile.length > 0) return profile[0];
  
  const result = await db.insert(studentProfiles).values({ userId } as any).returning();
  return result[0] ?? null;
}

export async function updateStudentProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(studentProfiles).set(data as any).where(eq(studentProfiles.userId, userId));
  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(subscriptionPayments).where(
    and(eq(subscriptionPayments.userId, userId), eq(subscriptionPayments.status, "completed"))
  ).orderBy(desc(subscriptionPayments.createdAt)).limit(1);
  return result[0] ?? null;
}

export async function getStudentProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function getSubscriptionHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(subscriptionPayments).where(eq(subscriptionPayments.userId, userId)).orderBy(desc(subscriptionPayments.createdAt));
}

export async function createSubscriptionPayment(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(subscriptionPayments).values(data as any).returning();
  return result[0] ?? null;
}

export async function createAuditLog(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(auditLogs).values(data as any).returning();
  return result[0] ?? null;
}

export async function activatePublicProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(studentProfiles).set({ isPublic: true } as any).where(eq(studentProfiles.userId, userId));
  return getStudentProfile(userId);
}

export async function getFraudAlerts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fraudDetection).orderBy(desc(fraudDetection.createdAt));
}

export async function getAuditLogs(params: any) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(auditLogs);
  
  if (params.userId) {
    query = query.where(eq(auditLogs.userId, params.userId)) as any;
  }
  
  return query.orderBy(desc(auditLogs.createdAt)).limit(params.limit || 50).offset(params.offset || 0);
}

export async function blockUserAccount(userId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set({ role: "user" } as any).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function resolveFraudAlert(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(fraudDetection).set({ resolved: true, resolvedBy: userId } as any).where(eq(fraudDetection.id, id));
  const result = await db.select().from(fraudDetection).where(eq(fraudDetection.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllIntegrityChecks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrityChecks).orderBy(desc(integrityChecks.createdAt));
}

export async function getPageContent(pageKey: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageContent).where(eq(pageContent.pageKey, pageKey));
}

export async function getPageContentByKey(pageKey: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pageContent).where(eq(pageContent.pageKey, pageKey)).limit(1);
  return result[0] ?? null;
}

export async function updatePageContent(pageKey: string, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(pageContent).set(data as any).where(eq(pageContent.pageKey, pageKey));
  return getPageContentByKey(pageKey);
}

export async function deletePageContent(id: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(pageContent).where(eq(pageContent.id, parseInt(id)));
}

export async function getAllPageContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageContent);
}

export async function updateUserProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set(data as any).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function getCourseEnrollments(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
}

export async function getStudentEnrollments(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
}

export async function getAssessmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
  return result[0] ?? null;
}

export async function recordStudentAnswer(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(studentAnswers).values(data as any).returning();
  return result[0] ?? null;
}

export async function getOptionsByQuestion(questionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questionOptions).where(eq(questionOptions.questionId, questionId));
}
