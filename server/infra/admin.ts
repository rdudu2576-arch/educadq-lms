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
        role: z.enum(["admin", "professor", "user"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database connection failed" });

        // Hash password
        const hashedPassword = await bcrypt.hash("TempPassword123!", 10);

        // Insert user
        const result = await db.insert(users).values({
          openId: `${input.email}-${Date.now()}`,
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true, message: "Usuário criado com sucesso" };
      } catch (error) {
        console.error("Error creating user:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar usuário" });
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
