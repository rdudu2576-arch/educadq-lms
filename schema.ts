import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, longtext, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "professor"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Cursos
export const courses = mysqlTable("courses", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: longtext("description"),
  coverUrl: varchar("coverUrl", { length: 500 }),
  trailerUrl: varchar("trailerUrl", { length: 500 }),
  loadHours: int("loadHours").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  minGrade: int("minGrade").default(70).notNull(),
  maxInstallments: int("maxInstallments").default(1).notNull(),
  professorId: int("professorId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

// Aulas
export const lessons = mysqlTable("lessons", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["video", "text", "live"]).notNull(),
  content: longtext("content"),
  videoUrl: varchar("videoUrl", { length: 500 }),
  liveUrl: varchar("liveUrl", { length: 500 }),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = typeof lessons.$inferInsert;

// Materiais Complementares
export const materials = mysqlTable("materials", {
  id: int("id").autoincrement().primaryKey(),
  lessonId: int("lessonId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  driveLink: varchar("driveLink", { length: 500 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = typeof materials.$inferInsert;

// Matrículas
export const enrollments = mysqlTable("enrollments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  courseId: int("courseId").notNull(),
  enrollmentDate: timestamp("enrollmentDate").defaultNow().notNull(),
  status: mysqlEnum("status", ["active", "completed", "suspended"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Enrollment = typeof enrollments.$inferSelect;
export type InsertEnrollment = typeof enrollments.$inferInsert;

// Progresso
export const progress = mysqlTable("progress", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  lessonId: int("lessonId").notNull(),
  completed: boolean("completed").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Progress = typeof progress.$inferSelect;
export type InsertProgress = typeof progress.$inferInsert;

// Avaliações
export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  courseId: int("courseId").notNull(),
  lessonId: int("lessonId"),
  title: varchar("title", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["per_lesson", "final"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = typeof assessments.$inferInsert;

// Perguntas
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  questionText: longtext("questionText").notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

// Alternativas
export const alternatives = mysqlTable("alternatives", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(),
  text: longtext("text").notNull(),
  isCorrect: boolean("isCorrect").default(false).notNull(),
  order: int("order").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alternative = typeof alternatives.$inferSelect;
export type InsertAlternative = typeof alternatives.$inferInsert;

// Respostas dos Alunos
export const studentAnswers = mysqlTable("studentAnswers", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  assessmentId: int("assessmentId").notNull(),
  questionId: int("questionId").notNull(),
  selectedAlternativeId: int("selectedAlternativeId").notNull(),
  isCorrect: boolean("isCorrect").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type StudentAnswer = typeof studentAnswers.$inferSelect;
export type InsertStudentAnswer = typeof studentAnswers.$inferInsert;

// Pagamentos
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  courseId: int("courseId").notNull(),
  totalValue: decimal("totalValue", { precision: 10, scale: 2 }).notNull(),
  downPayment: decimal("downPayment", { precision: 10, scale: 2 }).notNull(),
  installmentCount: int("installmentCount").notNull(),
  paidInstallments: int("paidInstallments").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "partial", "paid", "overdue"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Parcelas
export const installments = mysqlTable("installments", {
  id: int("id").autoincrement().primaryKey(),
  paymentId: int("paymentId").notNull(),
  installmentNumber: int("installmentNumber").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  status: mysqlEnum("status", ["pending", "paid", "overdue"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Installment = typeof installments.$inferSelect;
export type InsertInstallment = typeof installments.$inferInsert;

// Sessões (para controle anti-compartilhamento)
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  deviceId: varchar("deviceId", { length: 255 }),
  userAgent: longtext("userAgent"),
  loginAt: timestamp("loginAt").defaultNow().notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;