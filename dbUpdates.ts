import { eq } from "drizzle-orm";
import { getDb } from "./db";
import {
  courses,
  articles,
  pageContent,
  studentProfiles,
  payments,
} from "../../drizzle/schema";

export async function updateCourse(
  courseId: number,
  data: {
    title?: string;
    description?: string;
    coverUrl?: string;
    trailerUrl?: string;
    courseHours?: number;
    price?: string;
    minimumGrade?: number;
    maxInstallments?: number;
  }
) {
  const db = await getDb();
  if (!db) return null;

  const updates: Record<string, any> = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.description !== undefined) updates.description = data.description;
  if (data.coverUrl !== undefined) updates.coverUrl = data.coverUrl;
  if (data.trailerUrl !== undefined) updates.trailerUrl = data.trailerUrl;
  if (data.courseHours !== undefined) updates.courseHours = data.courseHours;
  if (data.price !== undefined) updates.price = data.price;
  if (data.minimumGrade !== undefined) updates.minimumGrade = data.minimumGrade;
  if (data.maxInstallments !== undefined)
    updates.maxInstallments = data.maxInstallments;
  updates.updatedAt = new Date();

  await db.update(courses).set(updates).where(eq(courses.id, courseId));
  const result = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return result[0];
}

export async function deleteCourse(courseId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(courses).where(eq(courses.id, courseId));
}

export async function updateArticle(
  articleId: number,
  data: {
    title?: string;
    content?: string;
    slug?: string;
    featured?: boolean;
  }
) {
  const db = await getDb();
  if (!db) return null;

  const updates: Record<string, any> = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.content !== undefined) updates.content = data.content;
  if (data.slug !== undefined) updates.slug = data.slug;
  if (data.featured !== undefined) updates.featured = data.featured;
  updates.updatedAt = new Date();

  await db.update(articles).set(updates).where(eq(articles.id, articleId));
  const result = await db.select().from(articles).where(eq(articles.id, articleId)).limit(1);
  return result[0];
}

export async function deleteArticle(articleId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(articles).where(eq(articles.id, articleId));
}

export async function updatePageContent(
  pageId: number,
  data: {
    title?: string;
    content?: string;
    slug?: string;
  }
) {
  const db = await getDb();
  if (!db) return null;

  const updates: Record<string, any> = {};
  if (data.title !== undefined) updates.title = data.title;
  if (data.content !== undefined) updates.content = data.content;
  if (data.slug !== undefined) updates.slug = data.slug;
  updates.updatedAt = new Date();

  await db.update(pageContent).set(updates).where(eq(pageContent.id, pageId));
  const result = await db.select().from(pageContent).where(eq(pageContent.id, pageId)).limit(1);
  return result[0];
}

export async function deletePageContent(pageId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(pageContent).where(eq(pageContent.id, pageId));
}

export async function updateProfessional(
  professionalId: number,
  data: {
    bio?: string;
    specialization?: string;
    avatar?: string;
    phone?: string;
    website?: string;
    ranking?: number;
  }
) {
  const db = await getDb();
  if (!db) return null;

  const updates: Record<string, any> = {};
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.specialization !== undefined) updates.specialization = data.specialization;
  if (data.avatar !== undefined) updates.avatar = data.avatar;
  if (data.phone !== undefined) updates.phone = data.phone;
  if (data.website !== undefined) updates.website = data.website;
  if (data.ranking !== undefined) updates.ranking = data.ranking;
  updates.updatedAt = new Date();

  await db.update(studentProfiles).set(updates).where(eq(studentProfiles.id, professionalId));
  const result = await db.select().from(studentProfiles).where(eq(studentProfiles.id, professionalId)).limit(1);
  return result[0];
}

export async function createPayment(data: {
  studentId: number;
  courseId: number;
  amount: string;
  installments: number;
  status: "pending" | "paid" | "overdue" | "cancelled";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not connected");

  await db.insert(payments).values({
    studentId: data.studentId,
    courseId: data.courseId,
    amount: data.amount,
    installments: data.installments,
    status: data.status,
  });

  const payment = await db.select().from(payments)
    .where(eq(payments.studentId, data.studentId))
    .limit(1);
  return payment[0];
}

export async function getPaymentById(paymentId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
  return result[0];
}
