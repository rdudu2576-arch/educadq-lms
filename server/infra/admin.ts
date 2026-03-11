import { adminProcedure, router } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import {
  getCourses,
  getCourseEnrollments,
  getOverduePayments,
  getPaymentsByStudent,
  getDb,
} from "./db.js";
import { users } from "../infra/schema.pg.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const adminRouter = router({
  // Get dashboard statistics
  getStatistics: adminProcedure.query(async () => {
    try {
      const courses = await getCourses(100, 0);
      const totalCourses = courses.length;

      // Calculate total students (unique enrollments)
      const enrollments_data = await Promise.all(
        courses.map((course) => getCourseEnrollments(course.id))
      );
      const totalStudents = new Set(
        enrollments_data.flat().map((e) => e.studentId)
      ).size;

      // Calculate total revenue
      let totalRevenue = 0;
      const allEnrollments = enrollments_data.flat();
      for (const enrollment of allEnrollments) {
        const payments_data = await getPaymentsByStudent(enrollment.studentId);
        totalRevenue += payments_data.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);
      }

      // Get overdue installments
      const overdueInstallments = await getOverduePayments();

      return {
        totalCourses,
        totalStudents,
        totalRevenue,
        overdueInstallments: overdueInstallments.length,
      };
    } catch (error) {
      console.error("Error getting statistics:", error);
      throw error;
    }
  }),

  // Get all users
  getUsers: adminProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        role: z.enum(["admin", "professor", "user"]).optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const result = await db.select().from(users).limit(input.limit).offset(input.offset);
        return result;
      } catch (error) {
        console.error("Error getting users:", error);
        return [];
      }
    }),

  // Create user
  createUser: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6).optional(),
        role: z.enum(["admin", "professor", "user"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        // Check if user exists
        const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (existing.length > 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "E-mail já cadastrado" });
        }

        // Hash password (use provided or default)
        const passwordToHash = input.password || Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(passwordToHash, 10);

        // Insert user
        await db.insert(users).values({
          openId: `${input.email}-${Date.now()}`,
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
        } as any);

        return { 
          success: true, 
          message: "Usuário criado com sucesso",
          tempPassword: input.password ? undefined : passwordToHash 
        };
      } catch (error: any) {
        console.error("Error creating user:", error);
        throw new TRPCError({ 
          code: error instanceof TRPCError ? error.code : "INTERNAL_SERVER_ERROR", 
          message: error.message || "Erro ao criar usuário" 
        });
      }
    }),

  // Update user
  updateUser: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["admin", "professor", "user"]).optional(),
        password: z.string().min(6).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        const updateData: any = { updatedAt: new Date() };
        if (input.name) updateData.name = input.name;
        if (input.email) updateData.email = input.email;
        if (input.role) updateData.role = input.role;
        if (input.password) {
          updateData.password = await bcrypt.hash(input.password, 10);
        }

        await db.update(users).set(updateData).where(eq(users.id, input.userId));

        return { success: true, message: "Usuário atualizado com sucesso" };
      } catch (error) {
        console.error("Error updating user:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao atualizar usuário" });
      }
    }),

  // Reset password
  resetPassword: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        const newPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.update(users).set({ password: hashedPassword } as any).where(eq(users.id, input.userId));
        
        return { success: true, newPassword };
      } catch (error) {
        console.error("Error resetting password:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao redefinir senha" });
      }
    }),
});
