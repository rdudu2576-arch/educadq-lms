import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import { loginUser } from "../../services/auth.service.js";
import { createUser, getUserByEmail } from "../../infra/db.js";
import { hashPassword, generateToken } from "../../services/auth.service.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
};

export const authRouter = router({
  /**
   * Get current user
   */
  me: publicProcedure.query(({ ctx }) => {
    if (!ctx.user) {
      return null;
    }

    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
      cpf: ctx.user.cpf,
      phone: ctx.user.phone,
      createdAt: ctx.user.createdAt,
    };
  }),

  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const { user, token } = await loginUser(input.email, input.password);

        // Set token in httpOnly cookie
        ctx.res.cookie("token", token, COOKIE_OPTIONS);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message,
        });
      }
    }),

  /**
   * Register new user
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email("E-mail inválido"),
        password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
        name: z.string().min(2, "Nome muito curto"),
        cpf: z.string().optional(),
        rg: z.string().optional(),
        phone: z.string().optional(),
        age: z.string().optional(),
        cep: z.string().optional(),
        address: z.string().optional(),
        number: z.string().optional(),
        complement: z.string().optional(),
        neighborhood: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Check if user already exists
        const existing = await getUserByEmail(input.email);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário com este e-mail já existe",
          });
        }

        // Hash password
        const hashedPassword = await hashPassword(input.password);

        // Create user with all fields
        const user = await createUser({
          email: input.email,
          password: hashedPassword,
          name: input.name,
          role: "user",
          additionalData: {
            cpf: input.cpf,
            rg: input.rg,
            phone: input.phone,
            age: input.age,
            address: input.address,
            city: input.city,
            state: input.state,
            cep: input.cep,
            neighborhood: input.neighborhood,
            complement: input.complement,
            number: input.number,
          }
        });

        // Generate token
        const token = generateToken({
          id: user.id,
          email: user.email!,
          role: user.role as "admin" | "professor" | "user",
        });

        // Set token in httpOnly cookie
        ctx.res.cookie("token", token, COOKIE_OPTIONS);

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        const message = error instanceof Error ? error.message : "Erro ao registrar usuário";
        throw new TRPCError({
          code: "BAD_REQUEST",
          message,
        });
      }
    }),

  /**
   * Logout
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    // Clear token cookie
    ctx.res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return { success: true };
  }),

  /**
   * Update own profile
   */
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().optional(),
        cpf: z.string().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      try {
        // Import db functions
        const { updateUserProfile } = await import("../../infra/db.js");
        const updated = await updateUserProfile(ctx.user.id, input);

        return {
          success: true,
          user: updated,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update profile";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),

  /**
   * Get user by ID (admin only)
   */
  getUserById: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view user details",
        });
      }

      try {
        const { getUserById } = await import("../../services/auth.service.js");
        const user = await getUserById(input.userId);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          cpf: user.cpf,
          phone: user.phone,
          createdAt: user.createdAt,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to get user",
        });
      }
    }),

  /**
   * Update user role (admin only)
   */
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["admin", "professor", "user"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user || ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update user roles",
        });
      }

      try {
        const { updateUserRole } = await import("../../infra/db.js");
        const updated = await updateUserRole(input.userId, input.role);

        return {
          success: true,
          user: updated,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update role";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
});
