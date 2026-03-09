import { PDFDocument, rgb, degrees } from "pdf-lib";
import QRCode from "qrcode";
import { getDb } from "../infra/db.js";
import { users, courses } from "../infra/schema.js";
import { eq } from "drizzle-orm";

/**
 * Generate a certificate PDF for a student who completed a course
 */
export async function generateCertificatePDF(
  studentId: number,
  courseId: number,
  finalGrade: number,
  completionDate: Date
): Promise<Buffer> {
  const database = await getDb();
  if (!database) throw new Error("Database connection failed");

  // Fetch student and course data
  const student = await database
    .select()
    .from(users)
    .where(eq(users.id, studentId))
    .then((rows: any) => rows[0]);

  const course = await database
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .then((rows: any) => rows[0]);

  if (!student || !course) {
    throw new Error("Student or course not found");
  }

  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([850, 600]);

  // Add background color (light blue)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 850,
    height: 600,
    color: rgb(0.95, 0.97, 1),
  });

  // Add border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: 790,
    height: 540,
    borderColor: rgb(0.2, 0.6, 0.8),
    borderWidth: 3,
  });

  // Add title
  page.drawText("CERTIFICADO DE CONCLUSÃO", {
    x: 100,
    y: 500,
    size: 36,
    color: rgb(0.2, 0.6, 0.8),
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  // Add institution name
  page.drawText("EducaDQ - Centro de Formação e Estudos sobre Álcool e outras Drogas", {
    x: 100,
    y: 460,
    size: 14,
    color: rgb(0.3, 0.3, 0.3),
    font: await pdfDoc.embedFont("Helvetica"),
  });

  // Add certificate text
  page.drawText("Certificamos que", {
    x: 100,
    y: 410,
    size: 14,
    color: rgb(0.3, 0.3, 0.3),
    font: await pdfDoc.embedFont("Helvetica"),
  });

  // Add student name
  page.drawText(student.name.toUpperCase(), {
    x: 100,
    y: 380,
    size: 18,
    color: rgb(0.2, 0.6, 0.8),
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  // Add completion text
  page.drawText("completou com sucesso o curso", {
    x: 100,
    y: 350,
    size: 14,
    color: rgb(0.3, 0.3, 0.3),
    font: await pdfDoc.embedFont("Helvetica"),
  });

  // Add course name
  page.drawText(course.title.toUpperCase(), {
    x: 100,
    y: 320,
    size: 16,
    color: rgb(0.2, 0.6, 0.8),
    font: await pdfDoc.embedFont("Helvetica-Bold"),
  });

  // Add course details
  const courseHours = course.courseHours || 40;
  page.drawText(`Carga Horária: ${courseHours} horas | Nota Final: ${finalGrade.toFixed(1)}`, {
    x: 100,
    y: 290,
    size: 12,
    color: rgb(0.3, 0.3, 0.3),
    font: await pdfDoc.embedFont("Helvetica"),
  });

  // Add completion date
  const dateStr = completionDate.toLocaleDateString("pt-BR");
  page.drawText(`Data de Conclusão: ${dateStr}`, {
    x: 100,
    y: 260,
    size: 12,
    color: rgb(0.3, 0.3, 0.3),
    font: await pdfDoc.embedFont("Helvetica"),
  });

  // Generate QR code
  const certificateUrl = `https://educadq-ead.com.br/certificado/${studentId}/${courseId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(certificateUrl, {
    errorCorrectionLevel: "H",
    type: "image/png",
    margin: 1,
    width: 200,
  });

  // Convert data URL to buffer
  const base64Data = (qrCodeDataUrl as string).split(",")[1];
  const qrCodeImage = await pdfDoc.embedPng(Buffer.from(base64Data, "base64"));

  // Add QR code to PDF
  page.drawImage(qrCodeImage, {
    x: 650,
    y: 250,
    width: 150,
    height: 150,
  });

  // Add verification text
  page.drawText("Escaneie o QR Code para verificar", {
    x: 620,
    y: 230,
    size: 10,
    color: rgb(0.5, 0.5, 0.5),
    font: await pdfDoc.embedFont("Helvetica"),
  });

  // Add footer
  page.drawText("Este certificado é válido e pode ser compartilhado", {
    x: 100,
    y: 80,
    size: 11,
    color: rgb(0.5, 0.5, 0.5),
    font: await pdfDoc.embedFont("Helvetica-Oblique"),
  });

  // Save PDF to buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Generate certificate filename
 */
export function generateCertificateFilename(studentId: number, courseId: number): string {
  const timestamp = new Date().toISOString().split("T")[0];
  return `certificado-${studentId}-${courseId}-${timestamp}.pdf`;
}
