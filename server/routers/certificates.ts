import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { generateCertificatePDF, generateCertificateFilename } from "../services/certificateService";
import { storagePut, storageGet } from "../services/storageService";
import { getDb } from "../infra/db";
import { users, courses } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const certificatesRouter = router({
  /**
   * Generate and store certificate for a completed course
   */
  generateCertificate: protectedProcedure
    .input(
      z.object({
        studentId: z.number(),
        courseId: z.number(),
        finalGrade: z.number().min(0).max(10),
        completionDate: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only admin or professor can generate certificates
      if (ctx.user.role !== "admin" && ctx.user.role !== "professor") {
        throw new Error("Unauthorized");
      }

      try {
        // Generate PDF
        const pdfBuffer = await generateCertificatePDF(
          input.studentId,
          input.courseId,
          input.finalGrade,
          input.completionDate
        );

        // Upload to S3
        const filename = generateCertificateFilename(input.studentId, input.courseId);
        const { url } = await storagePut(
          `certificates/${input.studentId}/${filename}`,
          pdfBuffer,
          "application/pdf"
        );

        return {
          success: true,
          url,
          filename,
        };
      } catch (error) {
        console.error("Certificate generation error:", error);
        throw new Error("Failed to generate certificate");
      }
    }),

  /**
   * Get certificate URL for a completed course
   */
  getCertificate: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        // Get presigned URL for download
        const { url } = await storageGet(
          `certificates/${ctx.user.id}/${generateCertificateFilename(ctx.user.id, input.courseId)}`
        );

        return {
          url,
          generatedAt: new Date(),
        };
      } catch (error) {
        return null;
      }
    }),

  /**
   * Verify certificate authenticity (public endpoint)
   */
  verifyCertificate: publicProcedure
    .input(
      z.object({
        studentId: z.number(),
        courseId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      const student = await database
        .select()
        .from(users)
        .where(eq(users.id, input.studentId))
        .then((rows: any) => rows[0]);

      const course = await database
        .select()
        .from(courses)
        .where(eq(courses.id, input.courseId))
        .then((rows: any) => rows[0]);

      if (!student || !course) {
        return {
          valid: false,
          message: "Student or course not found",
        };
      }

      return {
        valid: true,
        studentName: student.name,
        courseName: course.title,
        certificateUrl: `https://educadq-ead.com.br/certificado/${input.studentId}/${input.courseId}`,
      };
    }),

  /**
   * List all certificates for current user
   */
  listCertificates: protectedProcedure.query(async ({ ctx }) => {
    // Return empty list for now
    // In production, query from certificates table
    return [];
  }),
});
