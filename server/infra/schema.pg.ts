import { pgTable, varchar, text, integer, timestamp, boolean, pgEnum, decimal, index, unique, jsonb, serial } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const roleEnum = pgEnum("role", ["user", "admin", "professor"]);
export const lessonTypeEnum = pgEnum("lesson_type", ["video", "live", "text", "material"]);
export const materialTypeEnum = pgEnum("material_type", ["pdf", "document", "spreadsheet", "video", "link"]);
export const enrollmentStatusEnum = pgEnum("enrollment_status", ["active", "completed", "dropped"]);
export const lessonProgressStatusEnum = pgEnum("lesson_progress_status", ["not_started", "in_progress", "completed"]);
export const assessmentTypeEnum = pgEnum("assessment_type", ["quiz", "assignment", "exam"]);
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice", "true_false", "short_answer"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "overdue", "cancelled"]);
export const notificationTypeEnum = pgEnum("notification_type", ["payment_reminder", "course_completed", "approval", "overdue"]);
export const contentTypeEnum = pgEnum("content_type", ["text", "html", "markdown"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["pending", "completed", "failed", "refunded"]);
export const severityEnum = pgEnum("severity", ["low", "medium", "high", "critical"]);
export const logTypeEnum = pgEnum("log_type", ["info", "warning", "error", "security"]);

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    password: varchar("password", { length: 255 }),
    cpf: varchar("cpf", { length: 14 }),
    phone: varchar("phone", { length: 20 }),
    address: varchar("address", { length: 500 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    zip: varchar("zip", { length: 10 }),
    rg: varchar("rg", { length: 20 }),
    age: integer("age"),
    neighborhood: varchar("neighborhood", { length: 100 }),
    complement: varchar("complement", { length: 100 }),
    number: varchar("number", { length: 20 }),
    role: roleEnum("role").default("user").notNull(),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    openIdIdx: index("openId_idx").on(table.openId),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// COURSES TABLE
// ============================================================================

export const courses = pgTable(
  "courses",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique(),
    description: text("description"),
    coverUrl: varchar("coverUrl", { length: 500 }),
    trailerUrl: varchar("trailerUrl", { length: 500 }),
    courseHours: integer("courseHours").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    minimumGrade: integer("minimumGrade").default(70).notNull(),
    maxInstallments: integer("maxInstallments").default(1).notNull(),
    professorId: integer("professorId").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    professorIdx: index("professorId_idx").on(table.professorId),
    activeIdx: index("isActive_idx").on(table.isActive),
    slugIdx: index("slug_idx").on(table.slug),
  })
);

export type Course = typeof courses.$inferSelect;

// ============================================================================
// MODULES TABLE
// ============================================================================

export const modules = pgTable(
  "modules",
  {
    id: serial("id").primaryKey(),
    courseId: integer("courseId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    courseIdx: index("courseId_idx").on(table.courseId),
  })
);

export type Module = typeof modules.$inferSelect;

// ============================================================================
// LESSONS TABLE
// ============================================================================

export const lessons = pgTable(
  "lessons",
  {
    id: serial("id").primaryKey(),
    moduleId: integer("moduleId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    type: lessonTypeEnum("type").notNull(),
    content: text("content"),
    videoUrl: varchar("videoUrl", { length: 500 }),
    liveUrl: varchar("liveUrl", { length: 500 }),
    order: integer("order").notNull().default(0),
    durationMinutes: integer("durationMinutes").default(0),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    moduleIdx: index("moduleId_idx").on(table.moduleId),
    typeIdx: index("type_idx").on(table.type),
  })
);

export type Lesson = typeof lessons.$inferSelect;

// ============================================================================
// LESSON MATERIALS TABLE
// ============================================================================

export const lessonMaterials = pgTable(
  "lesson_materials",
  {
    id: serial("id").primaryKey(),
    lessonId: integer("lessonId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    type: materialTypeEnum("type").notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    fileSize: integer("fileSize"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    lessonIdx: index("lessonId_idx").on(table.lessonId),
  })
);

export type LessonMaterial = typeof lessonMaterials.$inferSelect;

// ============================================================================
// ENROLLMENTS TABLE
// ============================================================================

export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    studentId: integer("studentId").notNull(),
    courseId: integer("courseId").notNull(),
    status: enrollmentStatusEnum("status").default("active").notNull(),
    enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
    progress: integer("progress").notNull().default(0),
    finalGrade: decimal("finalGrade", { precision: 5, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    studentIdx: index("studentId_idx").on(table.studentId),
    courseIdx: index("courseId_idx").on(table.courseId),
    studentCourseUnique: unique("studentCourse_unique").on(table.studentId, table.courseId),
  })
);

export type Enrollment = typeof enrollments.$inferSelect;

// ============================================================================
// LESSON PROGRESS TABLE
// ============================================================================

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: serial("id").primaryKey(),
    studentId: integer("studentId").notNull(),
    lessonId: integer("lessonId").notNull(),
    status: lessonProgressStatusEnum("status").default("not_started").notNull(),
    completedAt: timestamp("completedAt"),
    watchedMinutes: integer("watchedMinutes").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    studentIdx: index("studentId_idx").on(table.studentId),
    lessonIdx: index("lessonId_idx").on(table.lessonId),
    studentLessonUnique: unique("studentLesson_unique").on(table.studentId, table.lessonId),
  })
);

export type LessonProgress = typeof lessonProgress.$inferSelect;

// ============================================================================
// ASSESSMENTS TABLE
// ============================================================================

export const assessments = pgTable(
  "assessments",
  {
    id: serial("id").primaryKey(),
    lessonId: integer("lessonId"),
    courseId: integer("courseId"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    type: assessmentTypeEnum("type").default("quiz").notNull(),
    passingScore: integer("passingScore").notNull().default(70),
    maxAttempts: integer("maxAttempts").notNull().default(3),
    timeLimit: integer("timeLimit"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    lessonIdx: index("lessonId_idx").on(table.lessonId),
    courseIdx: index("courseId_idx").on(table.courseId),
  })
);

export type Assessment = typeof assessments.$inferSelect;

// ============================================================================
// QUESTIONS TABLE
// ============================================================================

export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessmentId").notNull(),
    title: text("title").notNull(),
    type: questionTypeEnum("type").notNull(),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    assessmentIdx: index("assessmentId_idx").on(table.assessmentId),
  })
);

export type Question = typeof questions.$inferSelect;

// ============================================================================
// QUESTION OPTIONS TABLE
// ============================================================================

export const questionOptions = pgTable(
  "question_options",
  {
    id: serial("id").primaryKey(),
    questionId: integer("questionId").notNull(),
    text: text("text").notNull(),
    isCorrect: boolean("isCorrect").notNull().default(false),
    order: integer("order").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    questionIdx: index("questionId_idx").on(table.questionId),
  })
);

export type QuestionOption = typeof questionOptions.$inferSelect;

// ============================================================================
// STUDENT ANSWERS TABLE
// ============================================================================

export const studentAnswers = pgTable(
  "student_answers",
  {
    id: serial("id").primaryKey(),
    studentId: integer("studentId").notNull(),
    assessmentId: integer("assessmentId").notNull(),
    questionId: integer("questionId").notNull(),
    selectedOptionId: integer("selectedOptionId"),
    answer: text("answer"),
    isCorrect: boolean("isCorrect"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    studentIdx: index("studentId_idx").on(table.studentId),
    assessmentIdx: index("assessmentId_idx").on(table.assessmentId),
  })
);

export type StudentAnswer = typeof studentAnswers.$inferSelect;

// ============================================================================
// ASSESSMENT RESULTS TABLE
// ============================================================================

export const assessmentResults = pgTable(
  "assessment_results",
  {
    id: serial("id").primaryKey(),
    studentId: integer("studentId").notNull(),
    assessmentId: integer("assessmentId").notNull(),
    score: decimal("score", { precision: 5, scale: 2 }).notNull(),
    passed: boolean("passed").notNull(),
    attemptNumber: integer("attemptNumber").notNull().default(1),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    studentIdx: index("studentId_idx").on(table.studentId),
    assessmentIdx: index("assessmentId_idx").on(table.assessmentId),
  })
);

export type AssessmentResult = typeof assessmentResults.$inferSelect;

// ============================================================================
// PAYMENTS TABLE
// ============================================================================

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    studentId: integer("studentId").notNull(),
    courseId: integer("courseId").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    installments: integer("installments").notNull().default(1),
    paidInstallments: integer("paidInstallments").notNull().default(0),
    status: paymentStatusEnum("status").default("pending").notNull(),
    transactionId: varchar("transactionId", { length: 255 }),
    pixKey: varchar("pixKey", { length: 255 }),
    dueDate: timestamp("dueDate"),
    paidAt: timestamp("paidAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    studentIdx: index("studentId_idx").on(table.studentId),
    courseIdx: index("courseId_idx").on(table.courseId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type Payment = typeof payments.$inferSelect;

// ============================================================================
// CERTIFICATES TABLE
// ============================================================================

export const certificates = pgTable(
  "certificates",
  {
    id: serial("id").primaryKey(),
    studentId: integer("studentId").notNull(),
    courseId: integer("courseId").notNull(),
    certificateNumber: varchar("certificateNumber", { length: 255 }).unique().notNull(),
    issuedAt: timestamp("issuedAt").defaultNow().notNull(),
    expiresAt: timestamp("expiresAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    studentIdx: index("studentId_idx").on(table.studentId),
    courseIdx: index("courseIdx").on(table.courseId),
  })
);

export type Certificate = typeof certificates.$inferSelect;

// ============================================================================
// NOTIFICATIONS TABLE
// ============================================================================

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    relatedId: integer("relatedId"),
    isRead: boolean("isRead").notNull().default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    typeIdx: index("type_idx").on(table.type),
    isReadIdx: index("isRead_idx").on(table.isRead),
  })
);

export type Notification = typeof notifications.$inferSelect;

// ============================================================================
// ARTICLES TABLE
// ============================================================================

export const articles = pgTable(
  "articles",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    cover: varchar("cover", { length: 500 }),
    content: text("content").notNull(),
    author: varchar("author", { length: 255 }).notNull(),
    authorId: integer("authorId"),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
    publishedIdx: index("published_idx").on(table.isPublished),
  })
);

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

// ============================================================================
// STUDENT PROFILES TABLE (Ranking System)
// ============================================================================

export const studentProfiles = pgTable(
  "student_profiles",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull().unique(),
    publicName: varchar("publicName", { length: 255 }),
    bio: text("bio"),
    professionalBio: text("professionalBio"),
    formation: text("formation"),
    score: integer("score").default(0).notNull(),
    level: varchar("level", { length: 50 }).default("iniciante").notNull(),
    isPublic: boolean("isPublic").default(false).notNull(),
    profileImageUrl: varchar("profileImageUrl", { length: 500 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 2 }),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 320 }),
    professionalPhone: varchar("professionalPhone", { length: 20 }),
    professionalEmail: varchar("professionalEmail", { length: 320 }),
    otherContacts: text("otherContacts"),
    linkedin: varchar("linkedin", { length: 500 }),
    instagram: varchar("instagram", { length: 500 }),
    website: varchar("website", { length: 500 }),
    facebook: varchar("facebook", { length: 500 }),
    youtube: varchar("youtube", { length: 500 }),
    otherSocial: text("otherSocial"),
    paymentStatus: paymentStatusEnum("paymentStatus").default("pending").notNull(),
    paymentDate: timestamp("paymentDate"),
    annualExpiryDate: timestamp("annualExpiryDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    scoreIdx: index("score_idx").on(table.score),
    isPublicIdx: index("isPublic_idx").on(table.isPublic),
  })
);

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

// ============================================================================
// SUBSCRIPTION PAYMENTS TABLE
// ============================================================================

export const subscriptionPayments = pgTable(
  "subscription_payments",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: subscriptionStatusEnum("status").default("pending").notNull(),
    paymentDate: timestamp("paymentDate"),
    expirationDate: timestamp("expirationDate"),
    method: varchar("method", { length: 50 }).notNull(),
    transactionId: varchar("transactionId", { length: 255 }),
    transactionGateway: varchar("transactionGateway", { length: 100 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
    expirationIdx: index("expirationDate_idx").on(table.expirationDate),
  })
);

export type SubscriptionPayment = typeof subscriptionPayments.$inferSelect;
export type InsertSubscriptionPayment = typeof subscriptionPayments.$inferInsert;

// ============================================================================
// AUDIT LOGS TABLE
// ============================================================================

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    event: varchar("event", { length: 100 }).notNull(),
    affectedFile: varchar("affectedFile", { length: 255 }),
    description: text("description"),
    userId: integer("userId"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    severity: severityEnum("severity").default("low").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    eventIdx: index("event_idx").on(table.event),
    severityIdx: index("severity_idx").on(table.severity),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ============================================================================
// FRAUD DETECTION TABLE
// ============================================================================

export const fraudDetection = pgTable(
  "fraud_detection",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId"),
    fraudType: varchar("fraudType", { length: 100 }).notNull(),
    description: text("description"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    severity: severityEnum("severity").default("medium").notNull(),
    isBlocked: boolean("isBlocked").default(false).notNull(),
    resolvedAt: timestamp("resolvedAt"),
    resolvedBy: integer("resolvedBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    fraudTypeIdx: index("fraudType_idx").on(table.fraudType),
    isBlockedIdx: index("isBlocked_idx").on(table.isBlocked),
  })
);

export type FraudDetection = typeof fraudDetection.$inferSelect;
export type InsertFraudDetection = typeof fraudDetection.$inferInsert;

// ============================================================================
// INTEGRITY CHECK TABLE
// ============================================================================

export const integrityChecks = pgTable(
  "integrity_checks",
  {
    id: serial("id").primaryKey(),
    moduleName: varchar("moduleName", { length: 100 }).notNull(),
    status: pgEnum("integrity_status", ["ok", "warning", "failed"])("status").default("ok").notNull(),
    codeHash: varchar("codeHash", { length: 255 }),
    lastCheckTime: timestamp("lastCheckTime").defaultNow().notNull(),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    moduleNameIdx: index("moduleName_idx").on(table.moduleName),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type IntegrityCheck = typeof integrityChecks.$inferSelect;
export type InsertIntegrityCheck = typeof integrityChecks.$inferInsert;

// ============================================================================
// PAGE CONTENT (CMS)
// ============================================================================

export const pageContent = pgTable(
  "page_content",
  {
    id: serial("id").primaryKey(),
    pageKey: varchar("pageKey", { length: 100 }).notNull().unique(),
    sectionKey: varchar("sectionKey", { length: 100 }).notNull(),
    contentKey: varchar("contentKey", { length: 100 }).notNull(),
    content: text("content").notNull(),
    contentType: contentTypeEnum("contentType").default("text").notNull(),
    updatedBy: integer("updatedBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    pageKeyIdx: index("pageKey_idx").on(table.pageKey),
    sectionKeyIdx: index("sectionKey_idx").on(table.sectionKey),
    uniqueContent: index("unique_content_idx").on(table.pageKey, table.sectionKey, table.contentKey),
  })
);

export type PageContent = typeof pageContent.$inferSelect;
export type InsertPageContent = typeof pageContent.$inferInsert;

// ============================================================================
// DEVICE ACCOUNTS TABLE
// ============================================================================

export const deviceAccounts = pgTable(
  "device_accounts",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    deviceId: varchar("deviceId", { length: 255 }).notNull(),
    lastUsed: timestamp("lastUsed").defaultNow().notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    deviceIdx: index("deviceId_idx").on(table.deviceId),
    deviceUserIdx: index("deviceUser_idx").on(table.deviceId, table.userId),
  })
);

export type DeviceAccount = typeof deviceAccounts.$inferSelect;
export type InsertDeviceAccount = typeof deviceAccounts.$inferInsert;

// ============================================================================
// REGISTRATION FIELDS TABLE
// ============================================================================

export const registrationFields = pgTable(
  "registration_fields",
  {
    id: serial("id").primaryKey(),
    label: varchar("label", { length: 255 }).notNull(),
    type: pgEnum("field_type", ["text", "select", "number", "textarea", "checkbox", "date"])("type").notNull(),
    required: boolean("required").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
    order: integer("order").notNull().default(0),
    options: text("options"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index("active_idx").on(table.active),
    orderIdx: index("order_idx").on(table.order),
  })
);

export type RegistrationField = typeof registrationFields.$inferSelect;
export type InsertRegistrationField = typeof registrationFields.$inferInsert;

// ============================================================================
// USER REGISTRATION DATA TABLE
// ============================================================================

export const userRegistrationData = pgTable(
  "user_registration_data",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    fieldId: integer("fieldId").notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    fieldIdx: index("fieldId_idx").on(table.fieldId),
    userFieldIdx: index("userField_idx").on(table.userId, table.fieldId),
  })
);

export type UserRegistrationData = typeof userRegistrationData.$inferSelect;
export type InsertUserRegistrationData = typeof userRegistrationData.$inferInsert;

// ============================================================================
// PASSWORD RESET TOKENS TABLE
// ============================================================================

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("userId").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    used: boolean("used").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("userId_idx").on(table.userId),
    tokenIdx: index("token_idx").on(table.token),
    expiresIdx: index("expiresAt_idx").on(table.expiresAt),
  })
);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// ============================================================================
// DYNAMIC CONTENT TABLE
// ============================================================================

export const dynamicContent = pgTable(
  "dynamic_content",
  {
    id: serial("id").primaryKey(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    contentType: contentTypeEnum("contentType").default("html").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  },
  (table) => ({
    keyIdx: index("key_idx").on(table.key),
  })
);

export type DynamicContent = typeof dynamicContent.$inferSelect;
export type InsertDynamicContent = typeof dynamicContent.$inferInsert;

// ============================================================================
// SYSTEM LOGS TABLE
// ============================================================================

export const systemLogs = pgTable(
  "system_logs",
  {
    id: serial("id").primaryKey(),
    level: logTypeEnum("level").notNull(),
    source: varchar("source", { length: 100 }).notNull(),
    message: text("message"),
    metadata: jsonb("metadata"),
    userId: integer("userId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    levelIdx: index("level_idx").on(table.level),
    sourceIdx: index("source_idx").on(table.source),
    userIdIdx: index("userId_idx").on(table.userId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type SystemLog = typeof systemLogs.$inferSelect;
export type InsertSystemLog = typeof systemLogs.$inferInsert;

// ============================================================================
// RELATIONS
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  courses: many(courses),
  enrollments: many(enrollments),
  lessonProgress: many(lessonProgress),
  assessmentResults: many(assessmentResults),
  payments: many(payments),
  certificates: many(certificates),
  studentAnswers: many(studentAnswers),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  professor: one(users, {
    fields: [courses.professorId],
    references: [users.id],
  }),
  modules: many(modules),
  enrollments: many(enrollments),
  assessments: many(assessments),
  payments: many(payments),
  certificates: many(certificates),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  materials: many(lessonMaterials),
  progress: many(lessonProgress),
  assessments: many(assessments),
}));

export const lessonMaterialsRelations = relations(lessonMaterials, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonMaterials.lessonId],
    references: [lessons.id],
  }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  student: one(users, {
    fields: [lessonProgress.studentId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [assessments.lessonId],
    references: [lessons.id],
  }),
  course: one(courses, {
    fields: [assessments.courseId],
    references: [courses.id],
  }),
  questions: many(questions),
  results: many(assessmentResults),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  assessment: one(assessments, {
    fields: [questions.assessmentId],
    references: [assessments.id],
  }),
  options: many(questionOptions),
  answers: many(studentAnswers),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id],
  }),
}));

export const studentAnswersRelations = relations(studentAnswers, ({ one }) => ({
  student: one(users, {
    fields: [studentAnswers.studentId],
    references: [users.id],
  }),
  assessment: one(assessments, {
    fields: [studentAnswers.assessmentId],
    references: [assessments.id],
  }),
  question: one(questions, {
    fields: [studentAnswers.questionId],
    references: [questions.id],
  }),
}));

export const assessmentResultsRelations = relations(assessmentResults, ({ one }) => ({
  student: one(users, {
    fields: [assessmentResults.studentId],
    references: [users.id],
  }),
  assessment: one(assessments, {
    fields: [assessmentResults.assessmentId],
    references: [assessments.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(users, {
    fields: [payments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [payments.courseId],
    references: [courses.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  student: one(users, {
    fields: [certificates.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  authorUser: one(users, {
    fields: [articles.authorId],
    references: [users.id],
  }),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const subscriptionPaymentsRelations = relations(subscriptionPayments, ({ one }) => ({
  user: one(users, {
    fields: [subscriptionPayments.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const fraudDetectionRelations = relations(fraudDetection, ({ one }) => ({
  user: one(users, {
    fields: [fraudDetection.userId],
    references: [users.id],
  }),
  resolvedByUser: one(users, {
    fields: [fraudDetection.resolvedBy],
    references: [users.id],
  }),
}));

export const pageContentRelations = relations(pageContent, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [pageContent.updatedBy],
    references: [users.id],
  }),
}));

export const deviceAccountsRelations = relations(deviceAccounts, ({ one }) => ({
  user: one(users, {
    fields: [deviceAccounts.userId],
    references: [users.id],
  }),
}));

export const registrationFieldsRelations = relations(registrationFields, ({ many }) => ({
  userResponses: many(userRegistrationData),
}));

export const userRegistrationDataRelations = relations(userRegistrationData, ({ one }) => ({
  user: one(users, {
    fields: [userRegistrationData.userId],
    references: [users.id],
  }),
  field: one(registrationFields, {
    fields: [userRegistrationData.fieldId],
    references: [registrationFields.id],
  }),
}));

export const passwordResetTokensRelations = relations(passwordResetTokens, ({ one }) => ({
  user: one(users, {
    fields: [passwordResetTokens.userId],
    references: [users.id],
  }),
}));

export const dynamicContentRelations = relations(dynamicContent, ({ many }) => ({
}));

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemLogs.userId],
    references: [users.id],
  }),
}));
