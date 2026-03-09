import crypto from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const RESET_TOKEN_EXPIRY = "1h";

export interface PasswordResetToken {
  token: string;
  userId: number;
  email: string;
  expiresAt: Date;
  usedAt?: Date;
}

const resetTokens: Map<string, PasswordResetToken> = new Map();

/**
 * Gera um token de reset de senha
 */
export function generatePasswordResetToken(userId: number, email: string): {
  token: string;
  resetUrl: string;
  expiresAt: Date;
} {
  const payload = {
    userId,
    email,
    type: "password-reset",
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: RESET_TOKEN_EXPIRY });

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  const resetToken: PasswordResetToken = {
    token,
    userId,
    email,
    expiresAt,
  };

  resetTokens.set(token, resetToken);

  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  return {
    token,
    resetUrl,
    expiresAt,
  };
}

/**
 * Verifica um token de reset de senha
 */
export function verifyPasswordResetToken(
  token: string
): {
  isValid: boolean;
  userId?: number;
  email?: string;
  message: string;
} {
  try {
    const resetToken = resetTokens.get(token);

    if (!resetToken) {
      return {
        isValid: false,
        message: "Token de reset inválido ou expirado",
      };
    }

    if (resetToken.usedAt) {
      return {
        isValid: false,
        message: "Este token de reset já foi utilizado",
      };
    }

    if (new Date() > resetToken.expiresAt) {
      resetTokens.delete(token);
      return {
        isValid: false,
        message: "Token de reset expirado",
      };
    }

    const payload = jwt.verify(token, JWT_SECRET) as any;

    if (payload.type !== "password-reset") {
      return {
        isValid: false,
        message: "Token inválido",
      };
    }

    return {
      isValid: true,
      userId: payload.userId,
      email: payload.email,
      message: "Token válido",
    };
  } catch (error) {
    return {
      isValid: false,
      message: "Erro ao verificar token",
    };
  }
}

/**
 * Marca um token de reset como utilizado
 */
export function markResetTokenAsUsed(token: string): boolean {
  const resetToken = resetTokens.get(token);
  if (resetToken) {
    resetToken.usedAt = new Date();
    return true;
  }
  return false;
}

/**
 * Limpa tokens de reset expirados
 */
export function cleanupExpiredResetTokens(): number {
  const now = new Date();
  let count = 0;

  resetTokens.forEach((token, key) => {
    if (token.expiresAt < now) {
      resetTokens.delete(key);
      count++;
    }
  });

  return count;
}

/**
 * Obtém informações de um token de reset
 */
export function getResetTokenInfo(token: string): PasswordResetToken | undefined {
  return resetTokens.get(token);
}

/**
 * Gera um código de confirmação por email
 */
export function generateEmailConfirmationCode(email: string): {
  code: string;
  expiresAt: Date;
} {
  const code = crypto.randomBytes(3).toString("hex").toUpperCase();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);

  return {
    code,
    expiresAt,
  };
}

/**
 * Gera um link seguro para reset de senha com hash
 */
export function generateSecureResetLink(
  userId: number,
  email: string,
  baseUrl: string = process.env.FRONTEND_URL || "http://localhost:3000"
): string {
  const { token } = generatePasswordResetToken(userId, email);
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}
