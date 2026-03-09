import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../../routers";
import type { TrpcContext } from "../../_core/context";
import * as db from "../../infra/db";

vi.mock("../../infra/db", () => ({
  getCourses: vi.fn(),
  getCourseBySlug: vi.fn(),
  getCourseById: vi.fn(),
  getCoursesByProfessor: vi.fn(),
  createCourse: vi.fn(),
  updateCourse: vi.fn(),
  deleteCourse: vi.fn(),
  getLessonsByCourse: vi.fn(),
  getModulesByCourse: vi.fn(),
  createLesson: vi.fn(),
  getLessonsByModuleId: vi.fn(),
  updateLesson: vi.fn(),
  deleteLesson: vi.fn(),
  getLessonById: vi.fn(),
  createLessonMaterial: vi.fn(),
  createModule: vi.fn(),
  getMaterialsByLesson: vi.fn(),
  deleteLessonMaterial: vi.fn(),
  removeMaterial: vi.fn(),
  getCourseBySlugOrId: vi.fn(),
  getEnrollmentStatus: vi.fn(),
  enrollStudent: vi.fn(),
  getStudentCourses: vi.fn(),
  getStudentEnrollments: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {} as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

const adminUser: AuthenticatedUser = {
  id: 1,
  openId: "admin-123",
  name: "Admin",
  email: "admin@example.com",
  role: "admin",
  cpf: null,
  phone: null,
  address: null,
  city: null,
  state: null,
  zip: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  loginMethod: "manus",
  lastSignedIn: new Date(),
};

const professorUser: AuthenticatedUser = {
  id: 3,
  openId: "professor-789",
  name: "Professor",
  email: "professor@example.com",
  role: "professor",
  cpf: null,
  phone: null,
  address: null,
  city: null,
  state: null,
  zip: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  loginMethod: "manus",
  lastSignedIn: new Date(),
};

const studentUser: AuthenticatedUser = {
  id: 2,
  openId: "student-456",
  name: "Student",
  email: "student@example.com",
  role: "user",
  cpf: null,
  phone: null,
  address: null,
  city: null,
  state: null,
  zip: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  loginMethod: "manus",
  lastSignedIn: new Date(),
};

describe("Courses Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("should return courses list for public access", async () => {
      const mockCourses = [
        {
          id: 1,
          title: "Dependência Química",
          description: "Curso sobre dependência química",
          coverUrl: "https://example.com/cover.jpg",
          price: "99.99",
          slug: "dependencia-quimica",
          professorId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getCourses).mockResolvedValueOnce(mockCourses);

      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.courses.list({
        limit: 20,
        offset: 0,
      });

      expect(result).toEqual(mockCourses);
      expect(db.getCourses).toHaveBeenCalledWith(20, 0);
    });
  });

  describe("getBySlug", () => {
    it("should return course with lessons and modules by slug", async () => {
      const mockCourse = {
        id: 1,
        title: "Dependência Química",
        description: "Curso sobre dependência química",
        coverUrl: "https://example.com/cover.jpg",
        price: "99.99",
        slug: "dependencia-quimica",
        professorId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLessons = [
        {
          id: 1,
          moduleId: 1,
          title: "Aula 1",
          type: "video",
          videoUrl: "https://youtube.com/watch?v=123",
          meetUrl: null,
          textContent: null,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockModules = [
        {
          id: 1,
          courseId: 1,
          title: "Módulo 1",
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getCourseBySlugOrId).mockResolvedValueOnce(mockCourse);
      vi.mocked(db.getLessonsByCourse).mockResolvedValueOnce(mockLessons);
      vi.mocked(db.getModulesByCourse).mockResolvedValueOnce(mockModules);

      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.courses.getBySlug({
        slug: "dependencia-quimica",
      });

      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("lessons");
      expect(result).toHaveProperty("modules");
      expect(result.lessons).toHaveLength(1);
      expect(result.modules).toHaveLength(1);
    });

    it("should throw NOT_FOUND if course does not exist", async () => {
      vi.mocked(db.getCourseBySlugOrId).mockResolvedValueOnce(null);

      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.courses.getBySlug({
          slug: "non-existent",
        })
      ).rejects.toThrow("Curso não encontrado");
    });
  });

  describe("getById", () => {
    it("should return course with lessons and modules by ID", async () => {
      const mockCourse = {
        id: 1,
        title: "Dependência Química",
        description: "Curso sobre dependência química",
        coverUrl: "https://example.com/cover.jpg",
        price: "99.99",
        slug: "dependencia-quimica",
        professorId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockLessons = [];
      const mockModules = [];

      vi.mocked(db.getCourseById).mockResolvedValueOnce(mockCourse);
      vi.mocked(db.getLessonsByCourse).mockResolvedValueOnce(mockLessons);
      vi.mocked(db.getModulesByCourse).mockResolvedValueOnce(mockModules);

      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.courses.getById({ courseId: 1 });

      expect(result).toHaveProperty("id", 1);
      expect(result).toHaveProperty("lessons");
      expect(result).toHaveProperty("modules");
    });
  });

  describe("getByProfessor", () => {
    it("should allow professor to view their own courses", async () => {
      const mockCourses = [
        {
          id: 1,
          title: "Meu Curso",
          description: "Descrição",
          coverUrl: "https://example.com/cover.jpg",
          price: "99.99",
          slug: "meu-curso",
          professorId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getCoursesByProfessor).mockResolvedValueOnce(mockCourses);

      const ctx = createAuthContext(professorUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.courses.getByProfessor({
        professorId: 3,
      });

      expect(result).toEqual(mockCourses);
      expect(db.getCoursesByProfessor).toHaveBeenCalledWith(3);
    });

    it("should prevent professor from viewing other professor courses", async () => {
      const ctx = createAuthContext(professorUser);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.courses.getByProfessor({
          professorId: 5, // Different professor
        })
      ).rejects.toThrow("You can only view your own courses");
    });

    it("should allow admin to view any professor courses", async () => {
      const mockCourses = [];

      vi.mocked(db.getCoursesByProfessor).mockResolvedValueOnce(mockCourses);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.courses.getByProfessor({
        professorId: 3,
      });

      expect(result).toEqual(mockCourses);
    });
  });

  describe("create", () => {
    it("should allow admin to create a course", async () => {
      const mockCourseResult = [{ insertId: 1 }];
      const mockModuleResult = [{ insertId: 1 }];

      vi.mocked(db.createCourse).mockResolvedValueOnce(mockCourseResult as any);
      vi.mocked(db.createModule).mockResolvedValueOnce(mockModuleResult as any);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.courses.create({
        title: "Novo Curso",
        description: "Descrição",
        coverUrl: "https://example.com/cover.jpg",
        courseHours: 40,
        price: "99.99",
        professorId: 3,
      });

      expect(result).toHaveProperty("courseId");
      expect(db.createCourse).toHaveBeenCalled();
    });

    it("should allow professor to create a course", async () => {
      const mockCourseResult = [{ insertId: 1 }];
      const mockModuleResult = [{ insertId: 1 }];

      vi.mocked(db.createCourse).mockResolvedValueOnce(mockCourseResult as any);
      vi.mocked(db.createModule).mockResolvedValueOnce(mockModuleResult as any);

      const ctx = createAuthContext(professorUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.courses.create({
        title: "Novo Curso",
        courseHours: 40,
        price: "99.99",
        professorId: 3,
      });

      expect(result).toHaveProperty("courseId");
    });

    it("should prevent student from creating a course", async () => {
      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.courses.create({
          title: "Novo Curso",
          courseHours: 40,
          price: "99.99",
          professorId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("enroll", () => {
    it("should allow authenticated student to enroll in a course", async () => {
      const mockCourse = {
        id: 1,
        title: "Test Course",
        description: "Test",
        coverUrl: "https://example.com/cover.jpg",
        price: "99.99",
        slug: "test-course",
        professorId: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockEnrollment = {
        id: 1,
        userId: 2,
        courseId: 1,
        enrolledAt: new Date(),
        completedAt: null,
        progress: 0,
      };

      vi.mocked(db.getCourseById).mockResolvedValueOnce(mockCourse);
      vi.mocked(db.getEnrollmentStatus).mockResolvedValueOnce(null);
      vi.mocked(db.enrollStudent).mockResolvedValueOnce(mockEnrollment);

      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.courses.enroll({
        courseId: 1,
      });

      expect(result).toEqual(mockEnrollment);
      expect(db.enrollStudent).toHaveBeenCalledWith(2, 1);
    });

    it("should prevent unauthenticated access to enroll", async () => {
      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.courses.enroll({
          courseId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("getStudentCourses", () => {
    it("should return courses for authenticated student", async () => {
      const mockCourses = [
        {
          id: 1,
          title: "Curso 1",
          description: "Descrição 1",
          coverUrl: "https://example.com/cover1.jpg",
          price: "99.99",
          slug: "curso-1",
          professorId: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getStudentEnrollments).mockResolvedValueOnce(mockCourses);

      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.courses.getStudentCourses();

      expect(result).toEqual(mockCourses);
      expect(db.getStudentEnrollments).toHaveBeenCalledWith(2);
    });

    it("should prevent unauthenticated access", async () => {
      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.courses.getStudentCourses()).rejects.toThrow();
    });
  });
});

describe("Lessons Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addMaterial", () => {
    it("should allow admin to add material to lesson", async () => {
      const mockLesson = {
        id: 1,
        moduleId: 1,
        title: "Aula 1",
        type: "video",
        videoUrl: "https://youtube.com/watch?v=123",
        meetUrl: null,
        textContent: null,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMaterial = {
        id: 1,
        lessonId: 1,
        title: "Apostila PDF",
        url: "https://drive.google.com/file/d/123",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getLessonById).mockResolvedValueOnce(mockLesson);
      vi.mocked(db.createLessonMaterial).mockResolvedValueOnce(mockMaterial);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lessons.addMaterial({
        lessonId: 1,
        title: "Apostila PDF",
        url: "https://drive.google.com/file/d/123",
      });

      expect(result).toEqual(mockMaterial);
      expect(db.createLessonMaterial).toHaveBeenCalled();
    });
  });

  describe("getMaterialsByLessonId", () => {
    it("should return materials by lesson ID", async () => {
      const mockMaterials = [
        {
          id: 1,
          lessonId: 1,
          title: "Apostila PDF",
          url: "https://drive.google.com/file/d/123",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getMaterialsByLesson).mockResolvedValueOnce(
        mockMaterials
      );

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lessons.getMaterials({
        lessonId: 1,
      });

      expect(result).toEqual(mockMaterials);
      expect(result).toHaveLength(1);
    });
  });

  describe("removeMaterial", () => {
    it("should allow admin to remove material", async () => {
      vi.mocked(db.deleteLessonMaterial).mockResolvedValueOnce(true);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.lessons.removeMaterial({
        materialId: 1,
      });

      expect(result).toBe(true);
      expect(db.deleteLessonMaterial).toHaveBeenCalledWith(1);
    });
  });
});
