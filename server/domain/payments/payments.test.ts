import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../../routers/index.js";
import type { TrpcContext } from "../../_core/context.js";
import * as db from "../../infra/db.js";

vi.mock("../../infra/db", () => ({
  createPayment: vi.fn(),
  getPaymentsByStudent: vi.fn(),
  getPaymentsByCourse: vi.fn(),
  getAllPayments: vi.fn(),
  updatePayment: vi.fn(),
  getOverduePayments: vi.fn(),
  getCourseById: vi.fn(),
  enrollStudent: vi.fn(),
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

describe("Payments Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should allow student to create payment for course", async () => {
      const mockCourse = {
        id: 1,
        title: "Curso Teste",
        description: "Descrição",
        coverUrl: "https://example.com/cover.jpg",
        price: "99.99",
        slug: "curso-teste",
        professorId: 3,
        maxInstallments: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPayment = {
        id: 1,
        studentId: 2,
        courseId: 1,
        amount: "99.99",
        installments: 1,
        status: "pending",
        pixKey: "41988913431",
        dueDate: new Date(),
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getCourseById).mockResolvedValueOnce(mockCourse);
      vi.mocked(db.createPayment).mockResolvedValueOnce(mockPayment);

      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payments.create({
        courseId: 1,
        amount: "99.99",
        installments: 1,
      });

      expect(result).toEqual(mockPayment);
      expect(db.getCourseById).toHaveBeenCalledWith(1);
      expect(db.createPayment).toHaveBeenCalled();
    });

    it("should prevent payment with more installments than allowed", async () => {
      const mockCourse = {
        id: 1,
        title: "Curso Teste",
        description: "Descrição",
        coverUrl: "https://example.com/cover.jpg",
        price: "99.99",
        slug: "curso-teste",
        professorId: 3,
        maxInstallments: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getCourseById).mockResolvedValueOnce(mockCourse);

      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.payments.create({
          courseId: 1,
          amount: "99.99",
          installments: 5,
        })
      ).rejects.toThrow("Maximo de 2 parcelas");
    });

    it("should use default PIX key if not provided", async () => {
      const mockCourse = {
        id: 1,
        title: "Curso Teste",
        description: "Descrição",
        coverUrl: "https://example.com/cover.jpg",
        price: "99.99",
        slug: "curso-teste",
        professorId: 3,
        maxInstallments: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockPayment = {
        id: 1,
        studentId: 2,
        courseId: 1,
        amount: "99.99",
        installments: 1,
        status: "pending",
        pixKey: "41988913431",
        dueDate: new Date(),
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.getCourseById).mockResolvedValueOnce(mockCourse);
      vi.mocked(db.createPayment).mockResolvedValueOnce(mockPayment);

      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payments.create({
        courseId: 1,
        amount: "99.99",
      });

      expect(result.pixKey).toBe("41988913431");
    });

    it("should prevent unauthenticated access", async () => {
      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.payments.create({
          courseId: 1,
          amount: "99.99",
        })
      ).rejects.toThrow();
    });
  });

  describe("adminCreate", () => {
    it("should allow admin to create payment for student", async () => {
      const mockPayment = {
        id: 1,
        studentId: 2,
        courseId: 1,
        amount: "99.99",
        installments: 1,
        status: "pending",
        pixKey: "41988913431",
        dueDate: new Date(),
        paidAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(db.createPayment).mockResolvedValueOnce(mockPayment);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payments.adminCreate({
        studentId: 2,
        courseId: 1,
        amount: "99.99",
        installments: 1,
      });

      expect(result).toEqual(mockPayment);
      expect(db.createPayment).toHaveBeenCalled();
    });

    it("should prevent non-admin from creating payment for student", async () => {
      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.payments.adminCreate({
          studentId: 2,
          courseId: 1,
          amount: "99.99",
        })
      ).rejects.toThrow();
    });
  });

  describe("markPaid", () => {
    it("should allow admin to mark payment as paid", async () => {
      vi.mocked(db.updatePayment).mockResolvedValueOnce(true);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payments.markPaid({
        paymentId: 1,
      });

      expect(result).toEqual({ success: true });
      expect(db.updatePayment).toHaveBeenCalledWith(1, expect.objectContaining({ status: "paid" }));
    });

    it("should prevent student from marking payment as paid", async () => {
      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.payments.markPaid({
          paymentId: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("getStudentPayments", () => {
    it("should return payments for authenticated student", async () => {
      const mockPayments = [
        {
          id: 1,
          studentId: 2,
          courseId: 1,
          amount: "99.99",
          installments: 1,
          status: "pending",
          pixKey: "41988913431",
          dueDate: new Date(),
          paidAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(db.getPaymentsByStudent).mockResolvedValueOnce(mockPayments);

      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payments.getStudentPayments();

      expect(result).toEqual(mockPayments);
      expect(db.getPaymentsByStudent).toHaveBeenCalledWith(2);
    });

    it("should prevent unauthenticated access", async () => {
      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.payments.getStudentPayments()).rejects.toThrow();
    });
  });

  describe("getAllPayments", () => {
    it("should allow admin to view all payments", async () => {
      const mockPayments = [];

      vi.mocked(db.getAllPayments).mockResolvedValueOnce(mockPayments);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payments.getAllPayments();

      expect(result).toEqual(mockPayments);
      expect(db.getAllPayments).toHaveBeenCalled();
    });

    it("should prevent student from viewing all payments", async () => {
      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.payments.getAllPayments()).rejects.toThrow();
    });
  });

  describe("getOverdue", () => {
    it("should allow admin to view overdue payments", async () => {
      const mockOverduePayments = [];

      vi.mocked(db.getOverduePayments).mockResolvedValueOnce(mockOverduePayments);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payments.getOverdue();

      expect(result).toEqual(mockOverduePayments);
      expect(db.getOverduePayments).toHaveBeenCalled();
    });

    it("should prevent student from viewing overdue payments", async () => {
      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.payments.getOverdue()).rejects.toThrow();
    });
  });

  describe("getByCourse", () => {
    it("should allow admin to view payments for course", async () => {
      const mockPayments = [];

      vi.mocked(db.getPaymentsByCourse).mockResolvedValueOnce(mockPayments);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.payments.getByCourse({
        courseId: 1,
      });

      expect(result).toEqual(mockPayments);
      expect(db.getPaymentsByCourse).toHaveBeenCalledWith(1);
    });

    it("should prevent student from viewing course payments", async () => {
      const ctx = createAuthContext(studentUser);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.payments.getByCourse({
          courseId: 1,
        })
      ).rejects.toThrow();
    });
  });
});
