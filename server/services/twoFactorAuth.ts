import speakeasy from "speakeasy";
import QRCode from "qrcode";

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TwoFactorVerification {
  isValid: boolean;
  message: string;
}

/**
 * Gera um novo segredo para 2FA e código QR
 */
export async function generateTwoFactorSecret(email: string, appName: string = "EducaDQ"): Promise<TwoFactorSetup> {
  const secret = speakeasy.generateSecret({
    name: `${appName} (${email})`,
    issuer: appName,
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new Error("Falha ao gerar segredo 2FA");
  }

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  const backupCodes = generateBackupCodes(10);

  return {
    secret: secret.base32,
    qrCode,
    backupCodes,
  };
}

/**
 * Verifica um token TOTP
 */
export function verifyTOTPToken(secret: string, token: string): TwoFactorVerification {
  try {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2,
    });

    return {
      isValid: !!isValid,
      message: isValid ? "Token válido" : "Token inválido",
    };
  } catch (error) {
    return {
      isValid: false,
      message: "Erro ao verificar token",
    };
  }
}

/**
 * Verifica um código de backup
 */
export function verifyBackupCode(backupCodes: string[], code: string): boolean {
  return backupCodes.includes(code);
}

/**
 * Remove um código de backup da lista
 */
export function removeBackupCode(backupCodes: string[], code: string): string[] {
  return backupCodes.filter((c) => c !== code);
}

/**
 * Gera novos códigos de backup
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Formata código de backup para exibição
 */
export function formatBackupCode(code: string): string {
  return code.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Gera um token TOTP para teste
 */
export function generateTOTPToken(secret: string): string {
  return speakeasy.totp({
    secret,
    encoding: "base32",
  });
}
