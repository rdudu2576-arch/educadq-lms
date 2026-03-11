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
import { publicProcedure, router } from "../../_core/trpc.js";
import { z } from "zod";
import { getMercadoPagoPayment } from "./mercadopago.js";
import { updatePayment, enrollStudent } from "../../infra/db.js";
/**
 * Handle Mercado Pago webhook notifications
 * Called when payment status changes
 */
export var webhooksRouter = router({
    mercadoPago: publicProcedure
        .input(z.object({
        action: z.string(),
        data: z.object({
            id: z.string(),
        }),
        type: z.string(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var mpPayment, _c, studentIdStr, courseIdStr, studentId, courseId, paymentStatus, enrollError_1, error_1;
        var input = _b.input;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 7, , 8]);
                    // Only process payment notifications
                    if (input.type !== "payment") {
                        return [2 /*return*/, { success: true, message: "Notification type not payment" }];
                    }
                    return [4 /*yield*/, getMercadoPagoPayment(input.data.id)];
                case 1:
                    mpPayment = _d.sent();
                    // Find the payment in our database using external_reference
                    if (!mpPayment.external_reference) {
                        throw new Error("No external_reference in Mercado Pago payment");
                    }
                    _c = mpPayment.external_reference.split("_"), studentIdStr = _c[0], courseIdStr = _c[1];
                    studentId = parseInt(studentIdStr);
                    courseId = parseInt(courseIdStr);
                    if (isNaN(studentId) || isNaN(courseId)) {
                        throw new Error("Invalid external_reference format");
                    }
                    paymentStatus = "pending";
                    if (mpPayment.status === "approved") {
                        paymentStatus = "paid";
                    }
                    else if (mpPayment.status === "rejected") {
                        paymentStatus = "cancelled";
                    }
                    else if (mpPayment.status === "pending") {
                        paymentStatus = "pending";
                    }
                    // Update payment in database
                    return [4 /*yield*/, updatePayment(parseInt(input.data.id), {
                            status: paymentStatus,
                            paidAt: paymentStatus === "paid" ? new Date() : null,
                        })];
                case 2:
                    // Update payment in database
                    _d.sent();
                    if (!(paymentStatus === "paid")) return [3 /*break*/, 6];
                    _d.label = 3;
                case 3:
                    _d.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, enrollStudent(studentId, courseId)];
                case 4:
                    _d.sent();
                    return [3 /*break*/, 6];
                case 5:
                    enrollError_1 = _d.sent();
                    console.error("Error enrolling student:", enrollError_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/, {
                        success: true,
                        message: "Payment ".concat(input.data.id, " processed successfully"),
                        status: paymentStatus,
                    }];
                case 7:
                    error_1 = _d.sent();
                    console.error("Webhook error:", error_1);
                    // Return success to Mercado Pago to avoid retries
                    // Log the error for manual review
                    return [2 /*return*/, {
                            success: true,
                            message: "Webhook processed with error",
                            error: error_1 instanceof Error ? error_1.message : "Unknown error",
                        }];
                case 8: return [2 /*return*/];
            }
        });
    }); }),
    /**
     * Verify payment status and trigger enrollment if needed
     * Called by frontend after payment redirect
     */
    verifyPayment: publicProcedure
        .input(z.object({
        paymentId: z.string(),
        studentId: z.number(),
        courseId: z.number(),
    }))
        .mutation(function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var mpPayment, enrollError_2, error_2;
        var input = _b.input;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 8, , 9]);
                    return [4 /*yield*/, getMercadoPagoPayment(input.paymentId)];
                case 1:
                    mpPayment = _c.sent();
                    if (!(mpPayment.status === "approved")) return [3 /*break*/, 6];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, enrollStudent(input.studentId, input.courseId)];
                case 3:
                    _c.sent();
                    return [3 /*break*/, 5];
                case 4:
                    enrollError_2 = _c.sent();
                    // Student might already be enrolled
                    console.log("Enrollment info:", enrollError_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/, {
                        success: true,
                        status: "approved",
                        message: "Pagamento confirmado! Você já tem acesso ao curso.",
                        redirect: "/student",
                    }];
                case 6:
                    if (mpPayment.status === "pending") {
                        return [2 /*return*/, {
                                success: true,
                                status: "pending",
                                message: "Pagamento em análise. Você receberá uma confirmação em breve.",
                                redirect: "/student",
                            }];
                    }
                    else {
                        return [2 /*return*/, {
                                success: false,
                                status: mpPayment.status,
                                message: "Pagamento não foi aprovado. Tente novamente.",
                                redirect: "/checkout/".concat(input.courseId),
                            }];
                    }
                    _c.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    error_2 = _c.sent();
                    console.error("Payment verification error:", error_2);
                    return [2 /*return*/, {
                            success: false,
                            status: "error",
                            message: "Erro ao verificar pagamento. Tente novamente.",
                            redirect: "/checkout/".concat(input.courseId),
                        }];
                case 9: return [2 /*return*/];
            }
        });
    }); }),
});
