/**
 * Course Recommendation Service
 */

import { getDb } from "../infra/db.js";
import { eq, and, not, inArray } from "drizzle-orm";
import { courses, enrollments, lessonProgress } from "../../infra/schema.js";

interface RecommendedCourse {
  id: number;
  title: string;
  description: string;
  courseHours: number;
  price: string;
  coverUrl: string;
  reason: string;
  score: number;
}

export async function getRecommendedCourses(studentId: number, limit = 5): Promise<RecommendedCourse[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const enrolledCourses = await db.select({ courseId: enrollments.courseId }).from(enrollments)
      .where(eq(enrollments.studentId, studentId));
    const enrolledIds = enrolledCourses.map((e: any) => e.courseId);

    const allCourses = enrolledIds.length > 0
      ? await db.select().from(courses).where(and(eq(courses.isActive, true), not(inArray(courses.id, enrolledIds))))
      : await db.select().from(courses).where(eq(courses.isActive, true));

    const scored = await Promise.all(allCourses.map(async (course) => {
      let score = 50;
      const reasons: string[] = [];

      const enrollCount = await db.select({ id: enrollments.id }).from(enrollments)
        .where(eq(enrollments.courseId, course.id));
      if (enrollCount.length > 10) { score += 20; reasons.push("Popular"); }

      const courseAge = Date.now() - (course.createdAt?.getTime() || 0);
      if (courseAge < 30 * 24 * 60 * 60 * 1000) { score += 10; reasons.push("Novo"); }

      const val = parseFloat(course.price.toString());
      if (val < 100) { score += 5; reasons.push("Acessivel"); }

      return {
        id: course.id, title: course.title, description: course.description || "",
        courseHours: course.courseHours, price: course.price.toString(),
        coverUrl: course.coverUrl || "", reason: reasons.join(", ") || "Recomendado",
        score: Math.min(100, score),
      };
    }));

    return scored.sort((a: any, b: any) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error("[Recommendation] Error:", error);
    return [];
  }
}

export async function getTrendingCourses(limit = 5): Promise<RecommendedCourse[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const allCourses = await db.select().from(courses).where(eq(courses.isActive, true));
    const scored = await Promise.all(allCourses.map(async (course) => {
      const enrollCount = await db.select({ id: enrollments.id }).from(enrollments)
        .where(eq(enrollments.courseId, course.id));
      return {
        id: course.id, title: course.title, description: course.description || "",
        courseHours: course.courseHours, price: course.price.toString(),
        coverUrl: course.coverUrl || "", reason: "Tendencia",
        score: Math.min(100, enrollCount.length * 10),
      };
    }));
    return scored.sort((a: any, b: any) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error("[Trending] Error:", error);
    return [];
  }
}

export async function getSimilarCourses(courseId: number, limit = 5): Promise<RecommendedCourse[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const base = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!base.length) return [];

    const others = await db.select().from(courses).where(and(eq(courses.isActive, true), not(eq(courses.id, courseId))));
    const scored = others.map((course: any) => {
      let score = 50;
      const priceDiff = Math.abs(parseFloat(base[0].price.toString()) - parseFloat(course.price.toString()));
      if (priceDiff < 50) score += 20;
      const hourDiff = Math.abs(base[0].courseHours - course.courseHours);
      if (hourDiff < 10) score += 15;
      return {
        id: course.id, title: course.title, description: course.description || "",
        courseHours: course.courseHours, price: course.price.toString(),
        coverUrl: course.coverUrl || "", reason: "Similar",
        score: Math.min(100, score),
      };
    });
    return scored.sort((a: any, b: any) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error("[Similar] Error:", error);
    return [];
  }
}
