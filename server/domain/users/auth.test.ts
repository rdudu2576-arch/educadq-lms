import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "../../routers/index.js";
import type { TrpcContext } from "../../_core/context.js";
import * as db from "../../infra/db.js";

// Mock the database
vi.mock("../../infra/db", () => ({
  getUserById: vi.fn(),
  updateUserRole: vi.fn(),
  updateUserProfile: vi.fn(),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(user: AuthenticatedUser | null): TrpcContext {
  return {
    user,
    req: {} as any,
    res: {
      clearCookie: vi.fn(),
    } as any,
  };
}

describe("Auth Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("me", () => {
    it("should return current user when authenticated", async () => {
      const user: AuthenticatedUser = {
        id: 1,
        openId: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        cpf: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        lastSignedIn: new Date(),
      };
      const ctx = createAuthContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.email).toBe("test@example.com");
    });

    it("should return null when not authenticated", async () => {
      const ctx = createAuthContext(null);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });
  });

  describe("updateProfile", () => {
    it("should update user profile with valid data", async () => {
      const user: AuthenticatedUser = {
        id: 1,
        openId: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        cpf: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        lastSignedIn: new Date(),
      };

      const mockUpdatedUser = {
        id: 1,
        openId: "test-user-123",
        name: "Updated Name",
        email: "test@example.com",
        role: "user",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        address: "Rua Teste, 123",
        city: "São Paulo",
        state: "SP",
        zip: "01234-567",
        createdAt: new Date(),
        updatedAt: new Date(),
        
        lastSignedIn: new Date(),
      };

      vi.mocked(db.updateUserProfile).mockResolvedValueOnce(mockUpdatedUser);

      const ctx = createAuthContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.updateProfile({
        name: "Updated Name",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        address: "Rua Teste, 123",
        city: "São Paulo",
        state: "SP",
        zip: "01234-567",
      });

      expect(result).toEqual(mockUpdatedUser);
      expect(db.updateUserProfile).toHaveBeenCalledWith(1, {
        name: "Updated Name",
        cpf: "123.456.789-00",
        phone: "(11) 99999-9999",
        address: "Rua Teste, 123",
        city: "São Paulo",
        state: "SP",
        zip: "01234-567",
      });
    });

    it("should allow partial profile updates", async () => {
      const user: AuthenticatedUser = {
        id: 1,
        openId: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        cpf: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        lastSignedIn: new Date(),
      };

      const mockUpdatedUser = {
        id: 1,
        openId: "test-user-123",
        name: "Updated Name",
        email: "test@example.com",
        role: "user",
        cpf: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        lastSignedIn: new Date(),
      };

      vi.mocked(db.updateUserProfile).mockResolvedValueOnce(mockUpdatedUser);

      const ctx = createAuthContext(user);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.updateProfile({
        name: "Updated Name",
      });

      expect(result).toEqual(mockUpdatedUser);
      expect(db.updateUserProfile).toHaveBeenCalledWith(1, {
        name: "Updated Name",
      });
    });
  });

  describe("updateUserRole", () => {
    it("should allow admin to update user role", async () => {
      const adminUser: AuthenticatedUser = {
        id: 1,
        openId: "admin-user",
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
        
        lastSignedIn: new Date(),
      };

      const mockUpdatedUser = {
        id: 2,
        openId: "test-user-456",
        name: "Test User 2",
        email: "test2@example.com",
        role: "professor",
        cpf: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        lastSignedIn: new Date(),
      };

      vi.mocked(db.updateUserRole).mockResolvedValueOnce(mockUpdatedUser);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.updateUserRole({
        userId: 2,
        role: "professor",
      });

      expect(result).toEqual(mockUpdatedUser);
      expect(db.updateUserRole).toHaveBeenCalledWith(2, "professor");
    });

    it("should prevent non-admin from updating user role", async () => {
      const user: AuthenticatedUser = {
        id: 1,
        openId: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        cpf: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        lastSignedIn: new Date(),
      };

      const ctx = createAuthContext(user);
      const caller = appRouter.createCaller(ctx);

      expect(
        caller.auth.updateUserRole({
          userId: 2,
          role: "professor",
        })
      ).rejects.toThrow("Only admins can update user roles");
    });
  });

  describe("getUserById", () => {
    it("should allow admin to get user by ID", async () => {
      const adminUser: AuthenticatedUser = {
        id: 1,
        openId: "admin-user",
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
        
        lastSignedIn: new Date(),
      };

      const mockUser = {
        id: 2,
        openId: "test-user-456",
        name: "Test User 2",
        email: "test2@example.com",
        role: "user",
        cpf: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        lastSignedIn: new Date(),
      };

      vi.mocked(db.getUserById).mockResolvedValueOnce(mockUser);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.getUserById({
        userId: 2,
      });

      expect(result).toEqual(mockUser);
      expect(db.getUserById).toHaveBeenCalledWith(2);
    });

    it("should prevent non-admin from getting user by ID", async () => {
      const user: AuthenticatedUser = {
        id: 1,
        openId: "test-user-123",
        name: "Test User",
        email: "test@example.com",
        role: "user",
        cpf: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        
        lastSignedIn: new Date(),
      };

      const ctx = createAuthContext(user);
      const caller = appRouter.createCaller(ctx);

      expect(
        caller.auth.getUserById({
          userId: 2,
        })
      ).rejects.toThrow("Only admins can view user details");
    });

    it("should throw NOT_FOUND if user does not exist", async () => {
      const adminUser: AuthenticatedUser = {
        id: 1,
        openId: "admin-user",
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
        
        lastSignedIn: new Date(),
      };

      vi.mocked(db.getUserById).mockResolvedValueOnce(null);

      const ctx = createAuthContext(adminUser);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.auth.getUserById({
          userId: 999,
        })
      ).rejects.toThrow("User not found");
    });
  });
});
