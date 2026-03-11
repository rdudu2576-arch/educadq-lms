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
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, Edit2 } from "lucide-react";
export default function AssessmentsManagement() {
    var _a = useState(null), selectedCourse = _a[0], setSelectedCourse = _a[1];
    var _b = useState(false), isOpen = _b[0], setIsOpen = _b[1];
    var _c = useState({
        title: "",
        description: "",
        type: "exam",
        passingGrade: "70",
    }), formData = _c[0], setFormData = _c[1];
    var _d = trpc.courses.list.useQuery({ limit: 100, offset: 0 }).data, courses = _d === void 0 ? [] : _d;
    var _e = trpc.assessments.getByCourse.useQuery({ courseId: selectedCourse || 0 }, { enabled: !!selectedCourse }), _f = _e.data, assessments = _f === void 0 ? [] : _f, refetchAssessments = _e.refetch;
    var createAssessmentMutation = trpc.assessments.create.useMutation({
        onSuccess: function () {
            toast.success("Avaliação criada com sucesso!");
            resetForm();
            refetchAssessments();
        },
        onError: function (error) { return toast.error("Erro: ".concat(error === null || error === void 0 ? void 0 : error.message)); },
    });
    var resetForm = function () {
        setFormData({ title: "", description: "", type: "exam", passingGrade: "70" });
        setIsOpen(false);
    };
    var handleSubmit = function () {
        if (!formData.title || !selectedCourse) {
            toast.error("Preencha os campos obrigatórios");
            return;
        }
        createAssessmentMutation.mutate({
            courseId: selectedCourse,
            title: formData.title,
            type: formData.type,
        });
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Gerenciar Avaliações</h1>
          <p className="text-slate-400">Crie e edite avaliações para seus cursos</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Course Selector */}
          <Card className="bg-slate-800 border-slate-700 h-fit">
            <CardHeader>
              <CardTitle className="text-white">Cursos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {courses === null || courses === void 0 ? void 0 : courses.map(function (course) { return (<Button key={course.id} variant={selectedCourse === course.id ? "default" : "outline"} className={"w-full justify-start ".concat(selectedCourse === course.id
                ? "bg-cyan-600 hover:bg-cyan-700"
                : "text-white border-slate-600 hover:bg-slate-700")} onClick={function () { return setSelectedCourse(course.id); }}>
                  {course.title}
                </Button>); })}
            </CardContent>
          </Card>

          {/* Assessments List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {selectedCourse ? "Avaliações" : "Selecione um curso"}
              </h2>
              {selectedCourse && (<Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={function () { return resetForm(); }} className="bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4 mr-2"/>
                      Nova Avaliação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Nova Avaliação
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-white">
                          Título *
                        </Label>
                        <Input id="title" value={formData.title} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }} placeholder="Título da avaliação" className="bg-slate-700 border-slate-600 text-white"/>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">
                          Descrição
                        </Label>
                        <Input id="description" value={formData.description} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }} placeholder="Descrição da avaliação" className="bg-slate-700 border-slate-600 text-white"/>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-white">
                          Tipo
                        </Label>
                        <Select value={formData.type} onValueChange={function (value) { return setFormData(__assign(__assign({}, formData), { type: value })); }}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            <SelectItem value="exam" className="text-white">Por Aula</SelectItem>
                            <SelectItem value="exam" className="text-white">Final</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="passingGrade" className="text-white">
                          Nota Mínima (%)
                        </Label>
                        <Input id="passingGrade" type="number" step="0.1" min="0" max="100" value={formData.passingGrade} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { passingGrade: e.target.value })); }} placeholder="70" className="bg-slate-700 border-slate-600 text-white"/>
                      </div>

                      <Button onClick={handleSubmit} disabled={createAssessmentMutation.isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                        Criar Avaliação
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>)}
            </div>

            {selectedCourse ? (<div className="space-y-3">
                {(assessments === null || assessments === void 0 ? void 0 : assessments.length) === 0 ? (<Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6 text-center text-slate-400">
                      Nenhuma avaliação criada ainda
                    </CardContent>
                  </Card>) : (assessments === null || assessments === void 0 ? void 0 : assessments.map(function (assessment) { return (<Card key={assessment.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-white">{assessment.title}</h3>
                            <p className="text-sm text-slate-400">{assessment.description}</p>
                            <div className="mt-2 flex gap-4 text-sm">
                              <span className="text-slate-400">
                                Tipo: <span className="text-white">{assessment.type === "exam" ? "Final" : "Por Aula"}</span>
                              </span>
                              <span className="text-slate-400">
                                Nota Mínima: <span className="text-white">{assessment.passingGrade}%</span>
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-white border-slate-600 hover:bg-slate-700">
                              <Edit2 className="w-4 h-4"/>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>); }))}
              </div>) : (<Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center text-slate-400">
                  Selecione um curso para gerenciar suas avaliações
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </div>);
}
