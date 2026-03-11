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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Plus, FileText, Download } from "lucide-react";
export default function MaterialsManagement() {
    var _a = useState(null), selectedCourse = _a[0], setSelectedCourse = _a[1];
    var _b = useState(false), isOpen = _b[0], setIsOpen = _b[1];
    var _c = useState({
        title: "",
        url: "",
    }), formData = _c[0], setFormData = _c[1];
    var _d = trpc.courses.list.useQuery({ limit: 100, offset: 0 }).data, courses = _d === void 0 ? [] : _d;
    // Materiais são gerenciados através de aulas, então vamos usar um estado local
    var _e = useState([]), materials = _e[0], setMaterials = _e[1];
    // Placeholder para criar material
    var createMaterialMutation = {
        mutate: function (data) {
            toast.success("Material criado com sucesso!");
            resetForm();
            setMaterials(__spreadArray(__spreadArray([], materials, true), [__assign({ id: Date.now() }, data)], false));
        },
        isPending: false,
    };
    var resetForm = function () {
        setFormData({ title: "", url: "" });
        setIsOpen(false);
    };
    var handleSubmit = function () {
        if (!formData.title || !formData.url || !selectedCourse) {
            toast.error("Preencha todos os campos");
            return;
        }
        createMaterialMutation.mutate({
            title: formData.title,
            url: formData.url,
        });
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-white">Gerenciar Materiais</h1>
          <p className="text-slate-400">Adicione materiais complementares do Google Drive</p>
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

          {/* Materials List */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {selectedCourse ? "Materiais" : "Selecione um curso"}
              </h2>
              {selectedCourse && (<Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={function () { return resetForm(); }} className="bg-cyan-600 hover:bg-cyan-700">
                      <Plus className="w-4 h-4 mr-2"/>
                      Novo Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Novo Material Complementar
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-white">
                          Título *
                        </Label>
                        <Input id="title" value={formData.title} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }} placeholder="Ex: Apostila Completa" className="bg-slate-700 border-slate-600 text-white"/>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="url" className="text-white">
                          URL do Google Drive *
                        </Label>
                        <Input id="url" value={formData.url} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { url: e.target.value })); }} placeholder="https://drive.google.com/..." className="bg-slate-700 border-slate-600 text-white"/>
                        <p className="text-xs text-slate-400">
                          Compartilhe o arquivo no Google Drive e cole o link aqui
                        </p>
                      </div>

                      <Button onClick={handleSubmit} disabled={createMaterialMutation.isPending} className="w-full bg-cyan-600 hover:bg-cyan-700">
                        Adicionar Material
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>)}
            </div>

            {selectedCourse ? (<div className="space-y-3">
                {(materials === null || materials === void 0 ? void 0 : materials.length) === 0 ? (<Card className="bg-slate-800 border-slate-700">
                    <CardContent className="pt-6 text-center text-slate-400">
                      Nenhum material adicionado ainda
                    </CardContent>
                  </Card>) : (materials === null || materials === void 0 ? void 0 : materials.map(function (material) { return (<Card key={material.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <FileText className="w-5 h-5 text-cyan-500"/>
                            <div className="flex-1">
                              <h3 className="font-semibold text-white">{material.title}</h3>
                              <p className="text-sm text-slate-400 truncate">{material.url}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={function () { return window.open(material.url, "_blank"); }} className="text-white border-slate-600 hover:bg-slate-700">
                              <Download className="w-4 h-4"/>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>); }))}
              </div>) : (<Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-6 text-center text-slate-400">
                  Selecione um curso para gerenciar seus materiais
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>
    </div>);
}
