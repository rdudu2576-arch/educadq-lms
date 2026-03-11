var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { AXIOS_TIMEOUT_MS, COOKIE_NAME, ONE_YEAR_MS } from "@shared/const.js";
import { ForbiddenError } from "@shared/_core/errors.js";
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import * as db from "../infra/db.js";
import { ENV } from "./env.js";
// Utility function
var isNonEmptyString = function (value) {
    return typeof value === "string" && value.length > 0;
};
var EXCHANGE_TOKEN_PATH = "/webdev.v1.WebDevAuthPublicService/ExchangeToken";
var GET_USER_INFO_PATH = "/webdev.v1.WebDevAuthPublicService/GetUserInfo";
var GET_USER_INFO_WITH_JWT_PATH = "/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt";
var OAuthService = /** @class */ (function () {
    function OAuthService(client) {
        this.client = client;
        console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
        if (!ENV.oAuthServerUrl) {
            console.error("[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable.");
        }
    }
    OAuthService.prototype.decodeState = function (state) {
        var redirectUri = atob(state);
        return redirectUri;
    };
    OAuthService.prototype.getTokenByCode = function (code, state) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            clientId: ENV.appId,
                            grantType: "authorization_code",
                            code: code,
                            redirectUri: this.decodeState(state),
                        };
                        return [4 /*yield*/, this.client.post(EXCHANGE_TOKEN_PATH, payload)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    OAuthService.prototype.getUserInfoByToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.post(GET_USER_INFO_PATH, {
                            accessToken: token.accessToken,
                        })];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    return OAuthService;
}());
var createOAuthHttpClient = function () {
    return axios.create({
        baseURL: ENV.oAuthServerUrl,
        timeout: AXIOS_TIMEOUT_MS,
    });
};
var SDKServer = /** @class */ (function () {
    function SDKServer(client) {
        if (client === void 0) { client = createOAuthHttpClient(); }
        this.client = client;
        this.oauthService = new OAuthService(this.client);
    }
    SDKServer.prototype.deriveLoginMethod = function (platforms, fallback) {
        if (fallback && fallback.length > 0)
            return fallback;
        if (!Array.isArray(platforms) || platforms.length === 0)
            return null;
        var set = new Set(platforms.filter(function (p) { return typeof p === "string"; }));
        if (set.has("REGISTERED_PLATFORM_EMAIL"))
            return "email";
        if (set.has("REGISTERED_PLATFORM_GOOGLE"))
            return "google";
        if (set.has("REGISTERED_PLATFORM_APPLE"))
            return "apple";
        if (set.has("REGISTERED_PLATFORM_MICROSOFT") ||
            set.has("REGISTERED_PLATFORM_AZURE"))
            return "microsoft";
        if (set.has("REGISTERED_PLATFORM_GITHUB"))
            return "github";
        var first = Array.from(set)[0];
        return first ? first.toLowerCase() : null;
    };
    /**
     * Exchange OAuth authorization code for access token
     * @example
     * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
     */
    SDKServer.prototype.exchangeCodeForToken = function (code, state) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.oauthService.getTokenByCode(code, state)];
            });
        });
    };
    /**
     * Get user information using access token
     * @example
     * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
     */
    SDKServer.prototype.getUserInfo = function (accessToken) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.oauthService.getUserInfoByToken({
                            accessToken: accessToken,
                        })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, __assign({}, data)];
                }
            });
        });
    };
    SDKServer.prototype.parseCookies = function (cookieHeader) {
        if (!cookieHeader) {
            return new Map();
        }
        var parsed = parseCookieHeader(cookieHeader);
        return new Map(Object.entries(parsed));
    };
    SDKServer.prototype.getSessionSecret = function () {
        var secret = ENV.cookieSecret;
        return new TextEncoder().encode(secret);
    };
    /**
     * Create a session token for a Manus user openId
     * @example
     * const sessionToken = await sdk.createSessionToken(userInfo.openId);
     */
    SDKServer.prototype.createSessionToken = function (openId_1) {
        return __awaiter(this, arguments, void 0, function (openId, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.signSession({
                        openId: openId,
                        appId: ENV.appId,
                        name: options.name || "",
                    }, options)];
            });
        });
    };
    SDKServer.prototype.signSession = function (payload_1) {
        return __awaiter(this, arguments, void 0, function (payload, options) {
            var issuedAt, expiresInMs, expirationSeconds, secretKey;
            var _a;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                issuedAt = Date.now();
                expiresInMs = (_a = options.expiresInMs) !== null && _a !== void 0 ? _a : ONE_YEAR_MS;
                expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
                secretKey = this.getSessionSecret();
                return [2 /*return*/, new SignJWT({
                        openId: payload.openId,
                        appId: payload.appId,
                        name: payload.name,
                    })
                        .setProtectedHeader({ alg: "HS256", typ: "JWT" })
                        .setExpirationTime(expirationSeconds)
                        .sign(secretKey)];
            });
        });
    };
    SDKServer.prototype.verifySession = function (cookieValue) {
        return __awaiter(this, void 0, void 0, function () {
            var secretKey, payload, _a, openId, appId, name_1, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!cookieValue) {
                            console.warn("[Auth] Missing session cookie");
                            return [2 /*return*/, null];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        secretKey = this.getSessionSecret();
                        return [4 /*yield*/, jwtVerify(cookieValue, secretKey, {
                                algorithms: ["HS256"],
                            })];
                    case 2:
                        payload = (_b.sent()).payload;
                        _a = payload, openId = _a.openId, appId = _a.appId, name_1 = _a.name;
                        if (!isNonEmptyString(openId) ||
                            !isNonEmptyString(appId) ||
                            !isNonEmptyString(name_1)) {
                            console.warn("[Auth] Session payload missing required fields");
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                openId: openId,
                                appId: appId,
                                name: name_1,
                            }];
                    case 3:
                        error_1 = _b.sent();
                        console.warn("[Auth] Session verification failed", String(error_1));
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SDKServer.prototype.getUserInfoWithJwt = function (jwtToken) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = {
                            jwtToken: jwtToken,
                            projectId: ENV.appId,
                        };
                        return [4 /*yield*/, this.client.post(GET_USER_INFO_WITH_JWT_PATH, payload)];
                    case 1:
                        data = (_a.sent()).data;
                        return [2 /*return*/, __assign({}, data)];
                }
            });
        });
    };
    SDKServer.prototype.authenticateRequest = function (req) {
        return __awaiter(this, void 0, void 0, function () {
            var cookies, sessionCookie, session, sessionUserId, user, userInfo, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        cookies = this.parseCookies(req.headers.cookie);
                        sessionCookie = cookies.get(COOKIE_NAME);
                        return [4 /*yield*/, this.verifySession(sessionCookie)];
                    case 1:
                        session = _b.sent();
                        if (!session) {
                            throw ForbiddenError("Invalid session cookie");
                        }
                        sessionUserId = session.openId;
                        return [4 /*yield*/, db.getUserByOpenId(sessionUserId)];
                    case 2:
                        user = _b.sent();
                        if (!!user) return [3 /*break*/, 8];
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 7, , 8]);
                        return [4 /*yield*/, this.getUserInfoWithJwt(sessionCookie !== null && sessionCookie !== void 0 ? sessionCookie : "")];
                    case 4:
                        userInfo = _b.sent();
                        return [4 /*yield*/, db.upsertUser({
                                openId: userInfo.openId,
                                name: userInfo.name || null,
                                email: (_a = userInfo.email) !== null && _a !== void 0 ? _a : null,
                            })];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, db.getUserByOpenId(userInfo.openId)];
                    case 6:
                        user = _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _b.sent();
                        console.error("[Auth] Failed to sync user from OAuth:", error_2);
                        throw ForbiddenError("Failed to sync user info");
                    case 8:
                        if (!user) {
                            throw ForbiddenError("User not found");
                        }
                        return [4 /*yield*/, db.upsertUser({
                                openId: user.openId,
                            })];
                    case 9:
                        _b.sent();
                        return [2 /*return*/, user];
                }
            });
        });
    };
    return SDKServer;
}());
export var sdk = new SDKServer();
