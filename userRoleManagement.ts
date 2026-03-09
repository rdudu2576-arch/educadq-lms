import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { users } from "../../drizzle/schema";

export type UserRole = "admin" | "professor" | "user";

export interface UserRoleUpdate {
  userId: number;
  newRole: UserRole;
  reason?: string;
  changedBy: number;
}

export interface RoleAuditLog {
  id?: number;
  userId: number;
  oldRole: UserRole;
  newRole: UserRole;
  reason?: string;
  changedBy: number;
  changedAt?: Date;
}

/**
 * Obter usuário com informações completas
 */
export async function getUserWithRole(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[DB] Error getting user with role:", error);
    return null;
  }
}

/**
 * Listar todos os usuários com seus papéis
 */
export async function listAllUsers(filters?: {
  role?: UserRole;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(users);

    // Aplicar filtros
    if (filters?.role) {
      query = query.where(eq(users.role, filters.role));
    }

    // Buscar por nome ou email
    if (filters?.search) {
      // Implementar busca por nome ou email
      // query = query.where(
      //   or(
      //     like(users.name, `%${filters.search}%`),
      //     like(users.email, `%${filters.search}%`)
      //   )
      // );
    }

    // Aplicar limit e offset
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    query = query.limit(limit).offset(offset);

    const result = await query;
    return result;
  } catch (error) {
    console.error("[DB] Error listing users:", error);
    return [];
  }
}

/**
 * Contar total de usuários
 */
export async function countUsers(role?: UserRole): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    let query = db.select().from(users);

    if (role) {
      query = query.where(eq(users.role, role));
    }

    const result = await query;
    return result.length;
  } catch (error) {
    console.error("[DB] Error counting users:", error);
    return 0;
  }
}

/**
 * Atualizar papel do usuário
 */
export async function updateUserRole(update: UserRoleUpdate): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Buscar usuário atual
    const user = await getUserWithRole(update.userId);
    if (!user) {
      throw new Error(`User ${update.userId} not found`);
    }

    // Validar mudança de papel
    if (user.role === update.newRole) {
      console.log(`[DB] User ${update.userId} already has role ${update.newRole}`);
      return false;
    }

    // Atualizar papel
    await db
      .update(users)
      .set({
        role: update.newRole,
        updatedAt: new Date(),
      })
      .where(eq(users.id, update.userId));

    // Registrar em auditoria
    await logRoleChange({
      userId: update.userId,
      oldRole: user.role as UserRole,
      newRole: update.newRole,
      reason: update.reason,
      changedBy: update.changedBy,
    });

    console.log(
      `[DB] User ${update.userId} role changed from ${user.role} to ${update.newRole}`
    );

    return true;
  } catch (error) {
    console.error("[DB] Error updating user role:", error);
    return false;
  }
}

/**
 * Registrar mudança de papel em auditoria
 */
export async function logRoleChange(log: RoleAuditLog): Promise<void> {
  try {
    // Implementar logging em banco de dados
    // await db.insert(roleAuditLogs).values({
    //   userId: log.userId,
    //   oldRole: log.oldRole,
    //   newRole: log.newRole,
    //   reason: log.reason,
    //   changedBy: log.changedBy,
    //   changedAt: new Date(),
    // });

    console.log(
      `[Audit] Role change: User ${log.userId} - ${log.oldRole} -> ${log.newRole} by ${log.changedBy}`
    );
  } catch (error) {
    console.error("[DB] Error logging role change:", error);
  }
}

/**
 * Obter histórico de mudanças de papel
 */
export async function getRoleChangeHistory(userId: number): Promise<RoleAuditLog[]> {
  try {
    // Implementar busca em banco de dados
    // const result = await db
    //   .select()
    //   .from(roleAuditLogs)
    //   .where(eq(roleAuditLogs.userId, userId))
    //   .orderBy(desc(roleAuditLogs.changedAt));

    // return result;

    return [];
  } catch (error) {
    console.error("[DB] Error getting role change history:", error);
    return [];
  }
}

/**
 * Obter estatísticas de usuários por papel
 */
export async function getUserStatsByRole(): Promise<Record<UserRole, number>> {
  try {
    const admins = await countUsers("admin");
    const professors = await countUsers("professor");
    const students = await countUsers("user");

    return {
      admin: admins,
      professor: professors,
      user: students,
    };
  } catch (error) {
    console.error("[DB] Error getting user stats:", error);
    return {
      admin: 0,
      professor: 0,
      user: 0,
    };
  }
}

/**
 * Promover usuário para admin
 */
export async function promoteToAdmin(userId: number, changedBy: number): Promise<boolean> {
  return updateUserRole({
    userId,
    newRole: "admin",
    reason: "Promoted to admin",
    changedBy,
  });
}

/**
 * Rebaixar admin para professor
 */
export async function demoteAdminToProfessor(
  userId: number,
  changedBy: number
): Promise<boolean> {
  return updateUserRole({
    userId,
    newRole: "professor",
    reason: "Demoted from admin to professor",
    changedBy,
  });
}

/**
 * Rebaixar professor para aluno
 */
export async function demoteProfessorToStudent(
  userId: number,
  changedBy: number
): Promise<boolean> {
  return updateUserRole({
    userId,
    newRole: "user",
    reason: "Demoted from professor to student",
    changedBy,
  });
}

/**
 * Verificar se usuário pode fazer mudança de papel
 */
export function canChangeRole(
  currentUserRole: UserRole,
  targetUserRole: UserRole,
  newRole: UserRole
): boolean {
  // Apenas admins podem mudar papéis
  if (currentUserRole !== "admin") {
    return false;
  }

  // Admin não pode rebaixar outro admin
  if (targetUserRole === "admin" && newRole !== "admin") {
    return false;
  }

  // Admin não pode promover alguém a admin (apenas outro admin pode)
  if (newRole === "admin" && targetUserRole !== "admin") {
    // Permitir apenas se for um admin fazendo a mudança
    return true;
  }

  return true;
}

/**
 * Obter permissões do papel
 */
export function getRolePermissions(role: UserRole): string[] {
  const permissions: Record<UserRole, string[]> = {
    admin: [
      "manage_users",
      "manage_courses",
      "manage_professors",
      "view_reports",
      "manage_payments",
      "manage_settings",
      "view_analytics",
      "manage_roles",
    ],
    professor: [
      "create_courses",
      "edit_own_courses",
      "view_students",
      "grade_assignments",
      "view_reports",
      "view_analytics",
    ],
    user: [
      "view_courses",
      "submit_assignments",
      "view_grades",
      "download_materials",
      "view_progress",
    ],
  };

  return permissions[role] || [];
}

/**
 * Verificar se usuário tem permissão
 */
export function hasPermission(role: UserRole, permission: string): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}
