import "dotenv/config";

import { router } from "./trpc.js";
import { createContext } from "./context.js";

/* AUTH */
import { authRouter } from "../domain/users/authRouter.js"
import { deviceAccountsRouter } from "../domain/auth/deviceAccountsRouter.js";
import { passwordResetRouter } from "../domain/auth/passwordResetRouter.js";

/* COURSES */
import { coursesRouter } from "../domain/courses/courses.js";
import { lessonsRouter } from "../domain/courses/lessons.js";
import { progressRouter } from "../domain/courses/progress.js";
import { assessmentsRouter } from "../domain/courses/assessments.js";

/* PAYMENTS */
import { paymentsRouter } from "../domain/payments/payments.js";
import { mercadopagoRouter } from "../domain/payments/mercadopagoRouter.js";
import { webhooksRouter } from "../domain/payments/webhooks.js";

/* CONTENT */
import { articlesRouter } from "../domain/articles/articles.js";
import { pageContentRouter } from "../domain/articles/pageContent.js";
import { contentRouter } from "../domain/content/contentRouter.js";
import { materialsRouter } from "../domain/materials/materialsRouter.js";

/* PROFESSIONALS */
import { professionalsRouter } from "../domain/professionals/professionals.js";
import { rankingRouter } from "../domain/professionals/ranking.js";

/* SYSTEM */
import { systemRouter } from "./systemRouter.js";

/* ADMIN / INFRA */
import { adminRouter } from "../infra/admin.js";
import { professorRouter } from "../infra/professor.js";
import { notificationsRouter } from "../infra/notifications.js";

/* EXTRA */
import { reportsRouter } from "../routers/reports.js";
import { certificatesRouter } from "../routers/certificates.js";
import { gamificationRouter } from "../routers/gamification.js";
import { registrationRouter } from "../domain/registration/registrationRouter.js";

export const appRouter = router({

  /* system */
  system: systemRouter,

  /* auth */
  auth: authRouter,
  deviceAccounts: deviceAccountsRouter,
  passwordReset: passwordResetRouter,

  /* courses */
  courses: coursesRouter,
  lessons: lessonsRouter,
  progress: progressRouter,
  assessments: assessmentsRouter,

  /* payments */
  payments: paymentsRouter,
  mercadopago: mercadopagoRouter,
  webhooks: webhooksRouter,

  /* content */
  articles: articlesRouter,
  pageContent: pageContentRouter,
  content: contentRouter,
  materials: materialsRouter,

  /* professionals */
  professionals: professionalsRouter,
  ranking: rankingRouter,

  /* infra */
  admin: adminRouter,
  professor: professorRouter,
  notifications: notificationsRouter,

  /* extras */
  reports: reportsRouter,
  certificates: certificatesRouter,
  gamification: gamificationRouter,
  registration: registrationRouter

});

export type AppRouter = typeof appRouter;

export { createContext };
