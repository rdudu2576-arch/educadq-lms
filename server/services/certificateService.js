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
import { PDFDocument, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { getDb } from "../infra/db.js";
import { users, courses } from "../infra/schema.pg.js";
import { eq } from "drizzle-orm";
/**
 * Generate a certificate PDF for a student who completed a course
 */
export function generateCertificatePDF(studentId, courseId, finalGrade, completionDate) {
    return __awaiter(this, void 0, void 0, function () {
        var database, student, course, pdfDoc, page, _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, courseHours, _u, _v, _w, dateStr, _x, _y, _z, certificateUrl, qrCodeDataUrl, base64Data, qrCodeImage, _0, _1, _2, _3, _4, _5, pdfBytes;
        var _6, _7, _8, _9, _10, _11, _12, _13, _14, _15;
        return __generator(this, function (_16) {
            switch (_16.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _16.sent();
                    if (!database)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, database
                            .select()
                            .from(users)
                            .where(eq(users.id, studentId))
                            .then(function (rows) { return rows[0]; })];
                case 2:
                    student = _16.sent();
                    return [4 /*yield*/, database
                            .select()
                            .from(courses)
                            .where(eq(courses.id, courseId))
                            .then(function (rows) { return rows[0]; })];
                case 3:
                    course = _16.sent();
                    if (!student || !course) {
                        throw new Error("Student or course not found");
                    }
                    return [4 /*yield*/, PDFDocument.create()];
                case 4:
                    pdfDoc = _16.sent();
                    page = pdfDoc.addPage([850, 600]);
                    // Add background color (light blue)
                    page.drawRectangle({
                        x: 0,
                        y: 0,
                        width: 850,
                        height: 600,
                        color: rgb(0.95, 0.97, 1),
                    });
                    // Add border
                    page.drawRectangle({
                        x: 30,
                        y: 30,
                        width: 790,
                        height: 540,
                        borderColor: rgb(0.2, 0.6, 0.8),
                        borderWidth: 3,
                    });
                    // Add title
                    _b = (_a = page).drawText;
                    _c = ["CERTIFICADO DE CONCLUSÃO"];
                    _6 = {
                        x: 100,
                        y: 500,
                        size: 36,
                        color: rgb(0.2, 0.6, 0.8)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica-Bold")];
                case 5:
                    // Add title
                    _b.apply(_a, _c.concat([(_6.font = _16.sent(),
                            _6)]));
                    // Add institution name
                    _e = (_d = page).drawText;
                    _f = ["EducaDQ - Centro de Formação e Estudos sobre Álcool e outras Drogas"];
                    _7 = {
                        x: 100,
                        y: 460,
                        size: 14,
                        color: rgb(0.3, 0.3, 0.3)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica")];
                case 6:
                    // Add institution name
                    _e.apply(_d, _f.concat([(_7.font = _16.sent(),
                            _7)]));
                    // Add certificate text
                    _h = (_g = page).drawText;
                    _j = ["Certificamos que"];
                    _8 = {
                        x: 100,
                        y: 410,
                        size: 14,
                        color: rgb(0.3, 0.3, 0.3)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica")];
                case 7:
                    // Add certificate text
                    _h.apply(_g, _j.concat([(_8.font = _16.sent(),
                            _8)]));
                    // Add student name
                    _l = (_k = page).drawText;
                    _m = [student.name.toUpperCase()];
                    _9 = {
                        x: 100,
                        y: 380,
                        size: 18,
                        color: rgb(0.2, 0.6, 0.8)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica-Bold")];
                case 8:
                    // Add student name
                    _l.apply(_k, _m.concat([(_9.font = _16.sent(),
                            _9)]));
                    // Add completion text
                    _p = (_o = page).drawText;
                    _q = ["completou com sucesso o curso"];
                    _10 = {
                        x: 100,
                        y: 350,
                        size: 14,
                        color: rgb(0.3, 0.3, 0.3)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica")];
                case 9:
                    // Add completion text
                    _p.apply(_o, _q.concat([(_10.font = _16.sent(),
                            _10)]));
                    // Add course name
                    _s = (_r = page).drawText;
                    _t = [course.title.toUpperCase()];
                    _11 = {
                        x: 100,
                        y: 320,
                        size: 16,
                        color: rgb(0.2, 0.6, 0.8)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica-Bold")];
                case 10:
                    // Add course name
                    _s.apply(_r, _t.concat([(_11.font = _16.sent(),
                            _11)]));
                    courseHours = course.courseHours || 40;
                    _v = (_u = page).drawText;
                    _w = ["Carga Hor\u00E1ria: ".concat(courseHours, " horas | Nota Final: ").concat(finalGrade.toFixed(1))];
                    _12 = {
                        x: 100,
                        y: 290,
                        size: 12,
                        color: rgb(0.3, 0.3, 0.3)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica")];
                case 11:
                    _v.apply(_u, _w.concat([(_12.font = _16.sent(),
                            _12)]));
                    dateStr = completionDate.toLocaleDateString("pt-BR");
                    _y = (_x = page).drawText;
                    _z = ["Data de Conclus\u00E3o: ".concat(dateStr)];
                    _13 = {
                        x: 100,
                        y: 260,
                        size: 12,
                        color: rgb(0.3, 0.3, 0.3)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica")];
                case 12:
                    _y.apply(_x, _z.concat([(_13.font = _16.sent(),
                            _13)]));
                    certificateUrl = "https://educadq-ead.com.br/certificado/".concat(studentId, "/").concat(courseId);
                    return [4 /*yield*/, QRCode.toDataURL(certificateUrl, {
                            errorCorrectionLevel: "H",
                            type: "image/png",
                            margin: 1,
                            width: 200,
                        })];
                case 13:
                    qrCodeDataUrl = _16.sent();
                    base64Data = qrCodeDataUrl.split(",")[1];
                    return [4 /*yield*/, pdfDoc.embedPng(Buffer.from(base64Data, "base64"))];
                case 14:
                    qrCodeImage = _16.sent();
                    // Add QR code to PDF
                    page.drawImage(qrCodeImage, {
                        x: 650,
                        y: 250,
                        width: 150,
                        height: 150,
                    });
                    // Add verification text
                    _1 = (_0 = page).drawText;
                    _2 = ["Escaneie o QR Code para verificar"];
                    _14 = {
                        x: 620,
                        y: 230,
                        size: 10,
                        color: rgb(0.5, 0.5, 0.5)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica")];
                case 15:
                    // Add verification text
                    _1.apply(_0, _2.concat([(_14.font = _16.sent(),
                            _14)]));
                    // Add footer
                    _4 = (_3 = page).drawText;
                    _5 = ["Este certificado é válido e pode ser compartilhado"];
                    _15 = {
                        x: 100,
                        y: 80,
                        size: 11,
                        color: rgb(0.5, 0.5, 0.5)
                    };
                    return [4 /*yield*/, pdfDoc.embedFont("Helvetica-Oblique")];
                case 16:
                    // Add footer
                    _4.apply(_3, _5.concat([(_15.font = _16.sent(),
                            _15)]));
                    return [4 /*yield*/, pdfDoc.save()];
                case 17:
                    pdfBytes = _16.sent();
                    return [2 /*return*/, Buffer.from(pdfBytes)];
            }
        });
    });
}
/**
 * Generate certificate filename
 */
export function generateCertificateFilename(studentId, courseId) {
    var timestamp = new Date().toISOString().split("T")[0];
    return "certificado-".concat(studentId, "-").concat(courseId, "-").concat(timestamp, ".pdf");
}
