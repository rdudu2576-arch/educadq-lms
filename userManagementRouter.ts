import { router, adminProcedure, protectedProcedure } from "../../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as roleManagement from "../../infra/userRoleManagement";

export const userManagementRouter = router({
  /**
   * Listar todos os usuários (admin only)
   */
  listUsers: adminProcedure
    .input(
      z.object({
        role: z.enum(["admin", "professor", "user"]).optional(),
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const users = await roleManagement.listAllUsers({
          role: input.role,
          search: input.search,
          limit: input.limit,
          offset: input.offset,
        });

        const total = await roleManagement.countUsers(input.role);

        return {
          users: users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
          })),
          total,
          limit: input.limit,
          offset: input.offset,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error listing users",
        });
      }
    }),

  /**
   * Obter detalhes de um usuário
   */
  getUserDetails: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const user = await roleManagement.getUserWithRole(input.userId);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          cpf: user.cpf,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zip: user.zip,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          permissions: roleManagement.getRolePermissions(user.role as any),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error getting user details",
        });
      }
    }),

  /**
   * Atualizar papel do usuário
   */
  updateUserRole: adminProcedure
    .input(
      z.object({
        userId: z.number(),
        newRole: z.enum(["admin", "professor", "user"]),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        // Verificar se admin pode fazer essa mudança
        const targetUser = await roleManagement.getUserWithRole(input.userId);
        if (!targetUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const canChange = roleManagement.canChangeRole(
          ctx.user.role as any,
          targetUser.role as any,
          input.newRole
        );

        if (!canChange) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to change this user's role",
          });
        }

        // Atualizar papel
        const success = await roleManagement.updateUserRole({
          userId: input.userId,
          newRole: input.newRole,
          reason: input.reason,
          changedBy: ctx.user.id,
        });

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user role",
          });
        }

        return {
          success: true,
          message: `User role updated to ${input.newRole}`,
          userId: input.userId,
          newRole: input.newRole,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error updating user role",
        });
      }
    }),

  /**
   * Promover usuário para admin
   */
  promoteToAdmin: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        const success = await roleManagement.promoteToAdmin(input.userId, ctx.user.id);

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to promote user",
          });
        }

        return {
          success: true,
          message: "User promoted to admin",
          userId: input.userId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error promoting user",
        });
      }
    }),

  /**
   * Rebaixar admin para professor
   */
  demoteAdminToProfessor: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        const success = await roleManagement.demoteAdminToProfessor(input.userId, ctx.user.id);

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to demote user",
          });
        }

        return {
          success: true,
          message: "Admin demoted to professor",
          userId: input.userId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error demoting user",
        });
      }
    }),

  /**
   * Rebaixar professor para aluno
   */
  demoteProfessorToStudent: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Not authenticated",
          });
        }

        const success = await roleManagement.demoteProfessorToStudent(input.userId, ctx.user.id);

        if (!success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to demote user",
          });
        }

        return {
          success: true,
          message: "Professor demoted to student",
          userId: input.userId,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error demoting user",
        });
      }
    }),

  /**
   * Obter estatísticas de usuários
   */
  getUserStats: adminProcedure.query(async () => {
    try {
      const stats = await roleManagement.getUserStatsByRole();

      return {
        admin: stats.admin,
        professor: stats.professor,
        student: stats.user,
        total: stats.admin + stats.professor + stats.user,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error getting user statistics",
      });
    }
  }),

  /**
   * Obter histórico de mudanças de papel
   */
  getRoleChangeHistory: adminProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      try {
        const history = await roleManagement.getRoleChangeHistory(input.userId);

        return {
          userId: input.userId,
          changes: history,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error getting role change history",
        });
      }
    }),

  /**
   * Buscar usuário por email
   */
  searchUserByEmail: adminProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      try {
        const users = await roleManagement.listAllUsers({
          search: input.email,
          limit: 10,
        });

        const found = users.find((u) => u.email === input.email);

        if (!found) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          id: found.id,
          name: found.name,
          email: found.email,
          role: found.role,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error searching user",
        });
      }
    }),

  /**
   * Obter permissões do papel
   */
  getRolePermissions: protectedProcedure
    .input(z.object({ role: z.enum(["admin", "professor", "user"]) }))
    .query(async ({ input }) => {
      try {
        const permissions = roleManagement.getRolePermissions(input.role);

        return {
          role: input.role,
          permissions,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error getting role permissions",
        });
      }
    }),
});
