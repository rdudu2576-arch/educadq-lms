        });
      }
    }),

  // Validate reset token
  validateToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not connected");

        const resetToken = await db
          .select()
          .from(passwordResetTokens)
          .where(
            and(
              eq(passwordResetTokens.token, input.token),
              eq(passwordResetTokens.used, false),
              gt(passwordResetTokens.expiresAt, new Date())
            )
          )
          .limit(1);

        if (resetToken.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired reset token",
          });
        }

        return { valid: true, token: input.token };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to validate reset token",
        });
      }
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8),
      })
    )
    .mutation(async ({ input }) => {