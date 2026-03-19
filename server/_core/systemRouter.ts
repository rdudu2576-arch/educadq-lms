import { router, publicProcedure, protectedProcedure } from "./trpc.js";
import { z } from "zod";
import * as db from "../infra/db.js";
import { TRPCError } from "@trpc/server";

export const systemRouter = router({
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
  
  // Backdoor temporário para tornar um usuário admin
  makeMeAdmin: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado no banco de dados local.",
        });
      }
      
      // Atualizar o papel para admin
      await db.updateUserProfile(user.id, { role: "admin" });
      
      return { 
        success: true, 
        message: `Usuário ${input.email} agora é ADMINISTRADOR. Faça login novamente.` 
      };
    }),

  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    // Lógica para estatísticas do sistema
    return { users: 0, courses: 0 };
  }),
});
