import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import {
  generateCoursesReport,
  generateStudentsReport,
  generatePaymentsReport,
} from "../services/reportService";

export const reportsRouter = router({
  /**
   * Generate courses report (admin only)
   */
  generateCoursesReport: adminProcedure.mutation(async () => {
    try {
      const buffer = await generateCoursesReport();
      return {
        success: true,
        filename: `relatorio-cursos-${new Date().toISOString().split("T")[0]}.xlsx`,
        data: buffer.toString("base64"),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao gerar relatório de cursos",
      });
    }
  }),

  /**
   * Generate students report (admin only)
   */
  generateStudentsReport: adminProcedure.mutation(async () => {
    try {
      const buffer = await generateStudentsReport();
      return {
        success: true,
        filename: `relatorio-alunos-${new Date().toISOString().split("T")[0]}.xlsx`,
        data: buffer.toString("base64"),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao gerar relatório de alunos",
      });
    }
  }),

  /**
   * Generate payments report (admin only)
   */
  generatePaymentsReport: adminProcedure.mutation(async () => {
    try {
      const buffer = await generatePaymentsReport();
      return {
        success: true,
        filename: `relatorio-pagamentos-${new Date().toISOString().split("T")[0]}.xlsx`,
        data: buffer.toString("base64"),
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao gerar relatório de pagamentos",
      });
    }
  }),
});
