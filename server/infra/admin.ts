import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc.js";
import { TRPCError } from "@trpc/server";
import {
  getCourses,
  getCourseEnrollments,
  getStudentEnrollments,
  getOverduePayments,
  getPaymentsByStudent,
  getDb,
} from "./db.js";
import { users, enrollments, payments } from "../infra/schema.js";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";

export const adminRouter = router({
  // Get dashboard statistics
  getStatistics: adminProcedure.query(async () => {
    try {
      const courses = await getCourses(100, 0);
      const totalCourses = courses.length;

      // Calculate total students (unique enrollments)
      const enrollments = await Promise.all(
        courses.map((course) => getCourseEnrollments(course.id))
      );
      const totalStudents = new Set(
        enrollments.flat().map((e) => e.studentId)
      ).size;

      // Calculate total revenue
      let totalRevenue = 0;
      const allEnrollments = enrollments.flat();
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
        });

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

        await db.update(users)
          .set({ password: hashedPassword, updatedAt: new Date() })
          .where(eq(users.id, input.userId));

        return { 
          success: true, 
          message: "Senha redefinida com sucesso", 
          newPassword 
        };
      } catch (error) {
        console.error("Error resetting password:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao redefinir senha" });
      }
    }),

  // Delete user
  deleteUser: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        // Delete user
        await db.delete(users).where(eq(users.id, input.userId));

        return { success: true, message: "Usuário deletado com sucesso" };
      } catch (error) {
        console.error("Error deleting user:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao deletar usuário" });
      }
    }),

  // Update user role
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "professor", "user"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        // Update user role
        await db.update(users).set({ role: input.role, updatedAt: new Date() }).where(eq(users.id, input.userId));

        return { success: true, message: "Função atualizada com sucesso" };
      } catch (error) {
        console.error("Error updating user role:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao atualizar função" });
      }
    }),

  // Get course enrollments report
  getCourseEnrollmentsReport: adminProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      try {
        const enrollments = await getCourseEnrollments(input.courseId);
        return {
          courseId: input.courseId,
          totalEnrollments: enrollments.length,
          enrollments,
        };
      } catch (error) {
        console.error("Error getting enrollments report:", error);
        throw error;
      }
    }),

  // Get payment report
  getPaymentReport: adminProcedure.query(async () => {
    try {
      const overdueInstallments = await getOverduePayments();
      return {
        totalOverdue: overdueInstallments.length,
        overdueInstallments,
      };
    } catch (error) {
      console.error("Error getting payment report:", error);
      throw error;
    }
  }),

  // Unlock course for student
  unlockCourse: adminProcedure
    .input(
      z.object({
        studentId: z.number(),
        courseId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        // Create enrollment if it doesn't exist
        const existingEnrollment = await db
          .select()
          .from(enrollments)
          .where(and(eq(enrollments.studentId, input.studentId), eq(enrollments.courseId, input.courseId)))
          .limit(1);

        if (existingEnrollment.length === 0) {
          await db.insert(enrollments).values({
            studentId: input.studentId,
            courseId: input.courseId,
            enrolledAt: new Date(),
            completedAt: null,
          });
        }

        return { success: true, message: "Curso liberado com sucesso" };
      } catch (error) {
        console.error("Error unlocking course:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao liberar curso" });
      }
    }),

  // Send payment reminder
  sendPaymentReminder: adminProcedure
    .input(
      z.object({
        installmentId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // TODO: Implement email sending
        return { success: true, message: "Lembrete de pagamento enviado" };
      } catch (error) {
        console.error("Error sending payment reminder:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao enviar lembrete" });
      }
    }),

  // Generate Excel report
  generateExcelReport: adminProcedure
    .input(
      z.object({
        reportType: z.enum(["courses", "students", "payments", "installments"]),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // TODO: Implement Excel generation
        return {
          success: true,
          url: "/reports/sample.xlsx",
          message: "Relatório gerado com sucesso",
        };
      } catch (error) {
        console.error("Error generating report:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao gerar relatório" });
      }
    }),
});
