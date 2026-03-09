import { mysqlTable, varchar, text, int, timestamp, boolean, mysqlEnum, decimal, longtext, index, unique, json } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
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
    role: mysqlEnum("role", ["user", "admin", "professor"]).default("user").notNull(),
    stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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

export const courses = mysqlTable(
  "courses",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique(),
    description: longtext("description"),
    coverUrl: varchar("coverUrl", { length: 500 }),
    trailerUrl: varchar("trailerUrl", { length: 500 }),
    courseHours: int("courseHours").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    minimumGrade: int("minimumGrade").default(70).notNull(),
    maxInstallments: int("maxInstallments").default(1).notNull(),
    professorId: int("professorId").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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

export const modules = mysqlTable(
  "modules",
  {
    id: int("id").autoincrement().primaryKey(),
    courseId: int("courseId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: longtext("description"),
    order: int("order").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    courseIdx: index("courseId_idx").on(table.courseId),
  })
);

export type Module = typeof modules.$inferSelect;

// ============================================================================
// LESSONS TABLE
// ============================================================================

export const lessons = mysqlTable(
  "lessons",
  {
    id: int("id").autoincrement().primaryKey(),
    moduleId: int("moduleId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: longtext("description"),
    type: mysqlEnum("type", ["video", "live", "text", "material"]).notNull(),
    content: longtext("content"),
    videoUrl: varchar("videoUrl", { length: 500 }),
    liveUrl: varchar("liveUrl", { length: 500 }),
    order: int("order").notNull().default(0),
    durationMinutes: int("durationMinutes").default(0),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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

export const lessonMaterials = mysqlTable(
  "lesson_materials",
  {
    id: int("id").autoincrement().primaryKey(),
    lessonId: int("lessonId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["pdf", "document", "spreadsheet", "video", "link"]).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    fileSize: int("fileSize"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    lessonIdx: index("lessonId_idx").on(table.lessonId),
  })
);

export type LessonMaterial = typeof lessonMaterials.$inferSelect;

// ============================================================================
// ENROLLMENTS TABLE
// ============================================================================

export const enrollments = mysqlTable(
  "enrollments",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    courseId: int("courseId").notNull(),
    status: mysqlEnum("status", ["active", "completed", "dropped"]).default("active").notNull(),
    enrolledAt: timestamp("enrolledAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
    progress: int("progress").notNull().default(0),
    finalGrade: decimal("finalGrade", { precision: 5, scale: 2 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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

export const lessonProgress = mysqlTable(
  "lesson_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    lessonId: int("lessonId").notNull(),
    status: mysqlEnum("status", ["not_started", "in_progress", "completed"]).default("not_started").notNull(),
    completedAt: timestamp("completedAt"),
    watchedMinutes: int("watchedMinutes").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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

export const assessments = mysqlTable(
  "assessments",
  {
    id: int("id").autoincrement().primaryKey(),
    lessonId: int("lessonId"),
    courseId: int("courseId"),
    title: varchar("title", { length: 255 }).notNull(),
    description: longtext("description"),
    type: mysqlEnum("type", ["quiz", "assignment", "exam"]).default("quiz").notNull(),
    passingScore: int("passingScore").notNull().default(70),
    maxAttempts: int("maxAttempts").notNull().default(3),
    timeLimit: int("timeLimit"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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

export const questions = mysqlTable(
  "questions",
  {
    id: int("id").autoincrement().primaryKey(),
    assessmentId: int("assessmentId").notNull(),
    title: longtext("title").notNull(),
    type: mysqlEnum("type", ["multiple_choice", "true_false", "short_answer"]).notNull(),
    order: int("order").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    assessmentIdx: index("assessmentId_idx").on(table.assessmentId),
  })
);

export type Question = typeof questions.$inferSelect;

// ============================================================================
// QUESTION OPTIONS TABLE
// ============================================================================

export const questionOptions = mysqlTable(
  "question_options",
  {
    id: int("id").autoincrement().primaryKey(),
    questionId: int("questionId").notNull(),
    text: longtext("text").notNull(),
    isCorrect: boolean("isCorrect").notNull().default(false),
    order: int("order").notNull().default(0),
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

export const studentAnswers = mysqlTable(
  "student_answers",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    assessmentId: int("assessmentId").notNull(),
    questionId: int("questionId").notNull(),
    selectedOptionId: int("selectedOptionId"),
    answer: longtext("answer"),
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

export const assessmentResults = mysqlTable(
  "assessment_results",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    assessmentId: int("assessmentId").notNull(),
    score: decimal("score", { precision: 5, scale: 2 }).notNull(),
    passed: boolean("passed").notNull(),
    attemptNumber: int("attemptNumber").notNull().default(1),
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

export const payments = mysqlTable(
  "payments",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    courseId: int("courseId").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    installments: int("installments").notNull().default(1),
    paidInstallments: int("paidInstallments").notNull().default(0),
    status: mysqlEnum("status", ["pending", "paid", "overdue", "cancelled"]).default("pending").notNull(),
    transactionId: varchar("transactionId", { length: 255 }),
    pixKey: varchar("pixKey", { length: 255 }),
    dueDate: timestamp("dueDate"),
    paidAt: timestamp("paidAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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

export const certificates = mysqlTable(
  "certificates",
  {
    id: int("id").autoincrement().primaryKey(),
    studentId: int("studentId").notNull(),
    courseId: int("courseId").notNull(),
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

export const notifications = mysqlTable(
  "notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["payment_reminder", "course_completed", "approval", "overdue"]).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: longtext("message").notNull(),
    relatedId: int("relatedId"),
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

export const articles = mysqlTable(
  "articles",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).unique().notNull(),
    cover: varchar("cover", { length: 500 }),
    content: longtext("content").notNull(),
    excerpt: varchar("excerpt", { length: 500 }),
    author: varchar("author", { length: 255 }).notNull(),
    authorId: int("authorId"),
    isPublished: boolean("isPublished").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
    publishedIdx: index("published_idx").on(table.isPublished),
  })
);

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

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


// ============================================================================
// STUDENT PROFILES TABLE (Ranking System)
// ============================================================================

export const studentProfiles = mysqlTable(
  "student_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    publicName: varchar("publicName", { length: 255 }),
    bio: text("bio"),
    professionalBio: text("professionalBio"),
    formation: text("formation"),
    score: int("score").default(0).notNull(),
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
    paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "expired"]).default("pending").notNull(),
    paymentDate: timestamp("paymentDate"),
    annualExpiryDate: timestamp("annualExpiryDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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
// SUBSCRIPTION PAYMENTS TABLE (Annual R$20 for public profile)
// ============================================================================

export const subscriptionPayments = mysqlTable(
  "subscription_payments",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
    paymentDate: timestamp("paymentDate"),
    expirationDate: timestamp("expirationDate"),
    method: varchar("method", { length: 50 }).notNull(), // "pix", "credit_card", "debit_card"
    transactionId: varchar("transactionId", { length: 255 }),
    transactionGateway: varchar("transactionGateway", { length: 100 }), // "stripe", "mercadopago", "pix"
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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
// AUDIT LOGS TABLE (System Integrity & Compliance)
// ============================================================================

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    event: varchar("event", { length: 100 }).notNull(), // "login", "payment", "ranking_change", "account_blocked", "fraud_detected"
    affectedFile: varchar("affectedFile", { length: 255 }),
    description: text("description"),
    userId: int("userId"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("low").notNull(),
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
// FRAUD DETECTION TABLE (Anti-Fraud System)
// ============================================================================

export const fraudDetection = mysqlTable(
  "fraud_detection",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    fraudType: varchar("fraudType", { length: 100 }).notNull(), // "multiple_accounts", "ranking_manipulation", "payment_fraud", "database_tampering"
    description: text("description"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
    isBlocked: boolean("isBlocked").default(false).notNull(),
    resolvedAt: timestamp("resolvedAt"),
    resolvedBy: int("resolvedBy"),
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
// INTEGRITY CHECK TABLE (System Integrity Verification)
// ============================================================================

export const integrityChecks = mysqlTable(
  "integrity_checks",
  {
    id: int("id").autoincrement().primaryKey(),
    moduleName: varchar("moduleName", { length: 100 }).notNull(), // "auth_system", "payment_validation", etc.
    status: mysqlEnum("status", ["ok", "warning", "failed"]).default("ok").notNull(),
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
// RELATIONS
// ============================================================================

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


// ============================================================================
// PAGE CONTENT (CMS)
// ============================================================================

export const pageContent = mysqlTable(
  "page_content",
  {
    id: int("id").autoincrement().primaryKey(),
    pageKey: varchar("pageKey", { length: 100 }).notNull().unique(),
    sectionKey: varchar("sectionKey", { length: 100 }).notNull(),
    contentKey: varchar("contentKey", { length: 100 }).notNull(),
    content: longtext("content").notNull(),
    contentType: mysqlEnum("contentType", ["text", "html", "markdown"]).default("text").notNull(),
    updatedBy: int("updatedBy"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    pageKeyIdx: index("pageKey_idx").on(table.pageKey),
    sectionKeyIdx: index("sectionKey_idx").on(table.sectionKey),
    uniqueContent: index("unique_content_idx").on(table.pageKey, table.sectionKey, table.contentKey),
  })
);

export type PageContent = typeof pageContent.$inferSelect;
export type InsertPageContent = typeof pageContent.$inferInsert;

export const pageContentRelations = relations(pageContent, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [pageContent.updatedBy],
    references: [users.id],
  }),
}));


// ============================================================================
// DEVICE ACCOUNTS TABLE (Multiple Accounts per Device)
// ============================================================================

export const deviceAccounts = mysqlTable(
  "device_accounts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
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
// REGISTRATION FIELDS TABLE (Dynamic Form Fields)
// ============================================================================

export const registrationFields = mysqlTable(
  "registration_fields",
  {
    id: int("id").autoincrement().primaryKey(),
    label: varchar("label", { length: 255 }).notNull(),
    type: mysqlEnum("type", ["text", "select", "number", "textarea", "checkbox", "date"]).notNull(),
    required: boolean("required").default(false).notNull(),
    active: boolean("active").default(true).notNull(),
    order: int("order").notNull().default(0),
    options: longtext("options"), // JSON array for select options
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    activeIdx: index("active_idx").on(table.active),
    orderIdx: index("order_idx").on(table.order),
  })
);

export type RegistrationField = typeof registrationFields.$inferSelect;
export type InsertRegistrationField = typeof registrationFields.$inferInsert;

// ============================================================================
// USER REGISTRATION DATA TABLE (Dynamic Form Responses)
// ============================================================================

export const userRegistrationData = mysqlTable(
  "user_registration_data",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    fieldId: int("fieldId").notNull(),
    value: longtext("value").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
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

export const passwordResetTokens = mysqlTable(
  "password_reset_tokens",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
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
// RELATIONS FOR NEW TABLES
// ============================================================================

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


// ============================================================================
// DYNAMIC CONTENT TABLE (Editor de Textos)
// ============================================================================

export const dynamicContent = mysqlTable(
  "dynamic_content",
  {
    id: int("id").autoincrement().primaryKey(),
    key: varchar("key", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    content: longtext("content").notNull(),
    contentType: mysqlEnum("contentType", ["html", "text", "markdown"]).default("html").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    keyIdx: index("key_idx").on(table.key),
  })
);

export type DynamicContent = typeof dynamicContent.$inferSelect;
export type InsertDynamicContent = typeof dynamicContent.$inferInsert;

// ============================================================================
// RELATIONS FOR DYNAMIC CONTENT
// ============================================================================

export const dynamicContentRelations = relations(dynamicContent, ({ many }) => ({
  // Future relations can be added here
}));


// ============================================================================
// SYSTEM LOGS TABLE (Monitoramento em Tempo Real)
// ============================================================================

export const systemLogs = mysqlTable(
  "system_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    level: mysqlEnum("level", ["info", "warning", "error", "security"]).notNull(),
    source: varchar("source", { length: 100 }).notNull(),
    message: text("message"),
    metadata: json("metadata"),
    userId: int("userId"),
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
// RELATIONS FOR SYSTEM LOGS
// ============================================================================

export const systemLogsRelations = relations(systemLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemLogs.userId],
    references: [users.id],
  }),
}));
