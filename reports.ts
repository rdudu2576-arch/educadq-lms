import * as XLSX from "xlsx";
import { getDb } from "./db";
import { users, courses, enrollments, payments, assessments } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Generate courses report with student enrollment and completion rates
 */
export async function generateCoursesReport(): Promise<Buffer> {
  const database = await getDb();
  if (!database) throw new Error("Database connection failed");
  
  const allCourses = await database.select().from(courses);

  const courseData = await Promise.all(
    allCourses.map(async (course: any) => {
      const courseEnrollments = await database
        .select()
        .from(enrollments)
        .where(eq(enrollments.courseId, course.id));

      const courseAssessments = await database
        .select()
        .from(assessments)
        .where(eq(assessments.courseId, course.id));

         const completedAssessments = courseAssessments.filter((a: any) => a.isCorrect);
      const completionRate =
        courseAssessments.length > 0
          ? Math.round((completedAssessments.length / courseAssessments.length) * 100)
          : 0;

      return {
        "ID do Curso": course.id,
        "Nome do Curso": course.title,
        "Alunos Matriculados": courseEnrollments.length,
        "Total de Avaliações": courseAssessments.length,
        "Avaliações Concluídas": completedAssessments.length,
        "Taxa de Conclusão (%)": completionRate,
        "Preço": parseFloat(course.price),
        "Data de Criação": new Date(course.createdAt).toLocaleDateString("pt-BR"),
      };
    })
  );

  const worksheet = XLSX.utils.json_to_sheet(courseData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cursos");

  return Buffer.from(XLSX.write(workbook, { bookType: "xlsx", type: "array" }));
}

/**
 * Generate students report with enrollment and progress
 */
export async function generateStudentsReport(): Promise<Buffer> {
  const database = await getDb();
  if (!database) throw new Error("Database connection failed");
  
  const allUsers = await database.select().from(users).where(eq(users.role, "user"));

  const studentData = await Promise.all(
    allUsers.map(async (user: any) => {
      const studentEnrollments = await database
        .select()
        .from(enrollments)
        .where(eq(enrollments.studentId, user.id));

      let totalProgress = 0;
      let completedCourses = 0;

      for (const enrollment of studentEnrollments as any[]) {
        const courseAssessments = await database
          .select()
          .from(assessments)
          .where(eq(assessments.courseId, enrollment.courseId));

        if (courseAssessments.length === 0) continue;

        const completedAssessments = courseAssessments.filter((a: any) => a.studentGrade);
        const courseProgress = Math.round(
          (completedAssessments.length / courseAssessments.length) * 100
        );

        totalProgress += courseProgress;

        const grades = completedAssessments
          .map((a: any) => (a.studentGrade ? parseFloat(a.studentGrade.toString()) : 0))
          .filter((g: number) => g > 0);

        const averageGrade =
          grades.length > 0 ? grades.reduce((a: number, b: number) => a + b, 0) / grades.length : 0;

        if (averageGrade >= 7 && completedAssessments.length === courseAssessments.length) {
          completedCourses++;
        }
      }

      const averageProgress =
        studentEnrollments.length > 0
          ? Math.round(totalProgress / studentEnrollments.length)
          : 0;

      return {
        "ID do Aluno": user.id,
        "Nome": user.name,
        "Email": user.email,
        "CPF": user.cpf || "N/A",
        "Telefone": user.phone || "N/A",
        "Cursos Matriculados": studentEnrollments.length,
        "Cursos Concluídos": completedCourses,
        "Progresso Médio (%)": averageProgress,
        "Data de Cadastro": new Date(user.createdAt).toLocaleDateString("pt-BR"),
      };
    })
  );

  const worksheet = XLSX.utils.json_to_sheet(studentData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Alunos");

  return Buffer.from(XLSX.write(workbook, { bookType: "xlsx", type: "array" }));
}

/**
 * Generate payments report
 */
export async function generatePaymentsReport(): Promise<Buffer> {
  const database = await getDb();
  if (!database) throw new Error("Database connection failed");
  
  const allPayments = await database.select().from(payments);

  const paymentData = await Promise.all(
    allPayments.map(async (payment: any) => {
      const student = await database
        .select()
        .from(users)
        .where(eq(users.id, payment.studentId))
        .then((rows: any) => rows[0]);

      const course = await database
        .select()
        .from(courses)
        .where(eq(courses.id, payment.courseId))
        .then((rows: any) => rows[0]);

      return {
        "ID do Pagamento": payment.id,
        "Aluno": student?.name || "N/A",
        "Curso": course?.title || "N/A",
        "Valor": parseFloat(payment.amount),
        "Parcelas": payment.installments,
        "Status": payment.status,
        "Chave PIX": payment.pixKey,
        "Data de Vencimento": new Date(payment.dueDate).toLocaleDateString("pt-BR"),
        "Data de Pagamento": payment.paidAt
          ? new Date(payment.paidAt).toLocaleDateString("pt-BR")
          : "Pendente",
      };
    })
  );

  // Summary
  const paidCount = paymentData.filter((p: any) => p.Status === "paid").length;
  const pendingCount = paymentData.filter((p: any) => p.Status === "pending").length;
  const overdueCount = paymentData.filter((p: any) => p.Status === "overdue").length;

  const totalPaid = paymentData
    .filter((p: any) => p.Status === "paid")
    .reduce((sum: number, p: any) => sum + p.Valor, 0);

  const summaryData = [
    { Métrica: "Total de Pagamentos", Valor: paymentData.length },
    { Métrica: "Pagamentos Realizados", Valor: paidCount },
    { Métrica: "Pagamentos Pendentes", Valor: pendingCount },
    { Métrica: "Pagamentos Atrasados", Valor: overdueCount },
    { Métrica: "Valor Total Recebido", Valor: totalPaid.toFixed(2) },
  ];

  const worksheet1 = XLSX.utils.json_to_sheet(paymentData);
  const worksheet2 = XLSX.utils.json_to_sheet(summaryData);

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet1, "Pagamentos");
  XLSX.utils.book_append_sheet(workbook, worksheet2, "Resumo");

  return Buffer.from(XLSX.write(workbook, { bookType: "xlsx", type: "array" }));
}
