import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc.js";
import { awardPoints, checkAndAwardAchievement, getUserLevel, getLevelProgress, ACHIEVEMENTS } from "../services/gamificationService.js";
import { getDb } from "../infra/db.js";
import { users } from "../../infra/schema.js";
import { eq } from "drizzle-orm";

export const gamificationRouter = router({
  /**
   * Get user's current points and level
   */
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const database = await getDb();
    if (!database) throw new Error("Database connection failed");

    const user = await database
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .then((rows: any) => rows[0]);

    if (!user) throw new Error("User not found");

    // For now, use a mock points system
    const points = Math.floor(Math.random() * 5000);
    const level = getUserLevel(points);
    const progress = getLevelProgress(points);

    return {
      userId: ctx.user.id,
      points,
      level: level.level,
      levelName: level.name,
      nextLevelPoints: level.nextLevelPoints,
      progress: {
        current: progress.current,
        next: progress.next,
        percentage: progress.percentage,
      },
    };
  }),

  /**
   * Get global leaderboard
   */
  getLeaderboard: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const database = await getDb();
      if (!database) throw new Error("Database connection failed");

      // Get all users and sort by points (mock data for now)
      const allUsers = await database
        .select()
        .from(users)
        .then((rows: any) => rows);

      // Add mock points to each user
      const usersWithPoints = allUsers.map((user: any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        points: Math.floor(Math.random() * 5000),
      }));

      // Sort by points descending
      usersWithPoints.sort((a: any, b: any) => b.points - a.points);

      // Apply pagination
      const leaderboard = usersWithPoints.slice(input.offset, input.offset + input.limit);

      // Add rank to each user
      const ranked = leaderboard.map((user: any, index: number) => ({
        ...user,
        rank: input.offset + index + 1,
        level: getUserLevel(user.points).level,
        levelName: getUserLevel(user.points).name,
      }));

      return {
        leaderboard: ranked,
        total: usersWithPoints.length,
        offset: input.offset,
        limit: input.limit,
      };
    }),

  /**
   * Get user's achievements
   */
  getUserAchievements: protectedProcedure.query(async ({ ctx }) => {
    // Return all available achievements with mock earned status
    const achievements = Object.values(ACHIEVEMENTS).map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      points: achievement.points,
      earned: Math.random() > 0.5, // Mock earned status
      earnedAt: new Date(),
    }));

    return achievements;
  }),

  /**
   * Award points for an action
   */
  awardPointsForAction: protectedProcedure
    .input(
      z.object({
        action: z.enum([
          "LESSON_COMPLETED",
          "ASSESSMENT_PASSED",
          "ASSESSMENT_PERFECT",
          "COURSE_COMPLETED",
          "COMMENT_POSTED",
          "MATERIAL_DOWNLOADED",
        ]),
        multiplier: z.number().min(1).max(10).default(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const newPoints = await awardPoints(ctx.user.id, input.action as any, input.multiplier);
        return {
          success: true,
          newPoints,
          level: getUserLevel(newPoints),
        };
      } catch (error) {
        throw new Error("Failed to award points");
      }
    }),

  /**
   * Check and award achievement
   */
  checkAchievement: protectedProcedure
    .input(
      z.object({
        achievementId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const awarded = await checkAndAwardAchievement(ctx.user.id, input.achievementId);
        return {
          success: awarded,
          achievement: ACHIEVEMENTS[input.achievementId as keyof typeof ACHIEVEMENTS] || null,
        };
      } catch (error) {
        throw new Error("Failed to check achievement");
      }
    }),

  /**
   * Get top achievements
   */
  getTopAchievements: publicProcedure.query(async () => {
    return Object.values(ACHIEVEMENTS).sort((a, b) => b.points - a.points);
  }),
});
