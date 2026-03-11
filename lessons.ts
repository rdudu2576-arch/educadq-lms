    .input(z.object({ courseId: z.number() }))
    .query(async ({ input }) => {
      return await getLessonsByCourse(input.courseId);
    }),

  getByModule: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      return await getLessonsByModule(input.moduleId);
    }),

  getById: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input }) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) throw new TRPCError({ code: "NOT_FOUND", message: "Aula nao encontrada" });
      const materials = await getMaterialsByLesson(input.lessonId);
      return { ...lesson, materials };
    }),

  create: protectedProcedure
    .input(z.object({
      moduleId: z.number(),