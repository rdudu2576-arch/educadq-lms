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
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { getDb } from "../infra/db.js";
import { users } from "../infra/schema.pg.js";
import bcrypt from "bcryptjs";
// ============================================================================
// CONSTANTS
// ============================================================================
var JWT_SECRET = process.env.JWT_SECRET;
var JWT_EXPIRY = "7d";
var BCRYPT_ROUNDS = 10;
var JWT_ALGORITHM = "HS256";
// Validate configuration at module load time
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
}
// ============================================================================
// PASSWORD HASHING
// ============================================================================
/**
 * Hash password with bcrypt
 * @param password - Plain text password
 * @returns Hashed password
 * @throws Error if hashing fails
 */
export function hashPassword(password) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, bcrypt.hash(password, BCRYPT_ROUNDS)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_1 = _a.sent();
                    throw new Error("Failed to hash password: ".concat(error_1 instanceof Error ? error_1.message : "Unknown error"));
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Compare plain text password with hash
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if passwords match, false otherwise
 * @throws Error if comparison fails
 */
export function comparePassword(password, hash) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, bcrypt.compare(password, hash)];
                case 1: return [2 /*return*/, _a.sent()];
                case 2:
                    error_2 = _a.sent();
                    throw new Error("Failed to compare passwords: ".concat(error_2 instanceof Error ? error_2.message : "Unknown error"));
                case 3: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// JWT TOKEN MANAGEMENT
// ============================================================================
/**
 * Generate JWT token
 * @param payload - Token payload
 * @returns Signed JWT token
 * @throws Error if token generation fails
 */
export function generateToken(payload) {
    try {
        return jwt.sign(payload, JWT_SECRET, {
            expiresIn: JWT_EXPIRY,
            algorithm: JWT_ALGORITHM,
        });
    }
    catch (error) {
        throw new Error("Failed to generate token: ".concat(error instanceof Error ? error.message : "Unknown error"));
    }
}
/**
 * Verify JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload if valid, null if invalid
 * @throws Never - returns null on error instead
 */
export function verifyToken(token) {
    try {
        var decoded = jwt.verify(token, JWT_SECRET, {
            algorithms: [JWT_ALGORITHM],
        });
        return decoded;
    }
    catch (error) {
        // Log error but don't throw - authentication is optional for public procedures
        var errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[Auth] Token verification failed: ".concat(errorMessage));
        return null;
    }
}
// ============================================================================
// USER AUTHENTICATION
// ============================================================================
/**
 * Login user with email and password
 * @param email - User email
 * @param password - User password
 * @returns User data and JWT token
 * @throws Error if login fails
 */
export function loginUser(email, password) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result, user, isPasswordValid, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Validate inputs
                    if (!email || !password) {
                        throw new Error("Email and password are required");
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database connection failed");
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(users)
                            .where(eq(users.email, email))
                            .limit(1)];
                case 2:
                    result = _a.sent();
                    user = result[0];
                    // Validate user exists
                    if (!user) {
                        throw new Error("Invalid email or password");
                    }
                    // Validate user has password set
                    if (!user.password) {
                        throw new Error("User account is not properly configured");
                    }
                    return [4 /*yield*/, comparePassword(password, user.password)];
                case 3:
                    isPasswordValid = _a.sent();
                    if (!isPasswordValid) {
                        throw new Error("Invalid email or password");
                    }
                    token = generateToken({
                        id: user.id,
                        email: user.email,
                        role: user.role,
                    });
                    return [2 /*return*/, {
                            user: {
                                id: user.id,
                                email: user.email,
                                name: user.name,
                                role: user.role,
                            },
                            token: token,
                        }];
            }
        });
    });
}
/**
 * Register new user
 * @param email - User email
 * @param password - User password
 * @param name - User name
 * @returns User data and JWT token
 * @throws Error if registration fails
 */
export function registerUser(email, password, name) {
    return __awaiter(this, void 0, void 0, function () {
        var db, existing, hashedPassword, openId, result, newUserResult, newUser, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Validate inputs
                    if (!email || !password || !name) {
                        throw new Error("Email, password, and name are required");
                    }
                    if (password.length < 6) {
                        throw new Error("Password must be at least 6 characters");
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database connection failed");
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(users)
                            .where(eq(users.email, email))
                            .limit(1)];
                case 2:
                    existing = _a.sent();
                    if (existing.length > 0) {
                        throw new Error("User with this email already exists");
                    }
                    return [4 /*yield*/, hashPassword(password)];
                case 3:
                    hashedPassword = _a.sent();
                    openId = "user_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                    return [4 /*yield*/, db.insert(users).values({
                            email: email,
                            password: hashedPassword,
                            name: name,
                            role: "user",
                            openId: openId,
                        })];
                case 4:
                    result = _a.sent();
                    return [4 /*yield*/, db
                            .select()
                            .from(users)
                            .where(eq(users.email, email))
                            .limit(1)];
                case 5:
                    newUserResult = _a.sent();
                    newUser = newUserResult[0];
                    if (!newUser) {
                        throw new Error("Failed to create user");
                    }
                    token = generateToken({
                        id: newUser.id,
                        email: newUser.email,
                        role: newUser.role,
                    });
                    return [2 /*return*/, {
                            user: {
                                id: newUser.id,
                                email: newUser.email,
                                name: newUser.name,
                                role: newUser.role,
                            },
                            token: token,
                        }];
            }
        });
    });
}
// ============================================================================
// USER MANAGEMENT
// ============================================================================
/**
 * Get user by ID
 * @param id - User ID
 * @returns User data or null if not found
 */
export function getUserById(id) {
    return __awaiter(this, void 0, void 0, function () {
        var db, result, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        return [2 /*return*/, null];
                    }
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, db
                            .select()
                            .from(users)
                            .where(eq(users.id, id))
                            .limit(1)];
                case 3:
                    result = _a.sent();
                    return [2 /*return*/, result[0] || null];
                case 4:
                    error_3 = _a.sent();
                    console.error("[Auth] Failed to get user by ID: ".concat(error_3 instanceof Error ? error_3.message : "Unknown error"));
                    return [2 /*return*/, null];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Create admin user (for initialization)
 * @param email - Admin email
 * @param password - Admin password
 * @param name - Admin name
 * @throws Error if creation fails
 */
export function createAdminUser(email_1, password_1) {
    return __awaiter(this, arguments, void 0, function (email, password, name) {
        var db, existing, hashedPassword, openId;
        if (name === void 0) { name = "Administrator"; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Validate inputs
                    if (!email || !password) {
                        throw new Error("Email and password are required");
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database connection failed");
                    }
                    return [4 /*yield*/, db
                            .select()
                            .from(users)
                            .where(eq(users.email, email))
                            .limit(1)];
                case 2:
                    existing = _a.sent();
                    if (existing.length > 0) {
                        console.log("[Auth] Admin user ".concat(email, " already exists"));
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, hashPassword(password)];
                case 3:
                    hashedPassword = _a.sent();
                    openId = "admin_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                    // Create admin user
                    return [4 /*yield*/, db.insert(users).values({
                            email: email,
                            password: hashedPassword,
                            name: name,
                            role: "admin",
                            openId: openId,
                        })];
                case 4:
                    // Create admin user
                    _a.sent();
                    console.log("[Auth] Admin user created: ".concat(email));
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Update user password
 * @param userId - User ID
 * @param newPassword - New password
 * @throws Error if update fails
 */
export function updateUserPassword(userId, newPassword) {
    return __awaiter(this, void 0, void 0, function () {
        var db, hashedPassword;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Validate inputs
                    if (!newPassword || newPassword.length < 6) {
                        throw new Error("Password must be at least 6 characters");
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database connection failed");
                    }
                    return [4 /*yield*/, hashPassword(newPassword)];
                case 2:
                    hashedPassword = _a.sent();
                    // Update user password
                    return [4 /*yield*/, db
                            .update(users)
                            .set({ password: hashedPassword })
                            .where(eq(users.id, userId))];
                case 3:
                    // Update user password
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Update user role (admin only)
 * @param userId - User ID
 * @param newRole - New role
 * @throws Error if update fails
 */
export function updateUserRole(userId, newRole) {
    return __awaiter(this, void 0, void 0, function () {
        var db;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Validate inputs
                    if (!newRole || !["admin", "professor", "user"].includes(newRole)) {
                        throw new Error("Invalid role");
                    }
                    return [4 /*yield*/, getDb()];
                case 1:
                    db = _a.sent();
                    if (!db) {
                        throw new Error("Database connection failed");
                    }
                    // Update user role
                    return [4 /*yield*/, db
                            .update(users)
                            .set({ role: newRole })
                            .where(eq(users.id, userId))];
                case 2:
                    // Update user role
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
