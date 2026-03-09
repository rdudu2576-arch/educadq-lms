import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../../routers";
import type { TrpcContext } from "../../_core/context";
import * as db from "../../infra/db";
import * as mp from "./mercadopago";

vi.mock("../../infra/db", () => ({
  updatePayment: vi.fn(),
  enrollStudent: vi.fn(),
  getPaymentsByStudent: vi.fn(),
}));

vi.mock("./mercadopago", async () => {
  const actual = await vi.importActual("./mercadopago");
  return {
    ...actual,
    getMercadoPagoPayment: vi.fn(),
  };
});

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {} as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

describe("Webhooks Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mercadoPago webhook", () => {
    it("should process approved payment and enroll student", async () => {
      const mockMpPayment = {
        id: 123456,
        status: "approved",
        status_detail: "accredited",
        external_reference: "2_1",
        transaction_amount: 99.99,
        payer: {
          email: "student@example.com",
          id: "123",
        },
      };

      vi.mocked(mp.getMercadoPagoPayment).mockResolvedValueOnce(mockMpPayment);
      vi.mocked(db.updatePayment).mockResolvedValueOnce(true);
      vi.mocked(db.enrollStudent).mockResolvedValueOnce(true);

      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.webhooks.mercadoPago({
        action: "payment.created",
        data: { id: "123456" },
        type: "payment",
      });

      expect(result.success).toBe(true);
      expect(db.updatePayment).toHaveBeenCalledWith(
        123456,
        expect.objectContaining({ status: "paid" })
      );
      expect(db.enrollStudent).toHaveBeenCalledWith(2, 1);
    });

    it("should handle pending payment without enrolling", async () => {
      const mockMpPayment = {
        id: 123456,
        status: "pending",
        status_detail: "pending_review",
        external_reference: "2_1",
        transaction_amount: 99.99,
        payer: {
          email: "student@example.com",
          id: "123",
        },
      };

      vi.mocked(mp.getMercadoPagoPayment).mockResolvedValueOnce(mockMpPayment);
      vi.mocked(db.updatePayment).mockResolvedValueOnce(true);

      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.webhooks.mercadoPago({
        action: "payment.created",
        data: { id: "123456" },
        type: "payment",
      });

      expect(result.success).toBe(true);
      expect(db.updatePayment).toHaveBeenCalledWith(
        123456,
        expect.objectContaining({ status: "pending" })
      );
      expect(db.enrollStudent).not.toHaveBeenCalled();
    });

    it("should handle rejected payment", async () => {
      const mockMpPayment = {
        id: 123456,
        status: "rejected",
        status_detail: "insufficient_funds",
        external_reference: "2_1",
        transaction_amount: 99.99,
        payer: {
          email: "student@example.com",
          id: "123",
        },
      };

      vi.mocked(mp.getMercadoPagoPayment).mockResolvedValueOnce(mockMpPayment);
      vi.mocked(db.updatePayment).mockResolvedValueOnce(true);

      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.webhooks.mercadoPago({
        action: "payment.created",
        data: { id: "123456" },
        type: "payment",
      });

      expect(result.success).toBe(true);
      expect(db.updatePayment).toHaveBeenCalledWith(
        123456,
        expect.objectContaining({ status: "cancelled" })
      );
      expect(db.enrollStudent).not.toHaveBeenCalled();
    });

    it("should ignore non-payment notifications", async () => {
      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.webhooks.mercadoPago({
        action: "merchant_order.created",
        data: { id: "123456" },
        type: "merchant_order",
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain("not payment");
      expect(db.updatePayment).not.toHaveBeenCalled();
    });

    it("should handle enrollment errors gracefully", async () => {
      const mockMpPayment = {
        id: 123456,
        status: "approved",
        status_detail: "accredited",
        external_reference: "2_1",
        transaction_amount: 99.99,
        payer: {
          email: "student@example.com",
          id: "123",
        },
      };

      vi.mocked(mp.getMercadoPagoPayment).mockResolvedValueOnce(mockMpPayment);
      vi.mocked(db.updatePayment).mockResolvedValueOnce(true);
      vi.mocked(db.enrollStudent).mockRejectedValueOnce(new Error("Already enrolled"));

      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.webhooks.mercadoPago({
        action: "payment.created",
        data: { id: "123456" },
        type: "payment",
      });

      expect(result.success).toBe(true);
      expect(db.updatePayment).toHaveBeenCalled();
    });
  });

  describe("verifyPayment", () => {
    it("should return approved status and enroll student", async () => {
      const mockMpPayment = {
        id: 123456,
        status: "approved",
        status_detail: "accredited",
        external_reference: "2_1",
        transaction_amount: 99.99,
        payer: {
          email: "student@example.com",
          id: "123",
        },
      };

      vi.mocked(mp.getMercadoPagoPayment).mockResolvedValueOnce(mockMpPayment);
      vi.mocked(db.enrollStudent).mockResolvedValueOnce(true);

      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.webhooks.verifyPayment({
        paymentId: "123456",
        studentId: 2,
        courseId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("approved");
      expect(result.redirect).toBe("/student");
      expect(db.enrollStudent).toHaveBeenCalledWith(2, 1);
    });

    it("should return pending status without enrolling", async () => {
      const mockMpPayment = {
        id: 123456,
        status: "pending",
        status_detail: "pending_review",
        external_reference: "2_1",
        transaction_amount: 99.99,
        payer: {
          email: "student@example.com",
          id: "123",
        },
      };

      vi.mocked(mp.getMercadoPagoPayment).mockResolvedValueOnce(mockMpPayment);

      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.webhooks.verifyPayment({
        paymentId: "123456",
        studentId: 2,
        courseId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe("pending");
      expect(db.enrollStudent).not.toHaveBeenCalled();
    });

    it("should return failed status for rejected payment", async () => {
      const mockMpPayment = {
        id: 123456,
        status: "rejected",
        status_detail: "insufficient_funds",
        external_reference: "2_1",
        transaction_amount: 99.99,
        payer: {
          email: "student@example.com",
          id: "123",
        },
      };

      vi.mocked(mp.getMercadoPagoPayment).mockResolvedValueOnce(mockMpPayment);

      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.webhooks.verifyPayment({
        paymentId: "123456",
        studentId: 2,
        courseId: 1,
      });

      expect(result.success).toBe(false);
      expect(["rejected", "error"]).toContain(result.status);
      expect(result.redirect).toContain("/checkout/1");
    });

    it("should handle API errors gracefully", async () => {
      vi.mocked(mp.getMercadoPagoPayment).mockRejectedValueOnce(
        new Error("API Error")
      );

      const ctx = createContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.webhooks.verifyPayment({
        paymentId: "123456",
        studentId: 2,
        courseId: 1,
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe("error");
    });
  });
});
