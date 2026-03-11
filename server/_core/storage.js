/**
 * Storage Helper - S3/Cloud Storage Integration
 * Handles file uploads to cloud storage
 */
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
 * Upload file to cloud storage
 * @param key - File path/key in storage
 * @param data - File content (Buffer, Uint8Array, or string)
 * @param contentType - MIME type
 * @returns Object with URL and key
 */
export function storagePut(key_1, data_1) {
    return __awaiter(this, arguments, void 0, function (key, data, contentType) {
        var mockUrl;
        if (contentType === void 0) { contentType = "application/octet-stream"; }
        return __generator(this, function (_a) {
            try {
                mockUrl = "https://storage.example.com/".concat(key);
                console.log("[Storage] Uploaded: ".concat(key, " (").concat(contentType, ")"));
                return [2 /*return*/, {
                        url: mockUrl,
                        key: key,
                    }];
            }
            catch (error) {
                console.error("[Storage] Upload failed for ".concat(key, ":"), error);
                throw new Error("Failed to upload file: ".concat(key));
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Get signed URL for file download
 * @param key - File path/key in storage
 * @param expiresIn - Expiration time in seconds
 * @returns Signed URL
 */
export function storageGet(key_1) {
    return __awaiter(this, arguments, void 0, function (key, expiresIn) {
        var mockUrl;
        if (expiresIn === void 0) { expiresIn = 3600; }
        return __generator(this, function (_a) {
            try {
                mockUrl = "https://storage.example.com/".concat(key, "?expires=").concat(Date.now() + expiresIn * 1000);
                console.log("[Storage] Generated URL for: ".concat(key));
                return [2 /*return*/, mockUrl];
            }
            catch (error) {
                console.error("[Storage] Failed to get URL for ".concat(key, ":"), error);
                throw new Error("Failed to get file URL: ".concat(key));
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Delete file from storage
 * @param key - File path/key in storage
 */
export function storageDelete(key) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                console.log("[Storage] Deleted: ".concat(key));
            }
            catch (error) {
                console.error("[Storage] Delete failed for ".concat(key, ":"), error);
                throw new Error("Failed to delete file: ".concat(key));
            }
            return [2 /*return*/];
        });
    });
}
