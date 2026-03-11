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
 * Voice transcription helper using internal Speech-to-Text service
 *
 * Frontend implementation guide:
 * 1. Capture audio using MediaRecorder API
 * 2. Upload audio to storage (e.g., S3) to get URL
 * 3. Call transcription with the URL
 *
 * Example usage:
 * ```tsx
 * // Frontend component
 * const transcribeMutation = trpc.voice.transcribe.useMutation({
 *   onSuccess: (data) => {
 *     console.log(data.text); // Full transcription
 *     console.log(data.language); // Detected language
 *     console.log(data.segments); // Timestamped segments
 *   }
 * });
 *
 * // After uploading audio to storage
 * transcribeMutation.mutate({
 *   audioUrl: uploadedAudioUrl,
 *   language: 'en', // optional
 *   prompt: 'Transcribe the meeting' // optional
 * });
 * ```
 */
import { ENV } from "./env.js";
/**
 * Transcribe audio to text using the internal Speech-to-Text service
 *
 * @param options - Audio data and metadata
 * @returns Transcription result or error
 */
export function transcribeAudio(options) {
    return __awaiter(this, void 0, void 0, function () {
        var audioBuffer, mimeType, response_1, _a, _b, sizeMB, error_1, formData, filename, audioBlob, prompt_1, baseUrl, fullUrl, response, errorText, whisperResponse, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 10, , 11]);
                    // Step 1: Validate environment configuration
                    if (!ENV.forgeApiUrl) {
                        return [2 /*return*/, {
                                error: "Voice transcription service is not configured",
                                code: "SERVICE_ERROR",
                                details: "BUILT_IN_FORGE_API_URL is not set"
                            }];
                    }
                    if (!ENV.forgeApiKey) {
                        return [2 /*return*/, {
                                error: "Voice transcription service authentication is missing",
                                code: "SERVICE_ERROR",
                                details: "BUILT_IN_FORGE_API_KEY is not set"
                            }];
                    }
                    audioBuffer = void 0;
                    mimeType = void 0;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(options.audioUrl)];
                case 2:
                    response_1 = _c.sent();
                    if (!response_1.ok) {
                        return [2 /*return*/, {
                                error: "Failed to download audio file",
                                code: "INVALID_FORMAT",
                                details: "HTTP ".concat(response_1.status, ": ").concat(response_1.statusText)
                            }];
                    }
                    _b = (_a = Buffer).from;
                    return [4 /*yield*/, response_1.arrayBuffer()];
                case 3:
                    audioBuffer = _b.apply(_a, [_c.sent()]);
                    mimeType = response_1.headers.get('content-type') || 'audio/mpeg';
                    sizeMB = audioBuffer.length / (1024 * 1024);
                    if (sizeMB > 16) {
                        return [2 /*return*/, {
                                error: "Audio file exceeds maximum size limit",
                                code: "FILE_TOO_LARGE",
                                details: "File size is ".concat(sizeMB.toFixed(2), "MB, maximum allowed is 16MB")
                            }];
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _c.sent();
                    return [2 /*return*/, {
                            error: "Failed to fetch audio file",
                            code: "SERVICE_ERROR",
                            details: error_1 instanceof Error ? error_1.message : "Unknown error"
                        }];
                case 5:
                    formData = new FormData();
                    filename = "audio.".concat(getFileExtension(mimeType));
                    audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
                    formData.append("file", audioBlob, filename);
                    formData.append("model", "whisper-1");
                    formData.append("response_format", "verbose_json");
                    prompt_1 = options.prompt || (options.language
                        ? "Transcribe the user's voice to text, the user's working language is ".concat(getLanguageName(options.language))
                        : "Transcribe the user's voice to text");
                    formData.append("prompt", prompt_1);
                    baseUrl = ENV.forgeApiUrl.endsWith("/")
                        ? ENV.forgeApiUrl
                        : "".concat(ENV.forgeApiUrl, "/");
                    fullUrl = new URL("v1/audio/transcriptions", baseUrl).toString();
                    return [4 /*yield*/, fetch(fullUrl, {
                            method: "POST",
                            headers: {
                                authorization: "Bearer ".concat(ENV.forgeApiKey),
                                "Accept-Encoding": "identity",
                            },
                            body: formData,
                        })];
                case 6:
                    response = _c.sent();
                    if (!!response.ok) return [3 /*break*/, 8];
                    return [4 /*yield*/, response.text().catch(function () { return ""; })];
                case 7:
                    errorText = _c.sent();
                    return [2 /*return*/, {
                            error: "Transcription service request failed",
                            code: "TRANSCRIPTION_FAILED",
                            details: "".concat(response.status, " ").concat(response.statusText).concat(errorText ? ": ".concat(errorText) : "")
                        }];
                case 8: return [4 /*yield*/, response.json()];
                case 9:
                    whisperResponse = _c.sent();
                    // Validate response structure
                    if (!whisperResponse.text || typeof whisperResponse.text !== 'string') {
                        return [2 /*return*/, {
                                error: "Invalid transcription response",
                                code: "SERVICE_ERROR",
                                details: "Transcription service returned an invalid response format"
                            }];
                    }
                    return [2 /*return*/, whisperResponse]; // Return native Whisper API response directly
                case 10:
                    error_2 = _c.sent();
                    // Handle unexpected errors
                    return [2 /*return*/, {
                            error: "Voice transcription failed",
                            code: "SERVICE_ERROR",
                            details: error_2 instanceof Error ? error_2.message : "An unexpected error occurred"
                        }];
                case 11: return [2 /*return*/];
            }
        });
    });
}
/**
 * Helper function to get file extension from MIME type
 */
function getFileExtension(mimeType) {
    var mimeToExt = {
        'audio/webm': 'webm',
        'audio/mp3': 'mp3',
        'audio/mpeg': 'mp3',
        'audio/wav': 'wav',
        'audio/wave': 'wav',
        'audio/ogg': 'ogg',
        'audio/m4a': 'm4a',
        'audio/mp4': 'm4a',
    };
    return mimeToExt[mimeType] || 'audio';
}
/**
 * Helper function to get full language name from ISO code
 */
function getLanguageName(langCode) {
    var langMap = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'nl': 'Dutch',
        'pl': 'Polish',
        'tr': 'Turkish',
        'sv': 'Swedish',
        'da': 'Danish',
        'no': 'Norwegian',
        'fi': 'Finnish',
    };
    return langMap[langCode] || langCode;
}
/**
 * Example tRPC procedure implementation:
 *
 * ```ts
 * // In server/routers.ts
 * import { transcribeAudio } from "./_core/voiceTranscription.js";
 *
 * export const voiceRouter = router({
 *   transcribe: protectedProcedure
 *     .input(z.object({
 *       audioUrl: z.string(),
 *       language: z.string().optional(),
 *       prompt: z.string().optional(),
 *     }))
 *     .mutation(async ({ input, ctx }) => {
 *       const result = await transcribeAudio(input);
 *
 *       // Check if it's an error
 *       if ('error' in result) {
 *         throw new TRPCError({
 *           code: 'BAD_REQUEST',
 *           message: result.error,
 *           cause: result,
 *         });
 *       }
 *
 *       // Optionally save transcription to database
 *       await db.insert(transcriptions).values({
 *         userId: ctx.user.id,
 *         text: result.text,
 *         duration: result.duration,
 *         language: result.language,
 *         audioUrl: input.audioUrl,
 *         createdAt: new Date(),
 *      });
 *
 *       return result;
 *     }),
 * });
 * ```
 */
