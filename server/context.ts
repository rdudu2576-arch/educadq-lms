import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

export async function createContext({ req }: CreateNextContextOptions) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { user: null };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    return {
      user: decoded,
    };
  } catch (error) {
    return { user: null };
  }
}

export type TrpcContext = Awaited<ReturnType<typeof createContext>>;
