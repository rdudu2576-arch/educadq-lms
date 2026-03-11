      trailerUrl: formData.trailerUrl || "",
      professorId: 1,
      lessons: lessons.map((l) => ({
        title: l.title,
        type: l.type,
        content: l.content,
        videoUrl: l.videoUrl,
        liveUrl: l.liveUrl,
        order: l.order,
      })),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Novo Curso</h1>
          <p className="text-slate-400">Crie um novo curso com suas aulas</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Informações do Curso</CardTitle>
              <CardDescription className="text-slate-400">
                Preencha os dados básicos do curso
              </CardDescription>
            </CardHeader>