/**
 * Certificate Service
 * Handles certificate generation and management
 */

import { getDb } from "../db";
import { eq, and, isNotNull } from "drizzle-orm";
import { courses, enrollments, lessonProgress, users, certificates } from "../../drizzle/schema";

interface CertificateData {
  studentName: string;
  courseName: string;
  completionDate: Date;
  courseHours: number;
  certificateCode: string;
  professorName: string;
}

function generateCertificateCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${timestamp}-${random}`;
}

export async function shouldIssueCertificate(studentId: number, courseId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const allProgress = await db.select({ id: lessonProgress.id })
      .from(lessonProgress)
      .where(eq(lessonProgress.studentId, studentId));

    if (!allProgress.length) return false;

    const completedProgress = await db.select({ id: lessonProgress.id })
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.studentId, studentId),
        eq(lessonProgress.status, "completed")
      ));

    const completionRate = completedProgress.length / allProgress.length;
    return completionRate >= 0.8;
  } catch (error) {
    console.error("[Certificate] Error checking eligibility:", error);
    return false;
  }
}

export async function generateCertificateData(studentId: number, courseId: number): Promise<CertificateData | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const student = await db.select().from(users).where(eq(users.id, studentId)).limit(1);
    if (!student.length) return null;

    const course = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!course.length) return null;

    const professor = await db.select().from(users).where(eq(users.id, course[0].professorId)).limit(1);

    return {
      studentName: student[0].name || "Aluno",
      courseName: course[0].title,
      completionDate: new Date(),
      courseHours: course[0].courseHours,
      certificateCode: generateCertificateCode(),
      professorName: professor.length ? (professor[0].name || "Professor") : "Professor",
    };
  } catch (error) {
    console.error("[Certificate] Error generating certificate data:", error);
    return null;
  }
}

export function generateCertificateHTML(data: CertificateData): string {
  const formattedDate = data.completionDate.toLocaleDateString("pt-BR");
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
body{margin:0;padding:20px;font-family:'Georgia',serif;background:#f5f5f5}
.certificate{width:100%;max-width:900px;margin:0 auto;background:linear-gradient(135deg,#0D2333 0%,#06B2C9 100%);padding:60px;border-radius:10px;color:white;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,0.3)}
.logo{font-size:32px;font-weight:bold;margin-bottom:10px}
.title{font-size:48px;font-weight:bold;margin:30px 0;text-transform:uppercase;letter-spacing:2px}
.student-name{font-size:28px;font-weight:bold;margin:20px 0;text-decoration:underline}
.course-name{font-size:24px;margin:20px 0;font-style:italic}
.details{margin:30px 0;font-size:16px}
.signature-section{margin-top:60px;display:flex;justify-content:space-around;padding-top:40px;border-top:2px solid rgba(255,255,255,0.5)}
.signature{text-align:center;width:200px}
.signature-line{border-top:2px solid white;margin:40px 0 10px 0}
.code{margin-top:30px;font-size:12px;opacity:0.8}
</style></head><body>
<div class="certificate">
  <div class="logo">EducaDQ</div>
  <p>Centro de Formacao e Estudos sobre Alcool e outras Drogas</p>
  <div class="title">Certificado de Conclusao</div>
  <p>Certificamos que</p>
  <div class="student-name">${data.studentName}</div>
  <p>completou com exito o curso</p>
  <div class="course-name">${data.courseName}</div>
  <div class="details">
    <p><strong>Carga Horaria:</strong> ${data.courseHours} horas</p>
    <p><strong>Data de Conclusao:</strong> ${formattedDate}</p>
  </div>
  <div class="signature-section">
    <div class="signature"><div class="signature-line"></div><p>${data.professorName}</p><p>Professor</p></div>
    <div class="signature"><div class="signature-line"></div><p>EducaDQ</p><p>Administracao</p></div>
  </div>
  <div class="code"><p>Codigo do Certificado: ${data.certificateCode}</p></div>
</div></body></html>`;
}
