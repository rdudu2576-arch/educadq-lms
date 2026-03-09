import { getDb } from "../infra/db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Achievement types and their point values
 */
export const ACHIEVEMENTS = {
  FIRST_COURSE: {
    id: "first_course",
    name: "Primeiro Passo",
    description: "Complete seu primeiro curso",
    icon: "🎓",
    points: 10,
  },
  PERFECT_SCORE: {
    id: "perfect_score",
    name: "Perfeição",
    description: "Obtenha nota 10 em uma avaliação",
    icon: "⭐",
    points: 50,
  },
  FIVE_COURSES: {
    id: "five_courses",
    name: "Aprendiz Dedicado",
    description: "Complete 5 cursos",
    icon: "📚",
    points: 100,
  },
  TEN_COURSES: {
    id: "ten_courses",
    name: "Mestre Estudioso",
    description: "Complete 10 cursos",
    icon: "🏆",
    points: 250,
  },
  STREAK_WEEK: {
    id: "streak_week",
    name: "Consistência",
    description: "Estude 7 dias seguidos",
    icon: "🔥",
    points: 75,
  },
  EARLY_BIRD: {
    id: "early_bird",
    name: "Madrugador",
    description: "Complete uma aula antes das 6am",
    icon: "🌅",
    points: 25,
  },
};

/**
 * Point values for different actions
 */
export const POINT_VALUES = {
  LESSON_COMPLETED: 5,
  ASSESSMENT_PASSED: 10,
  ASSESSMENT_PERFECT: 25,
  COURSE_COMPLETED: 50,
  COMMENT_POSTED: 2,
  MATERIAL_DOWNLOADED: 1,
};

/**
 * Award points to a user for an action
 */
export async function awardPoints(userId: number, action: keyof typeof POINT_VALUES, multiplier = 1): Promise<number> {
  const database = await getDb();
  if (!database) throw new Error("Database connection failed");

  const points = POINT_VALUES[action] * multiplier;

  // Get current user points
  const user = await database
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .then((rows: any) => rows[0]);

  if (!user) throw new Error("User not found");

  const currentPoints = user.points || 0;
  const newPoints = currentPoints + points;

  // In production, update user points in a separate points table
  // For now, we'll just return the calculated points
  // await database.update(users).set({ points: newPoints }).where(eq(users.id, userId));

  return newPoints;
}

/**
 * Check if user has earned an achievement
 */
export async function checkAndAwardAchievement(
  userId: number,
  achievementId: string,
  metadata: Record<string, any> = {}
): Promise<boolean> {
  const database = await getDb();
  if (!database) throw new Error("Database connection failed");

  const achievement = Object.values(ACHIEVEMENTS).find((a) => a.id === achievementId);
  if (!achievement) return false;

  // Get user
  const user = await database
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .then((rows: any) => rows[0]);

  if (!user) return false;

  // Check if user already has this achievement
  // In production, query from user_achievements table
  // For now, we'll just award points

  // Award achievement points
  // In production, update user points in a separate points table
  // const newPoints = (user.points || 0) + achievement.points;
  // await database.update(users).set({ points: newPoints }).where(eq(users.id, userId));

  return true;
}

/**
 * Get user's current level based on points
 */
export function getUserLevel(points: number): { level: number; name: string; nextLevelPoints: number } {
  const levels = [
    { level: 1, name: "Iniciante", minPoints: 0 },
    { level: 2, name: "Aprendiz", minPoints: 100 },
    { level: 3, name: "Estudioso", minPoints: 250 },
    { level: 4, name: "Especialista", minPoints: 500 },
    { level: 5, name: "Mestre", minPoints: 1000 },
    { level: 6, name: "Lenda", minPoints: 2000 },
  ];

  let currentLevel = levels[0];
  for (const level of levels) {
    if (points >= level.minPoints) {
      currentLevel = level;
    }
  }

  const nextLevel = levels.find((l) => l.minPoints > currentLevel.minPoints);
  const nextLevelPoints = nextLevel ? nextLevel.minPoints : currentLevel.minPoints + 1000;

  return {
    level: currentLevel.level,
    name: currentLevel.name,
    nextLevelPoints,
  };
}

/**
 * Get user's progress to next level
 */
export function getLevelProgress(points: number): { current: number; next: number; percentage: number } {
  const currentLevel = getUserLevel(points);
  const levels = [
    { level: 1, minPoints: 0 },
    { level: 2, minPoints: 100 },
    { level: 3, minPoints: 250 },
    { level: 4, minPoints: 500 },
    { level: 5, minPoints: 1000 },
    { level: 6, minPoints: 2000 },
  ];

  const currentLevelObj = levels.find((l) => l.level === currentLevel.level);
  const nextLevelObj = levels.find((l) => l.level === currentLevel.level + 1);

  if (!currentLevelObj || !nextLevelObj) {
    return { current: points, next: points, percentage: 100 };
  }

  const pointsInLevel = points - currentLevelObj.minPoints;
  const pointsNeeded = nextLevelObj.minPoints - currentLevelObj.minPoints;
  const percentage = Math.round((pointsInLevel / pointsNeeded) * 100);

  return {
    current: pointsInLevel,
    next: pointsNeeded,
    percentage: Math.min(percentage, 100),
  };
}
