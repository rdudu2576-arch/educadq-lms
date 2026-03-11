import zxcvbn from "zxcvbn";
/**
 * Valida a força de uma senha usando zxcvbn
 * Score: 0-4 (0=muito fraca, 4=muito forte)
 * Mínimo aceitável: score 2 (fair)
 */
export function validatePasswordStrength(password, userInputs) {
    var _a;
    if (userInputs === void 0) { userInputs = []; }
    if (!password || password.length < 8) {
        return {
            score: 0,
            feedback: "Senha deve ter pelo menos 8 caracteres",
            suggestions: ["Use uma senha com pelo menos 8 caracteres"],
            isValid: false,
        };
    }
    var result = zxcvbn(password, userInputs);
    var scoreLabels = ["Muito Fraca", "Fraca", "Aceitável", "Boa", "Muito Forte"];
    var feedbackMap = {
        0: "Sua senha é muito fraca e fácil de adivinhar",
        1: "Sua senha é fraca. Adicione mais caracteres variados",
        2: "Sua senha é aceitável, mas pode ser mais forte",
        3: "Sua senha é boa",
        4: "Sua senha é muito forte",
    };
    return {
        score: result.score,
        feedback: feedbackMap[result.score],
        suggestions: ((_a = result.feedback) === null || _a === void 0 ? void 0 : _a.suggestions) || [],
        isValid: result.score >= 2, // Mínimo: score 2 (fair)
    };
}
/**
 * Verifica se a senha atende aos requisitos mínimos
 */
export function meetsPasswordRequirements(password) {
    return {
        hasMinLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChars: /[@$!%*?&]/.test(password),
        allMet: password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /\d/.test(password) &&
            /[@$!%*?&]/.test(password),
    };
}
/**
 * Gera uma sugestão de senha forte
 */
export function generateStrongPassword(length) {
    if (length === void 0) { length = 16; }
    var uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var lowercase = "abcdefghijklmnopqrstuvwxyz";
    var numbers = "0123456789";
    var special = "@$!%*?&";
    var all = uppercase + lowercase + numbers + special;
    var password = "";
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    for (var i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }
    return password
        .split("")
        .sort(function () { return Math.random() - 0.5; })
        .join("");
}
