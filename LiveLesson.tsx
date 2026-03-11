import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Clock, ExternalLink } from "lucide-react";

interface Props {
  meetLink: string;
  startTime?: string;
  title?: string;
}

export default function LiveLesson({ meetLink, startTime, title }: Props) {
  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Video className="w-5 h-5 text-cyan-500" />
          {title || "Aula ao Vivo"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {startTime && (
          <div className="flex items-center gap-2 text-slate-400">
            <Clock className="w-4 h-4" />
            <span>Horário: {startTime}</span>
          </div>
        )}
        <p className="text-slate-300 text-sm">
          Clique no botão abaixo para entrar na sala do Google Meet.
        </p>
        <Button
          asChild
          className="bg-cyan-600 hover:bg-cyan-700 w-full"
        >
          <a href={meetLink} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Entrar na Aula
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
