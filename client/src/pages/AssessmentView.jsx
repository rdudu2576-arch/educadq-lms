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
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useContentProtection } from "@/hooks/useContentProtection";
import { useLocation } from "wouter";
import { useState } from "react";
export default function AssessmentView(_a) {
    var _this = this;
    var _b, _c;
    var params = _a.params;
    var _d = useAuth(), user = _d.user, loading = _d.loading;
    var _e = useLocation(), setLocation = _e[1];
    var assessmentId = parseInt(params.assessmentId);
    var _f = useState(0), currentQuestion = _f[0], setCurrentQuestion = _f[1];
    var _g = useState({}), answers = _g[0], setAnswers = _g[1];
    var _h = useState(false), submitted = _h[0], setSubmitted = _h[1];
    var _j = useState(null), score = _j[0], setScore = _j[1];
    // Protect content
    useContentProtection();
    // Fetch assessment
    var _k = trpc.assessments.getById.useQuery({ assessmentId: assessmentId }, { enabled: !!user }), assessment = _k.data, assessmentLoading = _k.isLoading;
    var submitMutation = trpc.progress.submitAnswer.useMutation();
    if (loading || assessmentLoading) {
        return (<div className="flex justify-center items-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500"/>
      </div>);
    }
    if (!user || !assessment) {
        return (<div className="text-center py-12">
        <p className="text-slate-400">Avaliação não encontrada.</p>
      </div>);
    }
    var questions = assessment.questions || [];
    var question = questions[currentQuestion];
    var handleAnswerSelect = function (alternativeId) {
        var _a;
        setAnswers(__assign(__assign({}, answers), (_a = {}, _a[question.id] = alternativeId, _a)));
    };
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        var _i, _a, _b, questionId, alternativeId, correct, _loop_1, _c, _d, _e, questionId, alternativeId, percentage, error_1;
        var _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 5, , 6]);
                    _i = 0, _a = Object.entries(answers);
                    _g.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    _b = _a[_i], questionId = _b[0], alternativeId = _b[1];
                    return [4 /*yield*/, submitMutation.mutateAsync({
                            assessmentId: assessmentId,
                            questionId: parseInt(questionId),
                            alternativeId: alternativeId,
                        })];
                case 2:
                    _g.sent();
                    _g.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4:
                    correct = 0;
                    _loop_1 = function (questionId, alternativeId) {
                        var q = questions.find(function (q) { return q.id === parseInt(questionId); });
                        var alt = (_f = q === null || q === void 0 ? void 0 : q.options) === null || _f === void 0 ? void 0 : _f.find(function (a) { return a.id === alternativeId; });
                        if (alt === null || alt === void 0 ? void 0 : alt.isCorrect) {
                            correct++;
                        }
                    };
                    for (_c = 0, _d = Object.entries(answers); _c < _d.length; _c++) {
                        _e = _d[_c], questionId = _e[0], alternativeId = _e[1];
                        _loop_1(questionId, alternativeId);
                    }
                    percentage = Math.round((correct / questions.length) * 100);
                    setScore({
                        correct: correct,
                        total: questions.length,
                        percentage: percentage,
                    });
                    setSubmitted(true);
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _g.sent();
                    alert("Erro ao enviar avaliação");
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    if (submitted && score) {
        var passed = score.percentage >= 70;
        return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md w-full mx-4">
          <CardContent className="pt-12 text-center">
            {passed ? (<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>) : (<AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>)}

            <h2 className="text-2xl font-bold text-white mb-2">
              {passed ? "Parabéns!" : "Não Aprovado"}
            </h2>

            <p className="text-slate-400 mb-6">
              Você acertou {score.correct} de {score.total} questões
            </p>

            <div className="bg-slate-700 rounded-lg p-4 mb-6">
              <p className="text-slate-400 text-sm">Sua Pontuação</p>
              <p className="text-4xl font-bold text-cyan-500">{score.percentage}%</p>
            </div>

            <Button onClick={function () { return setLocation("/"); }} className="w-full bg-cyan-600 hover:bg-cyan-700">
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>);
    }
    if (!question) {
        return (<div className="text-center py-12">
        <p className="text-slate-400">Nenhuma questão disponível.</p>
      </div>);
    }
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-white mb-2">Avaliação</h1>
          <div className="flex items-center justify-between">
            <p className="text-slate-400">
              Questão {currentQuestion + 1} de {questions.length}
            </p>
            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 transition-all" style={{ width: "".concat(((currentQuestion + 1) / questions.length) * 100, "%") }}/>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">{question.title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Alternatives */}
            <RadioGroup value={((_b = answers[question.id]) === null || _b === void 0 ? void 0 : _b.toString()) || ""} onValueChange={function (value) { return handleAnswerSelect(parseInt(value)); }}>
              <div className="space-y-3">
                {(_c = question.options) === null || _c === void 0 ? void 0 : _c.map(function (alt) { return (<div key={alt.id} className="flex items-center space-x-2 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors cursor-pointer">
                    <RadioGroupItem value={alt.id.toString()} id={"alt-".concat(alt.id)}/>
                    <Label htmlFor={"alt-".concat(alt.id)} className="flex-1 text-white cursor-pointer">
                      {alt.text}
                    </Label>
                  </div>); })}
              </div>
            </RadioGroup>

            {/* Navigation */}
            <div className="flex gap-4 pt-6">
              <Button variant="outline" disabled={currentQuestion === 0} onClick={function () { return setCurrentQuestion(Math.max(0, currentQuestion - 1)); }} className="flex-1">
                Anterior
              </Button>

              {currentQuestion < questions.length - 1 ? (<Button onClick={function () { return setCurrentQuestion(currentQuestion + 1); }} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
                  Próxima
                </Button>) : (<Button onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length} className="flex-1 bg-green-600 hover:bg-green-700">
                  Enviar Avaliação
                </Button>)}
            </div>

            {/* Progress indicator */}
            <div className="text-sm text-slate-400 text-center">
              {Object.keys(answers).length} de {questions.length} questões respondidas
            </div>
          </CardContent>
        </Card>
      </div>
    </div>);
}
