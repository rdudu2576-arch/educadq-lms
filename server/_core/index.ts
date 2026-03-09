import "dotenv/config";
import { router } from "./trpc.js";
import { authRouter } from "../domain/users/auth.js";
import { coursesRouter } from "../domain/courses/courses.js";
import { lessonsRouter } from "../domain/courses/lessons.js";
import { progressRouter } from "../domain/courses/progress.js";
import { paymentsRouter } from "../domain/payments/payments.js";
import { assessmentsRouter } from "../domain/courses/assessments.js";
import { adminRouter } from "../infra/admin.js";
import { professorRouter } from "../infra/professor.js";
import { notificationsRouter } from "../infra/notifications.js";
import { articlesRouter } from "../domain/articles/articles.js";
import { rankingRouter } from "../domain/professionals/ranking.js";
import { webhooksRouter } from "../domain/payments/webhooks.js";
import { reportsRouter } from "../routers/reports.js";
import { certificatesRouter } from "../routers/certificates.js";
import { gamificationRouter } from "../routers/gamification.js";
import { pageContentRouter } from "../domain/articles/pageContent.js";
import { professionalsRouter } from "../domain/professionals/professionals.js";
import { mercadopagoRouter } from "../domain/payments/mercadopagoRouter.js";
import { registrationRouter } from "../domain/registration/registrationRouter.js";
import { deviceAccountsRouter } from "../domain/auth/deviceAccountsRouter.js";
import { passwordResetRouter } from "../domain/auth/passwordResetRouter.js";
import { materialsRouter } from "../domain/materials/materialsRouter.js";
import { contentRouter } from "../domain/content/contentRouter.js";
import { systemRouter } from "./systemRouter.js";

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

export { createContext } from './context.js';
