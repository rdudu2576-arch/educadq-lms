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
import nodemailer from "nodemailer";
/**
 * Email Notification Service
 * Gerencia envio de emails para alunos, professores e administradores
 */
// Configurar transportador de email
var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});
/**
 * Envia um email
 */
export function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
                        console.warn("[Email] SMTP não configurado. Email não será enviado.");
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, transporter.sendMail(__assign({ from: process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@educadq.com" }, options))];
                case 1:
                    _a.sent();
                    console.log("[Email] Email enviado para ".concat(options.to));
                    return [2 /*return*/, true];
                case 2:
                    error_1 = _a.sent();
                    console.error("[Email] Erro ao enviar email:", error_1);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Email de boas-vindas para novo aluno
 */
export function sendWelcomeEmail(email, name) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n      <h2>Bem-vindo \u00E0 EducaDQ!</h2>\n      <p>Ol\u00E1 ".concat(name, ",</p>\n      <p>Sua conta foi criada com sucesso. Voc\u00EA agora pode acessar todos os cursos dispon\u00EDveis na plataforma.</p>\n      <p>\n        <a href=\"").concat(process.env.FRONTEND_URL || "http://localhost:3000", "/login\" \n           style=\"display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;\">\n          Acessar Plataforma\n        </a>\n      </p>\n      <p>Se tiver d\u00FAvidas, entre em contato conosco.</p>\n      <p>Atenciosamente,<br>Equipe EducaDQ</p>\n    </div>\n  ");
            return [2 /*return*/, sendEmail({
                    to: email,
                    subject: "Bem-vindo à EducaDQ!",
                    html: html,
                })];
        });
    });
}
/**
 * Email de confirmação de matrícula
 */
export function sendEnrollmentConfirmationEmail(email, studentName, courseName) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n      <h2>Matr\u00EDcula Confirmada!</h2>\n      <p>Ol\u00E1 ".concat(studentName, ",</p>\n      <p>Voc\u00EA foi matriculado com sucesso no curso <strong>").concat(courseName, "</strong>.</p>\n      <p>Voc\u00EA agora pode acessar todas as aulas e materiais do curso.</p>\n      <p>\n        <a href=\"").concat(process.env.FRONTEND_URL || "http://localhost:3000", "/courses\" \n           style=\"display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;\">\n          Acessar Curso\n        </a>\n      </p>\n      <p>Bom aprendizado!<br>Equipe EducaDQ</p>\n    </div>\n  ");
            return [2 /*return*/, sendEmail({
                    to: email,
                    subject: "Matr\u00EDcula Confirmada - ".concat(courseName),
                    html: html,
                })];
        });
    });
}
/**
 * Email de pagamento confirmado
 */
export function sendPaymentConfirmationEmail(email, studentName, amount, courseName, transactionId) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n      <h2>Pagamento Confirmado!</h2>\n      <p>Ol\u00E1 ".concat(studentName, ",</p>\n      <p>Seu pagamento foi processado com sucesso.</p>\n      <div style=\"background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;\">\n        <p><strong>Curso:</strong> ").concat(courseName, "</p>\n        <p><strong>Valor:</strong> R$ ").concat(amount.toFixed(2), "</p>\n        <p><strong>ID da Transa\u00E7\u00E3o:</strong> ").concat(transactionId, "</p>\n      </div>\n      <p>Voc\u00EA agora tem acesso ao curso. Clique no bot\u00E3o abaixo para come\u00E7ar.</p>\n      <p>\n        <a href=\"").concat(process.env.FRONTEND_URL || "http://localhost:3000", "/courses/").concat(courseName, "\" \n           style=\"display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;\">\n          Acessar Curso\n        </a>\n      </p>\n      <p>Obrigado!<br>Equipe EducaDQ</p>\n    </div>\n  ");
            return [2 /*return*/, sendEmail({
                    to: email,
                    subject: "Pagamento Confirmado",
                    html: html,
                })];
        });
    });
}
/**
 * Email de aviso de pagamento vencido
 */
export function sendOverduePaymentEmail(email, studentName, amount, dueDate, pixKey) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n      <h2 style=\"color: #ef4444;\">Aviso de Pagamento Vencido</h2>\n      <p>Ol\u00E1 ".concat(studentName, ",</p>\n      <p>Voc\u00EA tem uma parcela vencida que precisa ser paga.</p>\n      <div style=\"background-color: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;\">\n        <p><strong>Valor:</strong> R$ ").concat(amount.toFixed(2), "</p>\n        <p><strong>Data de Vencimento:</strong> ").concat(dueDate.toLocaleDateString("pt-BR"), "</p>\n        ").concat(pixKey ? "<p><strong>Chave PIX:</strong> ".concat(pixKey, "</p>") : "", "\n      </div>\n      <p>Por favor, efetue o pagamento o mais breve poss\u00EDvel para n\u00E3o perder o acesso ao curso.</p>\n      <p>\n        <a href=\"").concat(process.env.FRONTEND_URL || "http://localhost:3000", "/payments\" \n           style=\"display: inline-block; padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px;\">\n          Pagar Agora\n        </a>\n      </p>\n      <p>Se tiver d\u00FAvidas, entre em contato conosco.</p>\n      <p>Atenciosamente,<br>Equipe EducaDQ</p>\n    </div>\n  ");
            return [2 /*return*/, sendEmail({
                    to: email,
                    subject: "Aviso de Pagamento Vencido",
                    html: html,
                })];
        });
    });
}
/**
 * Email de conclusão de curso
 */
export function sendCourseCompletionEmail(email, studentName, courseName, certificateUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n      <h2>Parab\u00E9ns! Curso Conclu\u00EDdo!</h2>\n      <p>Ol\u00E1 ".concat(studentName, ",</p>\n      <p>Voc\u00EA concluiu com sucesso o curso <strong>").concat(courseName, "</strong>!</p>\n      <p>Sua dedica\u00E7\u00E3o e esfor\u00E7o foram recompensados. Voc\u00EA agora \u00E9 um especialista nesta \u00E1rea.</p>\n      ").concat(certificateUrl
                ? "<p>\n        <a href=\"".concat(certificateUrl, "\" \n           style=\"display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;\">\n          Baixar Certificado\n        </a>\n      </p>")
                : "", "\n      <p>Continue aprendendo com nossos outros cursos!</p>\n      <p>Atenciosamente,<br>Equipe EducaDQ</p>\n    </div>\n  ");
            return [2 /*return*/, sendEmail({
                    to: email,
                    subject: "Parab\u00E9ns! Voc\u00EA concluiu ".concat(courseName),
                    html: html,
                })];
        });
    });
}
/**
 * Email de nova aula disponível
 */
export function sendNewLessonEmail(email, studentName, courseName, lessonTitle) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n      <h2>Nova Aula Dispon\u00EDvel!</h2>\n      <p>Ol\u00E1 ".concat(studentName, ",</p>\n      <p>Uma nova aula foi adicionada ao curso <strong>").concat(courseName, "</strong>.</p>\n      <p><strong>Aula:</strong> ").concat(lessonTitle, "</p>\n      <p>\n        <a href=\"").concat(process.env.FRONTEND_URL || "http://localhost:3000", "/courses/").concat(courseName, "\" \n           style=\"display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;\">\n          Assistir Aula\n        </a>\n      </p>\n      <p>N\u00E3o perca!</p>\n      <p>Atenciosamente,<br>Equipe EducaDQ</p>\n    </div>\n  ");
            return [2 /*return*/, sendEmail({
                    to: email,
                    subject: "Nova aula em ".concat(courseName),
                    html: html,
                })];
        });
    });
}
/**
 * Email de recuperação de senha
 */
export function sendPasswordResetEmail(email, resetLink) {
    return __awaiter(this, void 0, void 0, function () {
        var html;
        return __generator(this, function (_a) {
            html = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n      <h2>Recuperar Senha</h2>\n      <p>Recebemos uma solicita\u00E7\u00E3o para redefinir sua senha.</p>\n      <p>Clique no bot\u00E3o abaixo para criar uma nova senha:</p>\n      <p>\n        <a href=\"".concat(resetLink, "\" \n           style=\"display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;\">\n          Redefinir Senha\n        </a>\n      </p>\n      <p>Este link expira em 1 hora.</p>\n      <p>Se voc\u00EA n\u00E3o solicitou isso, ignore este email.</p>\n      <p>Atenciosamente,<br>Equipe EducaDQ</p>\n    </div>\n  ");
            return [2 /*return*/, sendEmail({
                    to: email,
                    subject: "Recuperar Senha - EducaDQ",
                    html: html,
                })];
        });
    });
}
/**
 * Email para administrador - Nova venda
 */
export function sendAdminNewSaleEmail(studentName, courseName, amount) {
    return __awaiter(this, void 0, void 0, function () {
        var adminEmail, html;
        return __generator(this, function (_a) {
            adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "admin@educadq.com";
            html = "\n    <div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;\">\n      <h2>Nova Venda!</h2>\n      <p>Uma nova venda foi registrada na plataforma.</p>\n      <div style=\"background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;\">\n        <p><strong>Aluno:</strong> ".concat(studentName, "</p>\n        <p><strong>Curso:</strong> ").concat(courseName, "</p>\n        <p><strong>Valor:</strong> R$ ").concat(amount.toFixed(2), "</p>\n        <p><strong>Data:</strong> ").concat(new Date().toLocaleDateString("pt-BR"), "</p>\n      </div>\n      <p>Acesse o painel administrativo para mais detalhes.</p>\n    </div>\n  ");
            return [2 /*return*/, sendEmail({
                    to: adminEmail,
                    subject: "Nova Venda - EducaDQ",
                    html: html,
                })];
        });
    });
}
