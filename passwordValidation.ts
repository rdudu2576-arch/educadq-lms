import zxcvbn from "zxcvbn";

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4; // 0=very weak, 1=weak, 2=fair, 3=good, 4=strong
  feedback: string;
  suggestions: string[];
  isValid: boolean;
}

/**
 * Valida a força de uma senha usando zxcvbn
 * Score: 0-4 (0=muito fraca, 4=muito forte)
 * Mínimo aceitável: score 2 (fair)
 */
export function validatePasswordStrength(password: string, userInputs: string[] = []): PasswordStrengthResult {
  if (!password || password.length < 8) {
    return {
      score: 0,
      feedback: "Senha deve ter pelo menos 8 caracteres",
      suggestions: ["Use uma senha com pelo menos 8 caracteres"],
      isValid: false,
    };
  }

  const result = zxcvbn(password, userInputs);
  const scoreLabels = ["Muito Fraca", "Fraca", "Aceitável", "Boa", "Muito Forte"];
  const feedbackMap = {
    0: "Sua senha é muito fraca e fácil de adivinhar",
    1: "Sua senha é fraca. Adicione mais caracteres variados",
    2: "Sua senha é aceitável, mas pode ser mais forte",
    3: "Sua senha é boa",
    4: "Sua senha é muito forte",
  };

  return {
    score: result.score,
    feedback: feedbackMap[result.score as keyof typeof feedbackMap],
    suggestions: result.feedback?.suggestions || [],
    isValid: result.score >= 2, // Mínimo: score 2 (fair)
  };
}

/**
 * Verifica se a senha atende aos requisitos mínimos
 */
export function meetsPasswordRequirements(password: string): {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumbers: boolean;
  hasSpecialChars: boolean;
  allMet: boolean;
} {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[@$!%*?&]/.test(password),
    allMet:
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&]/.test(password),
  };
}

/**
 * Gera uma sugestão de senha forte
 */
export function generateStrongPassword(length: number = 16): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "@$!%*?&";
  const all = uppercase + lowercase + numbers + special;

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
