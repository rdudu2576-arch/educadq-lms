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
/**
 * Password Service
 * Handles password hashing and verification using bcryptjs
 */
import bcrypt from "bcryptjs";
import crypto from "crypto";
var SALT_ROUNDS = 10;
/**
 * Hash a password using bcrypt
 */
export function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, bcrypt.hash(password, SALT_ROUNDS)];
        });
    });
}
/**
 * Verify a password against a bcrypt hash
 */
export function verifyPassword(password, hash) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, bcrypt.compare(password, hash)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_1 = _a.sent();
                    console.error("[Password] Error verifying password:", error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generate a random password
 */
export function generateRandomPassword(length) {
    if (length === void 0) { length = 16; }
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    var password = "";
    for (var i = 0; i < length; i++) {
        password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
}
/**
 * Check password strength
 */
export function checkPasswordStrength(password) {
    var feedback = [];
    var score = 0;
    if (password.length >= 8) {
        score += 20;
    }
    else {
        feedback.push("Senha deve ter pelo menos 8 caracteres");
    }
    if (password.length >= 12) {
        score += 10;
    }
    if (/[a-z]/.test(password)) {
        score += 15;
    }
    else {
        feedback.push("Inclua letras minúsculas");
    }
    if (/[A-Z]/.test(password)) {
        score += 15;
    }
    else {
        feedback.push("Inclua letras maiúsculas");
    }
    if (/[0-9]/.test(password)) {
        score += 15;
    }
    else {
        feedback.push("Inclua números");
    }
    if (/[!@#$%^&*]/.test(password)) {
        score += 15;
    }
    else {
        feedback.push("Inclua caracteres especiais");
    }
    if (password.length >= 16) {
        score += 10;
    }
    return {
        score: Math.min(100, score),
        feedback: feedback,
    };
}
/**
 * Generate a password reset token
 */
export function generateResetToken() {
    return crypto.randomBytes(32).toString("hex");
}
/**
 * Verify reset token (tokens expire after 1 hour)
 */
export function verifyResetToken(token, storedToken, createdAt) {
    var now = new Date();
    var expiryTime = new Date(createdAt.getTime() + 60 * 60 * 1000); // 1 hour
    return token === storedToken && now < expiryTime;
}
