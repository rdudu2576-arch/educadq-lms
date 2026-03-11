              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold">{formData.title || "Título do Curso"}</h3>
                  <p className="text-slate-400 text-sm mt-2">{formData.description || "Descrição do curso"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-white text-sm">
                    <strong>{formData.courseHours || "0"} horas</strong>
                  </p>
                  <p className="text-cyan-400 text-lg font-bold">
                    R$ {parseFloat(formData.price || "0").toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Lessons Section */}
        <div className="mt-0">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Aulas do Curso</CardTitle>
              <CardDescription className="text-slate-400">Gerenciar aulas (vídeo, texto, ao vivo)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLessonDialogOpen ? (
                <Card className="bg-slate-700 border-slate-600 p-4 mb-4">
                  <CardHeader>
                    <CardTitle className="text-white">
                      {editingLesson ? "Editar Aula" : "Nova Aula"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      console.log('[DEBUG] Form submitted');
                      await handleLessonSubmit();
                    }} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="lesson-title" className="text-white">
                        Título *
                      </Label>
                      <Input
                        id="lesson-title"
                        value={lessonFormData.title}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                        placeholder="Título da aula"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lesson-type" className="text-white">
                        Tipo de Aula
                      </Label>
                      <Select value={lessonFormData.type} onValueChange={(value: any) => setLessonFormData({ ...lessonFormData, type: value })}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="text" className="text-white">Texto</SelectItem>
                          <SelectItem value="video" className="text-white">Vídeo (YouTube)</SelectItem>
                          <SelectItem value="live" className="text-white">Ao Vivo (Google Meet)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {lessonFormData.type === "text" && (
                      <div className="space-y-2">
                        <Label htmlFor="lesson-content" className="text-white">
                          Conteúdo
                        </Label>
                        <Textarea
                          id="lesson-content"
                          value={lessonFormData.content}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                          placeholder="Conteúdo da aula..."
                          className="bg-slate-700 border-slate-600 text-white"
                          rows={4}
                        />
                      </div>
                    )}

                    {lessonFormData.type === "video" && (
                      <div className="space-y-2">
                        <Label htmlFor="lesson-video" className="text-white">
                          URL do Vídeo (YouTube)
                        </Label>
                        <Input
                          id="lesson-video"
                          value={lessonFormData.videoUrl}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, videoUrl: e.target.value })}
                          placeholder="https://youtube.com/watch?v=..."
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    )}

                    {lessonFormData.type === "live" && (
                      <div className="space-y-2">
                        <Label htmlFor="lesson-live" className="text-white">
                          URL da Aula ao Vivo (Google Meet)
                        </Label>
                        <Input
                          id="lesson-live"
                          value={lessonFormData.liveUrl}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, liveUrl: e.target.value })}
                          placeholder="https://meet.google.com/..."
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    )}

                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          disabled={createLessonMutation.isPending || updateLessonMutation.isPending}
                          className="flex-1 bg-cyan-600 hover:bg-cyan-700"