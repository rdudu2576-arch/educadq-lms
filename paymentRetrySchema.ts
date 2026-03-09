import { mysqlTable, int, varchar, text, boolean, timestamp, index, decimal } from "drizzle-orm/mysql-core";

export const paymentRetries = mysqlTable(
  "payment_retries",
  {
    id: int("id").autoincrement().primaryKey(),
    paymentId: int("paymentId").notNull(),
    studentId: int("studentId").notNull(),
    courseId: int("courseId").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    originalError: text("originalError"),
    retryCount: int("retryCount").default(0).notNull(),
    maxRetries: int("maxRetries").default(5).notNull(),
    status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, processing, success, failed, abandoned
    lastRetryAt: timestamp("lastRetryAt"),
    nextRetryAt: timestamp("nextRetryAt"),
    backoffMultiplier: decimal("backoffMultiplier", { precision: 3, scale: 2 }).default(2.0).notNull(), // Exponential backoff
    initialDelaySeconds: int("initialDelaySeconds").default(300).notNull(), // 5 minutes
    lastErrorMessage: text("lastErrorMessage"),
    paymentMethod: varchar("paymentMethod", { length: 50 }),
    installments: int("installments").default(1),
    notificationsSent: int("notificationsSent").default(0).notNull(),
    lastNotificationAt: timestamp("lastNotificationAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    paymentIdx: index("paymentId_idx").on(table.paymentId),
    studentIdx: index("studentId_idx").on(table.studentId),
    statusIdx: index("status_idx").on(table.status),
    nextRetryIdx: index("nextRetryAt_idx").on(table.nextRetryAt),
  })
);

export type PaymentRetry = typeof paymentRetries.$inferSelect;
export type InsertPaymentRetry = typeof paymentRetries.$inferInsert;

export const retryNotifications = mysqlTable(
  "retry_notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    retryId: int("retryId").notNull(),
    studentId: int("studentId").notNull(),
    type: varchar("type", { length: 50 }).notNull(), // "email", "sms", "push", "in_app"
    status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, sent, failed
    message: text("message"),
    sentAt: timestamp("sentAt"),
    failureReason: text("failureReason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    retryIdx: index("retryId_idx").on(table.retryId),
    studentIdx: index("studentId_idx").on(table.studentId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type RetryNotification = typeof retryNotifications.$inferSelect;
export type InsertRetryNotification = typeof retryNotifications.$inferInsert;

export const retryMetrics = mysqlTable(
  "retry_metrics",
  {
    id: int("id").autoincrement().primaryKey(),
    date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
    totalRetries: int("totalRetries").default(0),
    successfulRetries: int("successfulRetries").default(0),
    failedRetries: int("failedRetries").default(0),
    abandonedRetries: int("abandonedRetries").default(0),
    totalAmountRecovered: decimal("totalAmountRecovered", { precision: 12, scale: 2 }).default(0),
    averageRetryCount: decimal("averageRetryCount", { precision: 5, scale: 2 }).default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    dateIdx: index("date_idx").on(table.date),
  })
);

export type RetryMetrics = typeof retryMetrics.$inferSelect;
export type InsertRetryMetrics = typeof retryMetrics.$inferInsert;
