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
export async function getArticles(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt)).limit(limit).offset(offset);
}

export async function getAllArticles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).orderBy(desc(articles.createdAt));
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
  const result = await db.insert(articles).values(data).returning();
  return result[0] ?? null;
}

export async function updateArticle(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(articles).set(data).where(eq(articles.id, id));
  return getArticleById(id);
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(articles).where(eq(articles.id, id));
}

// ============================================================================
// PAGE CONTENT
// ============================================================================

export async function getPageContent(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageContent).limit(limit).offset(offset);
}

export async function getPageContentByKey(key: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(pageContent).where(eq(pageContent.key, key)).limit(1);
  return result[0] ?? null;
}

export async function updatePageContent(key: string, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(pageContent).set(data).where(eq(pageContent.key, key));
  return getPageContentByKey(key);
}

export async function deletePageContent(key: string) {
  const db = await getDb();
  if (!db) return;
  await db.delete(pageContent).where(eq(pageContent.key, key));
}

export async function getAllPageContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageContent);
}

// ============================================================================
// ASSESSMENTS
// ============================================================================

export async function createAssessment(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(assessments).values(data).returning();
  return result[0] ?? null;
}

export async function getAssessmentsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessments).where(eq(assessments.courseId, courseId));
}

export async function getAssessmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createQuestion(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(questions).values(data).returning();
  return result[0] ?? null;
}

export async function getQuestionsByAssessment(assessmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questions).where(eq(questions.assessmentId, assessmentId)).orderBy(asc(questions.order));
}

export async function createQuestionOption(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(questionOptions).values(data).returning();
  return result[0] ?? null;
}

export async function getOptionsByQuestion(questionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questionOptions).where(eq(questionOptions.questionId, questionId)).orderBy(asc(questionOptions.order));
}

export async function recordStudentAnswer(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(studentAnswers).values(data).returning();
  return result[0] ?? null;
}

export async function createAssessmentResult(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(assessmentResults).values(data).returning();
  return result[0] ?? null;
}

// ============================================================================
// COURSES (ENROLLMENT)
// ============================================================================

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

export async function enrollStudent(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(enrollments).values({
    studentId,
    courseId,
    status: "active",
  }).returning();
  return result[0] ?? null;
}

export async function getEnrollmentStatus(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(enrollments).where(
    and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId))
  ).limit(1);
  return result[0] ?? null;
}

export async function getCourseBySlugOrId(slugOrId: string | number) {
  const db = await getDb();
  if (!db) return null;
  
  if (typeof slugOrId === "number") {
    return getCourseById(slugOrId);
  }
  
  const result = await db.select().from(courses).where(eq(courses.slug, slugOrId)).limit(1);
  return result[0] ?? null;
}

// ============================================================================
// LESSONS (MATERIALS)
// ============================================================================

export async function createLessonMaterial(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(lessonMaterials).values(data).returning();
  return result[0] ?? null;
}

export async function getMaterialsByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lessonMaterials).where(eq(lessonMaterials.lessonId, lessonId));
}

export async function deleteLessonMaterial(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lessonMaterials).where(eq(lessonMaterials.id, id));
}

// ============================================================================
// PROGRESS
// ============================================================================

export async function recordLessonProgress(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(lessonProgress).values(data).returning();
  return result[0] ?? null;
}

export async function getStudentLessonProgress(studentId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lessonProgress).where(
    and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.lessonId, lessonId))
  ).limit(1);
  return result[0] ?? null;
}

export async function calculateCourseProgress(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const lessons = await getLessonsByCourse(courseId);
  if (lessons.length === 0) return 0;
  
  const completed = await db.select().from(lessonProgress).where(
    and(
      eq(lessonProgress.studentId, studentId),
      inArray(lessonProgress.lessonId, lessons.map(l => l.id)),
      eq(lessonProgress.status, "completed")
    )
  );
  
  return Math.round((completed.length / lessons.length) * 100);
}

export async function getStudentAssessmentScore(studentId: number, assessmentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(assessmentResults).where(
    and(eq(assessmentResults.studentId, studentId), eq(assessmentResults.assessmentId, assessmentId))
  ).orderBy(desc(assessmentResults.createdAt)).limit(1);
  return result[0] ?? null;
}

export async function createCertificate(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(certificates).values(data).returning();
  return result[0] ?? null;
}

export async function getCertificateByCourse(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(certificates).where(
    and(eq(certificates.studentId, studentId), eq(certificates.courseId, courseId))
  ).limit(1);
  return result[0] ?? null;
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function createPayment(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(payments).values(data).returning();
  return result[0] ?? null;
}

export async function getPaymentsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.studentId, studentId)).orderBy(desc(payments.createdAt));
}

export async function getPaymentsByCourse(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.courseId, courseId));
}

export async function getAllPayments() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).orderBy(desc(payments.createdAt));
}

export async function updatePayment(id: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(payments).set(data).where(eq(payments.id, id));
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

// ============================================================================
// PROFESSIONALS / RANKING
// ============================================================================

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
  
  const result = await db.insert(studentProfiles).values({ userId }).returning();
  return result[0] ?? null;
}

export async function updateStudentProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(studentProfiles).set(data).where(eq(studentProfiles.userId, userId));
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
  const result = await db.insert(subscriptionPayments).values(data).returning();
  return result[0] ?? null;
}

export async function createAuditLog(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(auditLogs).values(data).returning();
  return result[0] ?? null;
}

export async function activatePublicProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(studentProfiles).set({ isPublic: true }).where(eq(studentProfiles.userId, userId));
  return getStudentProfile(userId);
}

export async function getFraudAlerts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(fraudDetection).orderBy(desc(fraudDetection.createdAt));
}

export async function getAuditLogs(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  if (userId) {
    return db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt));
  }
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
}

export async function blockUserAccount(userId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set({ role: "user" }).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function resolveFraudAlert(id: number, resolved: boolean) {
  const db = await getDb();
  if (!db) return null;
  await db.update(fraudDetection).set({ resolved }).where(eq(fraudDetection.id, id));
  const result = await db.select().from(fraudDetection).where(eq(fraudDetection.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getAllIntegrityChecks() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrityChecks).orderBy(desc(integrityChecks.createdAt));
}

// ============================================================================
// USER PROFILE
// ============================================================================

export async function updateUserProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set(data).where(eq(users.id, userId));
  return getUserById(userId);
}
