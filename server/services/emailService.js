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
import nodemailer from "nodemailer";
var transporter = null;
/**
 * Initialize email transporter based on environment variables
 */
function getTransporter() {
    if (transporter)
        return transporter;
    var emailProvider = process.env.EMAIL_PROVIDER || "console";
    if (emailProvider === "sendgrid") {
        transporter = nodemailer.createTransport({
            host: "smtp.sendgrid.net",
            port: 587,
            secure: false,
            auth: {
                user: "apikey",
                pass: process.env.SENDGRID_API_KEY || "",
            },
        });
    }
    else if (emailProvider === "aws-ses") {
        try {
            var AWS = require("aws-sdk");
            var ses = new AWS.SES({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                region: process.env.AWS_REGION || "us-east-1",
            });
            transporter = nodemailer.createTransport({
                SES: { ses: ses, aws: AWS },
            });
        }
        catch (error) {
            console.warn("[Email] AWS SDK not available, falling back to console");
            transporter = nodemailer.createTransport({
                streamTransport: true,
                newline: "unix",
                buffer: true,
            });
        }
    }
    else if (emailProvider === "smtp") {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }
    else {
        // Fallback to console logging for development
        transporter = nodemailer.createTransport({
            streamTransport: true,
            newline: "unix",
            buffer: true,
        });
    }
    return transporter;
}
/**
 * Send email notification
 */
export function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function () {
        var transporter_1, fromEmail, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    transporter_1 = getTransporter();
                    fromEmail = process.env.EMAIL_FROM || "noreply@educadq.com";
                    return [4 /*yield*/, transporter_1.sendMail({
                            from: fromEmail,
                            to: options.to,
                            subject: options.subject,
                            html: options.html,
                            text: options.text,
                        })];
                case 1:
                    result = _a.sent();
                    console.log("[Email] Sent to ".concat(options.to, ": ").concat(options.subject));
                    return [2 /*return*/, true];
                case 2:
                    error_1 = _a.sent();
                    console.error("[Email] Failed to send:", error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Send payment reminder email
 */
export function sendPaymentReminderEmail(studentEmail, studentName, installmentNumber, dueDate, amount, pixKey) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <h2>Aviso de Vencimento de Parcela</h2>\n    <p>Ol\u00E1 ".concat(studentName, ",</p>\n    <p>Voc\u00EA tem uma parcela vencendo em breve:</p>\n    \n    <div style=\"background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n      <p><strong>Parcela:</strong> ").concat(installmentNumber, "</p>\n      <p><strong>Valor:</strong> R$ ").concat(amount.toFixed(2), "</p>\n      <p><strong>Data de Vencimento:</strong> ").concat(dueDate.toLocaleDateString("pt-BR"), "</p>\n    </div>\n    \n    <h3>Como Pagar</h3>\n    <p>Voc\u00EA pode pagar via PIX usando a chave:</p>\n    <p style=\"font-family: monospace; background: #f0f0f0; padding: 10px; border-radius: 4px;\">\n      ").concat(pixKey, "\n    </p>\n    \n    <p>Obrigado por sua confian\u00E7a na EducaDQ!</p>\n  ");
            return [2 /*return*/, sendEmail({
                    to: studentEmail,
                    subject: "Aviso de Vencimento - Parcela ".concat(installmentNumber),
                    html: html,
                    text: "Voc\u00EA tem uma parcela vencendo em ".concat(dueDate.toLocaleDateString("pt-BR"), " no valor de R$ ").concat(amount.toFixed(2), ". PIX: ").concat(pixKey),
                })];
        });
    });
}
/**
 * Send course completion notification
 */
export function sendCourseCompletionEmail(studentEmail, studentName, courseName, certificateUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <h2>Parab\u00E9ns! Voc\u00EA Concluiu um Curso!</h2>\n    <p>Ol\u00E1 ".concat(studentName, ",</p>\n    <p>Voc\u00EA concluiu com sucesso o curso:</p>\n    \n    <div style=\"background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n      <h3>").concat(courseName, "</h3>\n    </div>\n    \n    <p>Seu certificado est\u00E1 sendo preparado e ser\u00E1 enviado em breve.</p>\n    <p>Voc\u00EA pode acessar seus cursos em: <a href=\"https://educadq.com\">educadq.com</a></p>\n    \n    <p>Parab\u00E9ns novamente!</p>\n  ");
            return [2 /*return*/, sendEmail({
                    to: studentEmail,
                    subject: "Parab\u00E9ns! Voc\u00EA concluiu ".concat(courseName),
                    html: html,
                })];
        });
    });
}
/**
 * Send approval notification
 */
export function sendApprovalEmail(studentEmail, studentName, courseName, score) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <h2>Voc\u00EA Foi Aprovado!</h2>\n    <p>Ol\u00E1 ".concat(studentName, ",</p>\n    <p>Parab\u00E9ns! Voc\u00EA foi aprovado no curso:</p>\n    \n    <div style=\"background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n      <h3>").concat(courseName, "</h3>\n      <p><strong>Sua Pontua\u00E7\u00E3o:</strong> ").concat(score, "%</p>\n    </div>\n    \n    <p>Seu certificado ser\u00E1 emitido em breve.</p>\n    <p>Obrigado por estudar com a EducaDQ!</p>\n  ");
            return [2 /*return*/, sendEmail({
                    to: studentEmail,
                    subject: "Aprovado em ".concat(courseName),
                    html: html,
                })];
        });
    });
}
/**
 * Send overdue payment alert
 */
export function sendOverduePaymentEmail(studentEmail, studentName, installmentNumber, daysOverdue, amount, pixKey) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <h2>Aten\u00E7\u00E3o: Parcela em Atraso</h2>\n    <p>Ol\u00E1 ".concat(studentName, ",</p>\n    <p>Sua parcela est\u00E1 em atraso h\u00E1 ").concat(daysOverdue, " dias:</p>\n    \n    <div style=\"background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;\">\n      <p><strong>Parcela:</strong> ").concat(installmentNumber, "</p>\n      <p><strong>Valor:</strong> R$ ").concat(amount.toFixed(2), "</p>\n      <p><strong>Dias em Atraso:</strong> ").concat(daysOverdue, "</p>\n    </div>\n    \n    <h3>Regularize Sua Situa\u00E7\u00E3o</h3>\n    <p>Por favor, realize o pagamento o quanto antes usando a chave PIX:</p>\n    <p style=\"font-family: monospace; background: #f0f0f0; padding: 10px; border-radius: 4px;\">\n      ").concat(pixKey, "\n    </p>\n    \n    <p>Se tiver d\u00FAvidas, entre em contato conosco pelo WhatsApp: 41 98891-3431</p>\n  ");
            return [2 /*return*/, sendEmail({
                    to: studentEmail,
                    subject: "Urgente: Parcela em Atraso - ".concat(installmentNumber),
                    html: html,
                })];
        });
    });
}
/**
 * Send new enrollment notification to teacher
 */
export function sendNewEnrollmentEmail(teacherEmail, teacherName, studentName, courseName) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <h2>Novo Aluno Inscrito</h2>\n    <p>Ol\u00E1 ".concat(teacherName, ",</p>\n    <p>Um novo aluno se inscreveu em seu curso:</p>\n    \n    <div style=\"background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n      <p><strong>Aluno:</strong> ").concat(studentName, "</p>\n      <p><strong>Curso:</strong> ").concat(courseName, "</p>\n    </div>\n    \n    <p>Voc\u00EA pode acompanhar o progresso do aluno em seu painel.</p>\n  ");
            return [2 /*return*/, sendEmail({
                    to: teacherEmail,
                    subject: "Novo Aluno: ".concat(studentName, " em ").concat(courseName),
                    html: html,
                })];
        });
    });
}
/**
 * Send student approval notification to teacher
 */
export function sendStudentApprovalEmail(teacherEmail, teacherName, studentName, courseName, score) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <h2>Aluno Aprovado</h2>\n    <p>Ol\u00E1 ".concat(teacherName, ",</p>\n    <p>Um de seus alunos foi aprovado:</p>\n    \n    <div style=\"background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;\">\n      <p><strong>Aluno:</strong> ").concat(studentName, "</p>\n      <p><strong>Curso:</strong> ").concat(courseName, "</p>\n      <p><strong>Pontua\u00E7\u00E3o:</strong> ").concat(score, "%</p>\n    </div>\n    \n    <p>Voc\u00EA pode emitir o certificado no painel administrativo.</p>\n  ");
            return [2 /*return*/, sendEmail({
                    to: teacherEmail,
                    subject: "Aluno Aprovado: ".concat(studentName),
                    html: html,
                })];
        });
    });
}
