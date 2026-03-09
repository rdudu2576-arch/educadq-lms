import { router, publicProcedure, protectedProcedure } from "../../_core/trpc";
import { getDb } from "../../infra/db";
import { studentProfiles } from "../../../drizzle/schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";

export const professionalsRouter = router({
  // Get all professionals (public)
  list: publicProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }: any) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const professionals = await database
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.isPublic, true))
        .limit(input.limit)
        .offset(input.offset);
      return professionals;
    }),

  // Get professional by ID (public)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }: any) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const professional = await database
        .select()
        .from(studentProfiles)
        .where(
          and(
            eq(studentProfiles.id, input.id),
            eq(studentProfiles.isPublic, true)
          )
        )
        .limit(1);

      if (!professional || professional.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Profissional não encontrado",
        });
      }

      return professional[0];
    }),

  // Create professional (admin only)
  create: protectedProcedure
    .input(
      z.object({
        publicName: z.string().min(3),
        bio: z.string().optional(),
        profileImageUrl: z.string().optional(),
        userId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem criar profissionais",
        });
      }

      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await database.insert(studentProfiles).values({
        userId: input.userId,
        publicName: input.publicName,
        bio: input.bio || "",
        profileImageUrl: input.profileImageUrl || "",
        isPublic: false, // Começa desativado
        score: 0,
        level: "iniciante",
      });

      return { success: true };
    }),

  // Update professional (admin only)
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        publicName: z.string().optional(),
        bio: z.string().optional(),
        profileImageUrl: z.string().optional(),
        isPublic: z.boolean().optional(),
        score: z.number().optional(),
        level: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem atualizar profissionais",
        });
      }

      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { id, ...updateData } = input;

      await database
        .update(studentProfiles)
        .set(updateData)
        .where(eq(studentProfiles.id, id));

      return { id, success: true };
    }),

  // Delete professional (admin only)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem deletar profissionais",
        });
      }

      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await database
        .delete(studentProfiles)
        .where(eq(studentProfiles.id, input.id));

      return { success: true };
    }),

  // Get all professionals for admin (admin only)
  getAllForAdmin: protectedProcedure.query(async ({ ctx }: any) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Apenas administradores podem acessar esta função",
      });
    }

    const database = await getDb();
    if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const professionals = await database
      .select()
      .from(studentProfiles)
      .orderBy(studentProfiles.score);

    return professionals;
  }),

  // Toggle professional status (admin only)
  toggleStatus: protectedProcedure
    .input(z.object({ id: z.number(), active: z.boolean() }))
    .mutation(async ({ input, ctx }: any) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Apenas administradores podem alterar status",
        });
      }

      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await database
        .update(studentProfiles)
        .set({ isPublic: input.active })
        .where(eq(studentProfiles.id, input.id));

      return { success: true };
    }),

  // Update professional profile (user can update their own)
  updateProfile: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        publicName: z.string(),
        phone: z.string(),
        city: z.string(),
        state: z.string(),
        professionalBio: z.string(),
        formation: z.string(),
        linkedin: z.string().optional(),
        instagram: z.string().optional(),
        website: z.string().optional(),
        facebook: z.string().optional(),
        youtube: z.string().optional(),
        otherSocial: z.string().optional(),
        professionalPhone: z.string().optional(),
        professionalEmail: z.string().optional(),
        otherContacts: z.string().optional(),
        profileImageUrl: z.string(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const database = await getDb();
      if (!database) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Check if user already has a profile
      const existingProfile = await database
        .select()
        .from(studentProfiles)
        .where(eq(studentProfiles.userId, ctx.user!.id))
        .limit(1);
      
      if (existingProfile && existingProfile.length > 0) {
        // Update existing profile
        await database
          .update(studentProfiles)
          .set({
            ...input,
            paymentStatus: "pending",
            updatedAt: new Date(),
          })
          .where(eq(studentProfiles.userId, ctx.user!.id));
      } else {
        // Create new profile
        await database.insert(studentProfiles).values({
          userId: ctx.user!.id,
          publicName: input.publicName,
          email: input.email,
          phone: input.phone,
          city: input.city,
          state: input.state,
          professionalBio: input.professionalBio,
          formation: input.formation,
          linkedin: input.linkedin,
          instagram: input.instagram,
          website: input.website,
          facebook: input.facebook,
          youtube: input.youtube,
          otherSocial: input.otherSocial,
          professionalPhone: input.professionalPhone,
          professionalEmail: input.professionalEmail,
          otherContacts: input.otherContacts,
          profileImageUrl: input.profileImageUrl,
          paymentStatus: "pending",
          isPublic: false,
          score: 0,
          level: "iniciante",
        });
      }
      return { success: true };
    }),
});
