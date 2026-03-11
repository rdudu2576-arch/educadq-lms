import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, Calendar, BookOpen } from "lucide-react";

interface CompletedCourse {
  id: number;
  title: string;
  description: string;
  coverUrl: string;
  finalGrade: number;
  completedAt: Date;
  certificateUrl?: string;
  instructorName: string;
  totalHours: number;
}

interface ProgressPanelProps {
  completedCourses: CompletedCourse[];
  onDownloadCertificate?: (courseId: number) => void;
}

export function ProgressPanel({ completedCourses, onDownloadCertificate }: ProgressPanelProps) {
  if (completedCourses.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Cursos Concluídos
          </CardTitle>
          <CardDescription>Você ainda não concluiu nenhum curso</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Continue estudando para completar seus cursos e ganhar certificados!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Award className="h-6 w-6 text-amber-500" />
        <h2 className="text-2xl font-bold">Cursos Concluídos ({completedCourses.length})</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {completedCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {/* Course Cover */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
              {course.coverUrl && (
                <img
                  src={course.coverUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                />
              )}
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500 hover:bg-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Concluído
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="text-xs">{course.instructorName}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Grade Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nota Final</span>
                  <span className="text-lg font-bold text-green-600">{course.finalGrade.toFixed(1)}</span>
                </div>
                <Progress value={course.finalGrade} className="h-2" />
              </div>

              {/* Course Info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Concluído em {new Date(course.completedAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.totalHours} horas de conteúdo</span>
                </div>
              </div>

              {/* Certificate Button */}
              {course.certificateUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onDownloadCertificate?.(course.id)}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Baixar Certificado
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
