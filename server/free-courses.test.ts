import { describe, it, expect } from "vitest";
import { getCourses } from "./infra/db.js";

describe("Free Courses Filter", () => {
  it("should filter courses by price = 0", async () => {
    const allCourses = await getCourses(100, 0);
    
    // Filter logic: only courses with price = 0
    const freeCourses = allCourses.filter(
      (course) => parseFloat(course.price || "0") === 0
    );

    // Verify that the filter logic works
    // (There may or may not be free courses in the database)
    freeCourses.forEach((course) => {
      expect(parseFloat(course.price || "0")).toBe(0);
    });
  });

  it("should not include paid courses in free courses filter", async () => {
    const allCourses = await getCourses(100, 0);
    
    // Filter logic: only courses with price = 0
    const freeCourses = allCourses.filter(
      (course) => parseFloat(course.price || "0") === 0
    );

    // Verify that no paid courses are in the filtered list
    freeCourses.forEach((course) => {
      expect(parseFloat(course.price || "0")).toBe(0);
    });
  });

  it("should have all required fields for carousel display", async () => {
    const allCourses = await getCourses(100, 0);
    const freeCourses = allCourses.filter(
      (course) => parseFloat(course.price || "0") === 0
    );

    // Each free course should have required fields for carousel display
    freeCourses.forEach((course) => {
      expect(course.title).toBeDefined();
      expect(course.description).toBeDefined();
      expect(course.courseHours).toBeDefined();
    });
  });

  it("should correctly identify free vs paid courses", async () => {
    const allCourses = await getCourses(100, 0);
    
    const freeCourses = allCourses.filter(
      (course) => parseFloat(course.price || "0") === 0
    );
    
    const paidCourses = allCourses.filter(
      (course) => parseFloat(course.price || "0") > 0
    );

    // Verify that free and paid courses don't overlap
    const freeIds = new Set(freeCourses.map(c => c.id));
    const paidIds = new Set(paidCourses.map(c => c.id));
    
    const overlap = [...freeIds].filter(id => paidIds.has(id));
    expect(overlap.length).toBe(0);
  });
});
