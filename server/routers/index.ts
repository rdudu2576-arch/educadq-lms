import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { authRouter } from "./domain/users/auth";
import { coursesRouter } from "./domain/courses/courses";
import { lessonsRouter } from "./domain/courses/lessons";
import { progressRouter } from "./domain/courses/progress";
import { paymentsRouter } from "./domain/payments/payments";
import { assessmentsRouter } from "./domain/courses/assessments";
import { adminRouter } from "./infra/admin";
import { professorRouter } from "./infra/professor";
import { notificationsRouter } from "./infra/notifications";
// import { advancedRouter } from "./domain/advanced"; // Removido - arquivo não necessário
import { articlesRouter } from "./domain/articles/articles";
import { rankingRouter } from "./domain/professionals/ranking";
import { webhooksRouter } from "./domain/payments/webhooks";
import { reportsRouter } from "./routers/reports";
import { certificatesRouter } from "./routers/certificates";
import { gamificationRouter } from "./routers/gamification";
import { pageContentRouter } from "./domain/articles/pageContent";
import { professionalsRouter } from "./domain/professionals/professionals";
import { mercadopagoRouter } from "./domain/payments/mercadopagoRouter";
import { registrationRouter } from "./domain/registration/registrationRouter";
import { deviceAccountsRouter } from "./domain/auth/deviceAccountsRouter";
import { passwordResetRouter } from "./domain/auth/passwordResetRouter";
import { materialsRouter } from "./domain/materials/materialsRouter";
import { contentRouter } from "./domain/content/contentRouter";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  courses: coursesRouter,
  lessons: lessonsRouter,
  progress: progressRouter,
  payments: paymentsRouter,
  assessments: assessmentsRouter,
  admin: adminRouter,
  professor: professorRouter,
  notifications: notificationsRouter,
  // advanced: advancedRouter, // Removido - arquivo não necessário
  articles: articlesRouter,
  ranking: rankingRouter,
  webhooks: webhooksRouter,
  reports: reportsRouter,
  certificates: certificatesRouter,
  gamification: gamificationRouter,
  pageContent: pageContentRouter,
  professionals: professionalsRouter,
  mercadopago: mercadopagoRouter,
  registration: registrationRouter,
  deviceAccounts: deviceAccountsRouter,
  passwordReset: passwordResetRouter,
  materials: materialsRouter,
  content: contentRouter,
});

export type AppRouter = typeof appRouter;
