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
import { notifyOwner } from "../../_core/notification.js";
var RetryNotificationService = /** @class */ (function () {
    function RetryNotificationService() {
    }
    /**
     * Enviar notificação de falha de pagamento
     */
    RetryNotificationService.notifyPaymentFailed = function (studentId_1, amount_1, retryCount_1, nextRetryTime_1) {
        return __awaiter(this, arguments, void 0, function (studentId, amount, retryCount, nextRetryTime, channels) {
            var hoursUntilRetry, messages, error_1;
            if (channels === void 0) { channels = {
                email: true,
                sms: false,
                push: true,
                inApp: true,
            }; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        hoursUntilRetry = Math.round((nextRetryTime.getTime() - new Date().getTime()) / (1000 * 60 * 60));
                        messages = {
                            email: {
                                subject: "Seu pagamento não foi processado",
                                body: "\n            <h2>Pagamento Pendente</h2>\n            <p>Sua tentativa de pagamento de R$ ".concat(amount, " n\u00E3o foi processada.</p>\n            <p>N\u00E3o se preocupe! Tentaremos novamente em ").concat(hoursUntilRetry, " hora(s).</p>\n            <p>Tentativa ").concat(retryCount, " de 5</p>\n            <p>Se o problema persistir, entre em contato com nosso suporte.</p>\n          "),
                            },
                            sms: {
                                message: "EducaDQ: Seu pagamento de R$ ".concat(amount, " n\u00E3o foi processado. Tentaremos novamente em ").concat(hoursUntilRetry, "h. Suporte: 41 98891-3431"),
                            },
                            push: {
                                title: "Pagamento Pendente",
                                body: "Tentaremos processar seu pagamento novamente em ".concat(hoursUntilRetry, " hora(s)."),
                            },
                            inApp: {
                                title: "Pagamento Pendente",
                                message: "Sua tentativa de pagamento falhou. Tentaremos novamente em ".concat(hoursUntilRetry, " hora(s)."),
                                type: "warning",
                            },
                        };
                        if (!channels.email) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.sendEmailNotification(studentId, messages.email)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!channels.sms) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.sendSmsNotification(studentId, messages.sms)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!channels.push) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.sendPushNotification(studentId, messages.push)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!channels.inApp) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.sendInAppNotification(studentId, messages.inApp)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_1 = _a.sent();
                        console.error("[Notification Service] Error sending payment failed notification:", error_1);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enviar notificação de pagamento recuperado
     */
    RetryNotificationService.notifyPaymentRecovered = function (studentId, amount, retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        messages = {
                            email: {
                                subject: "Seu pagamento foi confirmado!",
                                body: "\n            <h2>Pagamento Confirmado</h2>\n            <p>\u00D3timas not\u00EDcias! Seu pagamento de R$ ".concat(amount, " foi processado com sucesso ap\u00F3s ").concat(retryCount, " tentativa(s).</p>\n            <p>Voc\u00EA agora tem acesso ao curso.</p>\n            <p>Aproveite sua forma\u00E7\u00E3o!</p>\n          "),
                            },
                            push: {
                                title: "Pagamento Confirmado!",
                                body: "Seu pagamento de R$ ".concat(amount, " foi confirmado. Acesso ao curso liberado!"),
                            },
                            inApp: {
                                title: "Sucesso!",
                                message: "Seu pagamento foi confirmado. Voc\u00EA agora tem acesso ao curso.",
                                type: "success",
                            },
                        };
                        return [4 /*yield*/, this.sendEmailNotification(studentId, messages.email)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.sendPushNotification(studentId, messages.push)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.sendInAppNotification(studentId, messages.inApp)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error("[Notification Service] Error sending payment recovered notification:", error_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enviar notificação de pagamento abandonado
     */
    RetryNotificationService.notifyPaymentAbandoned = function (studentId, amount, maxRetries) {
        return __awaiter(this, void 0, void 0, function () {
            var messages, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        messages = {
                            email: {
                                subject: "Seu pagamento não pôde ser processado",
                                body: "\n            <h2>Pagamento N\u00E3o Processado</h2>\n            <p>Infelizmente, seu pagamento de R$ ".concat(amount, " n\u00E3o p\u00F4de ser processado ap\u00F3s ").concat(maxRetries, " tentativas.</p>\n            <p>Por favor, tente novamente ou entre em contato com nosso suporte.</p>\n            <p>WhatsApp: 41 98891-3431</p>\n          "),
                            },
                            sms: {
                                message: "EducaDQ: Seu pagamento de R$ ".concat(amount, " n\u00E3o p\u00F4de ser processado. Tente novamente ou contate: 41 98891-3431"),
                            },
                            push: {
                                title: "Ação Necessária",
                                body: "Seu pagamento n\u00E3o p\u00F4de ser processado. Por favor, tente novamente.",
                            },
                            inApp: {
                                title: "Pagamento Não Processado",
                                message: "Seu pagamento n\u00E3o p\u00F4de ser processado ap\u00F3s v\u00E1rias tentativas. Por favor, tente novamente ou entre em contato com o suporte.",
                                type: "error",
                            },
                        };
                        return [4 /*yield*/, this.sendEmailNotification(studentId, messages.email)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.sendSmsNotification(studentId, messages.sms)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.sendPushNotification(studentId, messages.push)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.sendInAppNotification(studentId, messages.inApp)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.error("[Notification Service] Error sending payment abandoned notification:", error_3);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Notificar admin sobre falha crítica
     */
    RetryNotificationService.notifyAdminCriticalFailure = function (studentId, amount, error, retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, notifyOwner({
                                title: "Falha Crítica de Pagamento",
                                content: "\nAluno ID: ".concat(studentId, "\nValor: R$ ").concat(amount, "\nTentativas: ").concat(retryCount, "\nErro: ").concat(error, "\n\nA\u00E7\u00E3o recomendada: Verificar configura\u00E7\u00E3o do provedor de pagamento.\n        "),
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error("[Notification Service] Error notifying admin:", error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    RetryNotificationService.sendEmailNotification = function (studentId, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Buscar email do aluno
                    // const student = await db.getStudentById(studentId);
                    // if (!student?.email) return;
                    // Enviar email via serviço de email
                    console.log("[Email] Sending to student ".concat(studentId, ": ").concat(message.subject));
                    // Implementar integração com serviço de email (SendGrid, AWS SES, etc)
                    // await emailService.send({
                    //   to: student.email,
                    //   subject: message.subject,
                    //   html: message.body,
                    // });
                    // Registrar notificação
                    // await db.createRetryNotification({
                    //   studentId,
                    //   type: "email",
                    //   status: "sent",
                    //   message: message.subject,
                    // });
                }
                catch (error) {
                    console.error("[Email Service] Error sending email:", error);
                }
                return [2 /*return*/];
            });
        });
    };
    RetryNotificationService.sendSmsNotification = function (studentId, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // Buscar telefone do aluno
                    // const student = await db.getStudentById(studentId);
                    // if (!student?.phone) return;
                    console.log("[SMS] Sending to student ".concat(studentId, ": ").concat(message.message));
                    // Implementar integração com serviço de SMS (Twilio, AWS SNS, etc)
                    // await smsService.send({
                    //   to: student.phone,
                    //   message: message.message,
                    // });
                    // Registrar notificação
                    // await db.createRetryNotification({
                    //   studentId,
                    //   type: "sms",
                    //   status: "sent",
                    //   message: message.message,
                    // });
                }
                catch (error) {
                    console.error("[SMS Service] Error sending SMS:", error);
                }
                return [2 /*return*/];
            });
        });
    };
    RetryNotificationService.sendPushNotification = function (studentId, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    console.log("[Push] Sending to student ".concat(studentId, ": ").concat(message.title));
                    // Implementar integração com Firebase Cloud Messaging ou similar
                    // await pushService.send({
                    //   userId: studentId,
                    //   title: message.title,
                    //   body: message.body,
                    // });
                    // Registrar notificação
                    // await db.createRetryNotification({
                    //   studentId,
                    //   type: "push",
                    //   status: "sent",
                    //   message: message.title,
                    // });
                }
                catch (error) {
                    console.error("[Push Service] Error sending push:", error);
                }
                return [2 /*return*/];
            });
        });
    };
    RetryNotificationService.sendInAppNotification = function (studentId, message) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    console.log("[In-App] Sending to student ".concat(studentId, ": ").concat(message.title));
                    // Criar notificação in-app no banco de dados
                    // await db.createInAppNotification({
                    //   studentId,
                    //   title: message.title,
                    //   message: message.message,
                    //   type: message.type,
                    //   read: false,
                    // });
                    // Registrar notificação
                    // await db.createRetryNotification({
                    //   studentId,
                    //   type: "in_app",
                    //   status: "sent",
                    //   message: message.title,
                    // });
                }
                catch (error) {
                    console.error("[In-App Service] Error creating in-app notification:", error);
                }
                return [2 /*return*/];
            });
        });
    };
    return RetryNotificationService;
}());
export { RetryNotificationService };
