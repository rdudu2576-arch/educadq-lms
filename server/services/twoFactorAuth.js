var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import speakeasy from "speakeasy";
import QRCode from "qrcode";
/**
 * Gera um novo segredo para 2FA e código QR
 */
export function generateTwoFactorSecret(email_1) {
    return __awaiter(this, arguments, void 0, function (email, appName) {
        var secret, qrCode, backupCodes;
        if (appName === void 0) { appName = "EducaDQ"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    secret = speakeasy.generateSecret({
                        name: "".concat(appName, " (").concat(email, ")"),
                        issuer: appName,
                        length: 32,
                    });
                    if (!secret.otpauth_url) {
                        throw new Error("Falha ao gerar segredo 2FA");
                    }
                    return [4 /*yield*/, QRCode.toDataURL(secret.otpauth_url)];
                case 1:
                    qrCode = _a.sent();
                    backupCodes = generateBackupCodes(10);
                    return [2 /*return*/, {
                            secret: secret.base32,
                            qrCode: qrCode,
                            backupCodes: backupCodes,
                        }];
            }
        });
    });
}
/**
 * Verifica um token TOTP
 */
export function verifyTOTPToken(secret, token) {
    try {
        var isValid = speakeasy.totp.verify({
            secret: secret,
            encoding: "base32",
            token: token,
            window: 2,
        });
        return {
            isValid: !!isValid,
            message: isValid ? "Token válido" : "Token inválido",
        };
    }
    catch (error) {
        return {
            isValid: false,
            message: "Erro ao verificar token",
        };
    }
}
/**
 * Verifica um código de backup
 */
export function verifyBackupCode(backupCodes, code) {
    return backupCodes.includes(code);
}
/**
 * Remove um código de backup da lista
 */
export function removeBackupCode(backupCodes, code) {
    return backupCodes.filter(function (c) { return c !== code; });
}
/**
 * Gera novos códigos de backup
 */
export function generateBackupCodes(count) {
    if (count === void 0) { count = 10; }
    var codes = [];
    for (var i = 0; i < count; i++) {
        var code = Math.random().toString(36).substring(2, 10).toUpperCase();
        codes.push(code);
    }
    return codes;
}
/**
 * Formata código de backup para exibição
 */
export function formatBackupCode(code) {
    return code.replace(/(.{4})/g, "$1 ").trim();
}
/**
 * Gera um token TOTP para teste
 */
export function generateTOTPToken(secret) {
    return speakeasy.totp({
        secret: secret,
        encoding: "base32",
    });
}
