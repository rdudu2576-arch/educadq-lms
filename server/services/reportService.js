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
import * as XLSX from "xlsx";
import { getDb } from "../infra/db.js";
import { users, courses, enrollments, payments, assessments } from "../infra/schema.pg.js";
import { eq } from "drizzle-orm";
/**
 * Generate courses report with student enrollment and completion rates
 */
export function generateCoursesReport() {
    return __awaiter(this, void 0, void 0, function () {
        var database, allCourses, courseData, worksheet, workbook;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, database.select().from(courses)];
                case 2:
                    allCourses = _a.sent();
                    return [4 /*yield*/, Promise.all(allCourses.map(function (course) { return __awaiter(_this, void 0, void 0, function () {
                            var courseEnrollments, courseAssessments, completedAssessments, completionRate;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, database
                                            .select()
                                            .from(enrollments)
                                            .where(eq(enrollments.courseId, course.id))];
                                    case 1:
                                        courseEnrollments = _a.sent();
                                        return [4 /*yield*/, database
                                                .select()
                                                .from(assessments)
                                                .where(eq(assessments.courseId, course.id))];
                                    case 2:
                                        courseAssessments = _a.sent();
                                        completedAssessments = courseAssessments.filter(function (a) { return a.isCorrect; });
                                        completionRate = courseAssessments.length > 0
                                            ? Math.round((completedAssessments.length / courseAssessments.length) * 100)
                                            : 0;
                                        return [2 /*return*/, {
                                                "ID do Curso": course.id,
                                                "Nome do Curso": course.title,
                                                "Alunos Matriculados": courseEnrollments.length,
                                                "Total de Avaliações": courseAssessments.length,
                                                "Avaliações Concluídas": completedAssessments.length,
                                                "Taxa de Conclusão (%)": completionRate,
                                                "Preço": parseFloat(course.price),
                                                "Data de Criação": new Date(course.createdAt).toLocaleDateString("pt-BR"),
                                            }];
                                }
                            });
                        }); }))];
                case 3:
                    courseData = _a.sent();
                    worksheet = XLSX.utils.json_to_sheet(courseData);
                    workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Cursos");
                    return [2 /*return*/, Buffer.from(XLSX.write(workbook, { bookType: "xlsx", type: "array" }))];
            }
        });
    });
}
/**
 * Generate students report with enrollment and progress
 */
export function generateStudentsReport() {
    return __awaiter(this, void 0, void 0, function () {
        var database, allUsers, studentData, worksheet, workbook;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, database.select().from(users).where(eq(users.role, "user"))];
                case 2:
                    allUsers = _a.sent();
                    return [4 /*yield*/, Promise.all(allUsers.map(function (user) { return __awaiter(_this, void 0, void 0, function () {
                            var studentEnrollments, totalProgress, completedCourses, _i, _a, enrollment, courseAssessments, completedAssessments, courseProgress, grades, averageGrade, averageProgress;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, database
                                            .select()
                                            .from(enrollments)
                                            .where(eq(enrollments.studentId, user.id))];
                                    case 1:
                                        studentEnrollments = _b.sent();
                                        totalProgress = 0;
                                        completedCourses = 0;
                                        _i = 0, _a = studentEnrollments;
                                        _b.label = 2;
                                    case 2:
                                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                                        enrollment = _a[_i];
                                        return [4 /*yield*/, database
                                                .select()
                                                .from(assessments)
                                                .where(eq(assessments.courseId, enrollment.courseId))];
                                    case 3:
                                        courseAssessments = _b.sent();
                                        if (courseAssessments.length === 0)
                                            return [3 /*break*/, 4];
                                        completedAssessments = courseAssessments.filter(function (a) { return a.studentGrade; });
                                        courseProgress = Math.round((completedAssessments.length / courseAssessments.length) * 100);
                                        totalProgress += courseProgress;
                                        grades = completedAssessments
                                            .map(function (a) { return (a.studentGrade ? parseFloat(a.studentGrade.toString()) : 0); })
                                            .filter(function (g) { return g > 0; });
                                        averageGrade = grades.length > 0 ? grades.reduce(function (a, b) { return a + b; }, 0) / grades.length : 0;
                                        if (averageGrade >= 7 && completedAssessments.length === courseAssessments.length) {
                                            completedCourses++;
                                        }
                                        _b.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 2];
                                    case 5:
                                        averageProgress = studentEnrollments.length > 0
                                            ? Math.round(totalProgress / studentEnrollments.length)
                                            : 0;
                                        return [2 /*return*/, {
                                                "ID do Aluno": user.id,
                                                "Nome": user.name,
                                                "Email": user.email,
                                                "CPF": user.cpf || "N/A",
                                                "Telefone": user.phone || "N/A",
                                                "Cursos Matriculados": studentEnrollments.length,
                                                "Cursos Concluídos": completedCourses,
                                                "Progresso Médio (%)": averageProgress,
                                                "Data de Cadastro": new Date(user.createdAt).toLocaleDateString("pt-BR"),
                                            }];
                                }
                            });
                        }); }))];
                case 3:
                    studentData = _a.sent();
                    worksheet = XLSX.utils.json_to_sheet(studentData);
                    workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, "Alunos");
                    return [2 /*return*/, Buffer.from(XLSX.write(workbook, { bookType: "xlsx", type: "array" }))];
            }
        });
    });
}
/**
 * Generate payments report
 */
export function generatePaymentsReport() {
    return __awaiter(this, void 0, void 0, function () {
        var database, allPayments, paymentData, paidCount, pendingCount, overdueCount, totalPaid, summaryData, worksheet1, worksheet2, workbook;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getDb()];
                case 1:
                    database = _a.sent();
                    if (!database)
                        throw new Error("Database connection failed");
                    return [4 /*yield*/, database.select().from(payments)];
                case 2:
                    allPayments = _a.sent();
                    return [4 /*yield*/, Promise.all(allPayments.map(function (payment) { return __awaiter(_this, void 0, void 0, function () {
                            var student, course;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, database
                                            .select()
                                            .from(users)
                                            .where(eq(users.id, payment.studentId))
                                            .then(function (rows) { return rows[0]; })];
                                    case 1:
                                        student = _a.sent();
                                        return [4 /*yield*/, database
                                                .select()
                                                .from(courses)
                                                .where(eq(courses.id, payment.courseId))
                                                .then(function (rows) { return rows[0]; })];
                                    case 2:
                                        course = _a.sent();
                                        return [2 /*return*/, {
                                                "ID do Pagamento": payment.id,
                                                "Aluno": (student === null || student === void 0 ? void 0 : student.name) || "N/A",
                                                "Curso": (course === null || course === void 0 ? void 0 : course.title) || "N/A",
                                                "Valor": parseFloat(payment.amount),
                                                "Parcelas": payment.installments,
                                                "Status": payment.status,
                                                "Chave PIX": payment.pixKey,
                                                "Data de Vencimento": new Date(payment.dueDate).toLocaleDateString("pt-BR"),
                                                "Data de Pagamento": payment.paidAt
                                                    ? new Date(payment.paidAt).toLocaleDateString("pt-BR")
                                                    : "Pendente",
                                            }];
                                }
                            });
                        }); }))];
                case 3:
                    paymentData = _a.sent();
                    paidCount = paymentData.filter(function (p) { return p.Status === "paid"; }).length;
                    pendingCount = paymentData.filter(function (p) { return p.Status === "pending"; }).length;
                    overdueCount = paymentData.filter(function (p) { return p.Status === "overdue"; }).length;
                    totalPaid = paymentData
                        .filter(function (p) { return p.Status === "paid"; })
                        .reduce(function (sum, p) { return sum + p.Valor; }, 0);
                    summaryData = [
                        { Métrica: "Total de Pagamentos", Valor: paymentData.length },
                        { Métrica: "Pagamentos Realizados", Valor: paidCount },
                        { Métrica: "Pagamentos Pendentes", Valor: pendingCount },
                        { Métrica: "Pagamentos Atrasados", Valor: overdueCount },
                        { Métrica: "Valor Total Recebido", Valor: totalPaid.toFixed(2) },
                    ];
                    worksheet1 = XLSX.utils.json_to_sheet(paymentData);
                    worksheet2 = XLSX.utils.json_to_sheet(summaryData);
                    workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet1, "Pagamentos");
                    XLSX.utils.book_append_sheet(workbook, worksheet2, "Resumo");
                    return [2 /*return*/, Buffer.from(XLSX.write(workbook, { bookType: "xlsx", type: "array" }))];
            }
        });
    });
}
