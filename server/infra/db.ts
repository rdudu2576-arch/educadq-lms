import { eq, and, desc, asc, gte, lte, inArray, isNotNull, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import {
  InsertUser,
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
} from "./schema.js";
import { ENV } from "../_core/env.js";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _pool = mysql.createPool(process.env.DATABASE_URL);
      _db = drizzle(_pool);
      console.log("[Database] Persistent connection pool initialized");
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

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  if (user.name !== undefined) { values.name = user.name; updateSet.name = user.name; }
  if (user.email !== undefined) { values.email = user.email; updateSet.email = user.email; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }

  if (Object.keys(updateSet).length === 0) updateSet.updatedAt = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
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
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");
  const openId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(users).values({
    email: data.email,
    password: data.password,
    name: data.name,
    role: data.role,
    openId: openId,
  });
  const user = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return user[0];
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
    price: data.price as any,
    minimumGrade: data.minimumGrade ?? 70,
    maxInstallments: data.maxInstallments ?? 1,
    professorId: data.professorId,
  });
  return result;
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

export async function updateCourse(id: number, data: Partial<typeof courses.$inferInsert>) {
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
  await db.insert(modules).values(data);
  // Get the created module by finding the latest one with matching data
  const result = await db.select().from(modules)
    .where(eq(modules.courseId, data.courseId))
    .orderBy(desc(modules.createdAt))
    .limit(1);
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

export async function updateModule(id: number, data: Partial<typeof modules.$inferInsert>) {
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
  
  // Auto-generate order if not provided
  let order = data.order;
  if (!order || order === 0) {
    const lastLesson = await db.select().from(lessons)
      .where(eq(lessons.moduleId, data.moduleId))
      .orderBy(desc(lessons.order))
      .limit(1);
    order = lastLesson.length ? lastLesson[0].order + 1 : 1;
  }
  
  const lessonData = { ...data, order };
  console.log("[DB] Creating lesson with data:", lessonData);
  
  await db.insert(lessons).values(lessonData);
  
  // Get the created lesson by finding the latest one with matching data
  const result = await db.select().from(lessons)
    .where(eq(lessons.moduleId, data.moduleId))
    .orderBy(desc(lessons.createdAt))
    .limit(1);
  
  console.log("[DB] Lesson created:", result[0]);
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

export async function updateLesson(id: number, data: Partial<typeof lessons.$inferInsert>) {
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

// ============================================================================
// LESSON MATERIALS
// ============================================================================

export async function createLessonMaterial(data: {
  lessonId: number;
  title: string;
  type: "pdf" | "document" | "spreadsheet" | "video" | "link";
  url: string;
  fileSize?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(lessonMaterials).values(data);
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
// ENROLLMENTS
// ============================================================================

export async function enrollStudent(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(enrollments).values({ studentId, courseId, status: "active" });
}

export async function getStudentEnrollments(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.studentId, studentId));
}

export async function getCourseEnrollments(courseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(enrollments).where(eq(enrollments.courseId, courseId));
}

export async function getEnrollmentStatus(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(enrollments)
    .where(and(eq(enrollments.studentId, studentId), eq(enrollments.courseId, courseId)))
    .limit(1);
  return result[0] ?? null;
}

export async function updateEnrollment(id: number, data: Partial<typeof enrollments.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(enrollments).set(data).where(eq(enrollments.id, id));
}

// ============================================================================
// LESSON PROGRESS
// ============================================================================

export async function recordLessonProgress(studentId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.lessonId, lessonId)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(lessonProgress)
      .set({ status: "completed", completedAt: new Date() })
      .where(and(eq(lessonProgress.studentId, studentId), eq(lessonProgress.lessonId, lessonId)));
  } else {
    await db.insert(lessonProgress).values({
      studentId, lessonId, status: "completed", completedAt: new Date(),
    });
  }
}

export async function getStudentLessonProgress(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return [];
  const courseLessons = await getLessonsByCourse(courseId);
  if (courseLessons.length === 0) return [];
  const lessonIds = courseLessons.map(l => l.id);
  return db.select().from(lessonProgress)
    .where(and(eq(lessonProgress.studentId, studentId), inArray(lessonProgress.lessonId, lessonIds)));
}

export async function calculateCourseProgress(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return 0;
  const courseLessons = await getLessonsByCourse(courseId);
  if (courseLessons.length === 0) return 0;
  const lessonIds = courseLessons.map(l => l.id);
  const completed = await db.select().from(lessonProgress)
    .where(and(
      eq(lessonProgress.studentId, studentId),
      inArray(lessonProgress.lessonId, lessonIds),
      eq(lessonProgress.status, "completed")
    ));
  return Math.round((completed.length / courseLessons.length) * 100);
}

// ============================================================================
// ASSESSMENTS
// ============================================================================

export async function createAssessment(data: {
  courseId?: number;
  lessonId?: number;
  title: string;
  description?: string;
  type?: "quiz" | "assignment" | "exam";
  passingScore?: number;
  maxAttempts?: number;
  timeLimit?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(assessments).values({
    ...data,
    type: data.type ?? "quiz",
    passingScore: data.passingScore ?? 70,
    maxAttempts: data.maxAttempts ?? 3,
  });
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

// ============================================================================
// QUESTIONS & OPTIONS
// ============================================================================

export async function createQuestion(data: {
  assessmentId: number;
  title: string;
  type?: "multiple_choice" | "true_false" | "short_answer";
  order: number;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(questions).values({ ...data, type: data.type ?? "multiple_choice" });
}

export async function getQuestionsByAssessment(assessmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questions).where(eq(questions.assessmentId, assessmentId)).orderBy(asc(questions.order));
}

export async function createQuestionOption(data: {
  questionId: number;
  text: string;
  isCorrect: boolean;
  order: number;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(questionOptions).values(data);
}

export async function getOptionsByQuestion(questionId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questionOptions).where(eq(questionOptions.questionId, questionId)).orderBy(asc(questionOptions.order));
}

// ============================================================================
// STUDENT ANSWERS
// ============================================================================

export async function recordStudentAnswer(data: {
  studentId: number;
  assessmentId: number;
  questionId: number;
  selectedOptionId: number;
  isCorrect: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(studentAnswers).values(data);
}

export async function getStudentAssessmentScore(studentId: number, assessmentId: number) {
  const db = await getDb();
  if (!db) return { correct: 0, total: 0, score: 0 };
  const answers = await db.select().from(studentAnswers)
    .where(and(eq(studentAnswers.studentId, studentId), eq(studentAnswers.assessmentId, assessmentId)));
  const correct = answers.filter(a => a.isCorrect).length;
  const total = answers.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { correct, total, score };
}

export async function createAssessmentResult(data: {
  studentId: number;
  assessmentId: number;
  score: string;
  passed: boolean;
  attemptNumber: number;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(assessmentResults).values({ ...data, completedAt: new Date() });
}

// ============================================================================
// PAYMENTS
// ============================================================================

export async function createPayment(data: {
  studentId: number;
  courseId: number;
  amount: string;
  installments?: number;
  pixKey?: string;
  dueDate?: Date;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(payments).values({
    studentId: data.studentId,
    courseId: data.courseId,
    amount: data.amount as any,
    installments: data.installments ?? 1,
    pixKey: data.pixKey ?? "41988913431",
    dueDate: data.dueDate,
    status: "pending",
  });
}

export async function getPaymentsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(payments).where(eq(payments.studentId, studentId));
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

export async function updatePayment(id: number, data: Partial<typeof payments.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(payments).set(data).where(eq(payments.id, id));
}

export async function getOverduePayments() {
  const db = await getDb();
  if (!db) return [];
  const now = new Date();
  return db.select().from(payments)
    .where(and(eq(payments.status, "pending"), lte(payments.dueDate, now)));
}

// ============================================================================
// CERTIFICATES
// ============================================================================

export async function createCertificate(data: {
  studentId: number;
  courseId: number;
  certificateNumber: string;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(certificates).values(data);
}

export async function getCertificatesByStudent(studentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(certificates).where(eq(certificates.studentId, studentId));
}

export async function getCertificateByCourse(studentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(certificates)
    .where(and(eq(certificates.studentId, studentId), eq(certificates.courseId, courseId)))
    .limit(1);
  return result[0] ?? null;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function createNotification(data: {
  userId: number;
  type: "payment_reminder" | "course_completed" | "approval" | "overdue";
  title: string;
  message: string;
  relatedId?: number;
}) {
  const db = await getDb();
  if (!db) return null;
  return db.insert(notifications).values(data);
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}

// ============================================================================
// ARTICLES
// ============================================================================

export async function getArticles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).where(eq(articles.isPublished, true)).orderBy(desc(articles.createdAt));
}

export async function getAllArticles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(articles).orderBy(desc(articles.createdAt));
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  return rows[0] || null;
}

export async function getArticleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
  return rows[0] || null;
}

export async function createArticle(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover?: string;
  author: string;
  authorId?: number;
  isPublished?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(articles).values({
    title: data.title,
    slug: data.slug,
    content: data.content,
    excerpt: data.excerpt || null,
    cover: data.cover || null,
    author: data.author,
    authorId: data.authorId || null,
    isPublished: data.isPublished ?? true,
  });
  return result[0].insertId;
}

export async function updateArticle(id: number, data: Partial<{
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover: string;
  author: string;
  isPublished: boolean;
}>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(articles).set(data).where(eq(articles.id, id));
}

export async function deleteArticle(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.delete(articles).where(eq(articles.id, id));
}

// ============================================================================
// USER PROFILE UPDATE
// ============================================================================

export async function updateUserProfile(userId: number, data: Partial<{
  name: string;
  cpf: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set(data).where(eq(users.id, userId));
  const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return rows[0] || null;
}

// ============================================================================
// COURSE BY SLUG
// ============================================================================

export async function getCourseBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return rows[0] || null;
}

export async function getCourseBySlugOrId(slugOrId: string | number) {
  const db = await getDb();
  if (!db) return null;
  
  // Try as slug first
  if (typeof slugOrId === 'string') {
    const rows = await db.select().from(courses).where(eq(courses.slug, slugOrId)).limit(1);
    if (rows.length > 0) return rows[0];
    
    // Try as ID if slug lookup fails
    const idNum = parseInt(slugOrId, 10);
    if (!isNaN(idNum)) {
      const idRows = await db.select().from(courses).where(eq(courses.id, idNum)).limit(1);
      return idRows[0] || null;
    }
  } else {
    // Direct ID lookup
    const rows = await db.select().from(courses).where(eq(courses.id, slugOrId)).limit(1);
    return rows[0] || null;
  }
  
  return null;
}


// ============================================================================
// STUDENT PROFILES & RANKING
// ============================================================================

export async function getOrCreateStudentProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");

  await db.insert(studentProfiles).values({
    userId,
    publicName: user.name || `Aluno ${userId}`,
  });

  const newProfile = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);

  return newProfile[0] || null;
}

export async function getRanking(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: studentProfiles.id,
      userId: studentProfiles.userId,
      publicName: studentProfiles.publicName,
      bio: studentProfiles.bio,
      score: studentProfiles.score,
      level: studentProfiles.level,
      profileImageUrl: studentProfiles.profileImageUrl,
      userName: users.name,
      email: users.email,
    })
    .from(studentProfiles)
    .innerJoin(users, eq(studentProfiles.userId, users.id))
    .where(eq(studentProfiles.isPublic, true))
    .orderBy(desc(studentProfiles.score))
    .limit(limit)
    .offset(offset);
}

export async function updateStudentScore(userId: number, scoreChange: number) {
  const db = await getDb();
  if (!db) return 0;

  const profile = await getOrCreateStudentProfile(userId);
  if (!profile) return 0;

  const newScore = Math.max(0, (profile.score || 0) + scoreChange);

  await db
    .update(studentProfiles)
    .set({ score: newScore })
    .where(eq(studentProfiles.userId, userId));

  return newScore;
}

export async function getStudentProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const profile = await db
    .select()
    .from(studentProfiles)
    .where(eq(studentProfiles.userId, userId))
    .limit(1);

  return profile[0] || null;
}

export async function updateStudentProfile(userId: number, data: Partial<typeof studentProfiles.$inferInsert>) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(studentProfiles)
    .set(data)
    .where(eq(studentProfiles.userId, userId));

  return getStudentProfile(userId);
}

// ============================================================================
// SUBSCRIPTION PAYMENTS
// ============================================================================

export async function createSubscriptionPayment(data: typeof subscriptionPayments.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  return db.insert(subscriptionPayments).values(data);
}

export async function getActiveSubscription(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const subscription = await db
    .select()
    .from(subscriptionPayments)
    .where(
      and(
        eq(subscriptionPayments.userId, userId),
        eq(subscriptionPayments.status, "completed"),
        gte(subscriptionPayments.expirationDate, now)
      )
    )
    .orderBy(desc(subscriptionPayments.expirationDate))
    .limit(1);

  return subscription[0] || null;
}

export async function activatePublicProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  await getOrCreateStudentProfile(userId);

  await db
    .update(studentProfiles)
    .set({ isPublic: true })
    .where(eq(studentProfiles.userId, userId));

  return getStudentProfile(userId);
}

export async function deactivatePublicProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(studentProfiles)
    .set({ isPublic: false })
    .where(eq(studentProfiles.userId, userId));

  return getStudentProfile(userId);
}

export async function getSubscriptionHistory(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(subscriptionPayments)
    .where(eq(subscriptionPayments.userId, userId))
    .orderBy(desc(subscriptionPayments.createdAt))
    .limit(limit);
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export async function createAuditLog(data: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  return db.insert(auditLogs).values(data);
}

export async function getAuditLogs(filters?: {
  userId?: number;
  event?: string;
  severity?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters?.userId) {
    conditions.push(eq(auditLogs.userId, filters.userId));
  }

  if (filters?.event) {
    conditions.push(eq(auditLogs.event, filters.event));
  }

  if (filters?.severity) {
    conditions.push(eq(auditLogs.severity, filters.severity as any));
  }

  let baseQuery = db.select().from(auditLogs);

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  baseQuery = baseQuery.orderBy(desc(auditLogs.timestamp)) as any;

  if (filters?.limit) {
    baseQuery = baseQuery.limit(filters.limit) as any;
  }

  if (filters?.offset) {
    baseQuery = baseQuery.offset(filters.offset) as any;
  }

  return baseQuery as any;
}

// ============================================================================
// FRAUD DETECTION
// ============================================================================

export async function createFraudAlert(data: typeof fraudDetection.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  return db.insert(fraudDetection).values(data);
}

export async function getFraudAlerts(filters?: {
  userId?: number;
  isBlocked?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [];

  if (filters?.userId) {
    conditions.push(eq(fraudDetection.userId, filters.userId));
  }

  if (filters?.isBlocked !== undefined) {
    conditions.push(eq(fraudDetection.isBlocked, filters.isBlocked));
  }

  let baseQuery = db.select().from(fraudDetection);

  if (conditions.length > 0) {
    baseQuery = baseQuery.where(and(...conditions)) as any;
  }

  baseQuery = baseQuery.orderBy(desc(fraudDetection.createdAt)) as any;

  if (filters?.limit) {
    baseQuery = baseQuery.limit(filters.limit) as any;
  }

  return baseQuery as any;
}

export async function blockUserAccount(userId: number, reason: string) {
  await createFraudAlert({
    userId,
    fraudType: "account_blocked",
    description: reason,
    severity: "critical",
    isBlocked: true,
  });

  await createAuditLog({
    event: "account_blocked",
    userId,
    description: reason,
    severity: "critical",
  });
}

export async function resolveFraudAlert(fraudId: number, resolvedBy: number) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(fraudDetection)
    .set({
      resolvedAt: new Date(),
      resolvedBy,
    })
    .where(eq(fraudDetection.id, fraudId));
}

// ============================================================================
// INTEGRITY CHECKS
// ============================================================================

export async function createIntegrityCheck(data: typeof integrityChecks.$inferInsert) {
  const db = await getDb();
  if (!db) return null;

  return db.insert(integrityChecks).values(data);
}

export async function getIntegrityCheckStatus(moduleName: string) {
  const db = await getDb();
  if (!db) return null;

  const check = await db
    .select()
    .from(integrityChecks)
    .where(eq(integrityChecks.moduleName, moduleName))
    .orderBy(desc(integrityChecks.lastCheckTime))
    .limit(1);

  return check[0] || null;
}

export async function updateIntegrityCheck(
  moduleName: string,
  status: "ok" | "warning" | "failed",
  codeHash?: string,
  errorMessage?: string
) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getIntegrityCheckStatus(moduleName);

  if (existing) {
    await db
      .update(integrityChecks)
      .set({
        status,
        codeHash,
        errorMessage,
        lastCheckTime: new Date(),
      })
      .where(eq(integrityChecks.id, existing.id));
  } else {
    await createIntegrityCheck({
      moduleName,
      status,
      codeHash,
      errorMessage,
    });
  }
}

export async function getAllIntegrityChecks() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(integrityChecks).orderBy(desc(integrityChecks.lastCheckTime));
}


// ============================================================================
// PAGE CONTENT (CMS)
// ============================================================================

export async function getPageContent(pageKey: string) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageContent).where(eq(pageContent.pageKey, pageKey));
}

export async function getPageContentByKey(pageKey: string, sectionKey: string, contentKey: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(pageContent)
    .where(
      and(
        eq(pageContent.pageKey, pageKey),
        eq(pageContent.sectionKey, sectionKey),
        eq(pageContent.contentKey, contentKey)
      )
    )
    .limit(1);
  return rows[0] || null;
}

export async function updatePageContent(
  pageKey: string,
  sectionKey: string,
  contentKey: string,
  content: string,
  contentType: "text" | "html" | "markdown" = "text",
  updatedBy?: number
) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getPageContentByKey(pageKey, sectionKey, contentKey);

  if (existing) {
    await db
      .update(pageContent)
      .set({
        content,
        contentType,
        updatedBy: updatedBy || existing.updatedBy,
      })
      .where(eq(pageContent.id, existing.id));
    return existing.id;
  } else {
    const result = await db.insert(pageContent).values({
      pageKey,
      sectionKey,
      contentKey,
      content,
      contentType,
      updatedBy,
    });
    return result[0].insertId;
  }
}

export async function deletePageContent(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(pageContent).where(eq(pageContent.id, id));
  return true;
}

export async function getAllPageContent() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(pageContent).orderBy(desc(pageContent.updatedAt));
}
