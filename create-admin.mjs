#!/usr/bin/env node

/**
 * Script para criar primeira conta admin
 * Uso: node scripts/create-admin.mjs
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import { users } from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

config();

const client = postgres(process.env.DATABASE_URL || "");
const db = drizzle(client);

async function createAdmin() {
  try {
    console.log("🔐 Criando primeira conta admin...\n");

    // Email e senha padrão
    const email = "admin@educadq.com";
    const password = "Admin@123456";
    const name = "Administrador EducaDQ";

    // Verificar se já existe
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing.length > 0) {
      console.log("⚠️  Admin já existe!");
      console.log(`Email: ${email}`);
      process.exit(0);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar admin
    const result = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name,
        role: "admin",
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    console.log("✅ Admin criado com sucesso!\n");
    console.log("📧 Email:", email);
    console.log("🔑 Senha:", password);
    console.log("\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!");
    console.log("💡 Dica: Você pode usar qualquer email para login.\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
    process.exit(1);
  }
}

createAdmin();
