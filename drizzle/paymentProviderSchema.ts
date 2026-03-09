import { mysqlTable, int, varchar, text, boolean, timestamp, index } from "drizzle-orm/mysql-core";

export const paymentProviders = mysqlTable(
  "payment_providers",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(), // "Mercado Pago", "Stripe", "PayPal"
    type: varchar("type", { length: 50 }).notNull(), // "mercado_pago", "stripe", "paypal"
    isActive: boolean("isActive").default(false).notNull(),
    apiKey: varchar("apiKey", { length: 500 }).notNull(),
    publicKey: varchar("publicKey", { length: 500 }),
    webhookSecret: varchar("webhookSecret", { length: 500 }),
    webhookUrl: varchar("webhookUrl", { length: 500 }),
    supportedMethods: text("supportedMethods"), // JSON: ["credit_card", "debit_card", "pix", "boleto"]
    maxInstallments: int("maxInstallments").default(12),
    feePercentage: varchar("feePercentage", { length: 10 }), // "2.99"
    minAmount: varchar("minAmount", { length: 10 }), // "1.00"
    maxAmount: varchar("maxAmount", { length: 10 }), // "999999.99"
    config: text("config"), // JSON com configurações adicionais
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    typeIdx: index("type_idx").on(table.type),
    activeIdx: index("isActive_idx").on(table.isActive),
  })
);

export type PaymentProvider = typeof paymentProviders.$inferSelect;
export type InsertPaymentProvider = typeof paymentProviders.$inferInsert;

export const paymentProviderLogs = mysqlTable(
  "payment_provider_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    providerId: int("providerId").notNull(),
    action: varchar("action", { length: 100 }).notNull(), // "activated", "deactivated", "config_updated"
    details: text("details"), // JSON com detalhes
    changedBy: int("changedBy").notNull(), // userId do admin
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    providerIdx: index("providerId_idx").on(table.providerId),
    changedByIdx: index("changedBy_idx").on(table.changedBy),
  })
);

export type PaymentProviderLog = typeof paymentProviderLogs.$inferSelect;
export type InsertPaymentProviderLog = typeof paymentProviderLogs.$inferInsert;
