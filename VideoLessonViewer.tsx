import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { extractYouTubeId } from '@/services/lessonService';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';

interface VideoLessonViewerProps {
  title: string;
  videoUrl: string;
  description?: string;
  durationMinutes?: number;
  onProgress?: (watchedMinutes: number) => void;
  onComplete?: () => void;
}

export function VideoLessonViewer({
  title,
  videoUrl,
  description,
  durationMinutes = 0,
  onProgress,
  onComplete,
}: VideoLessonViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watchedMinutes, setWatchedMinutes] = useState(0);

  const youtubeId = extractYouTubeId(videoUrl);

  useEffect(() => {
    if (!onProgress) return;

    const interval = setInterval(() => {
      setWatchedMinutes(prev => {
        const newValue = prev + 0.5;
        onProgress(newValue);

        // Verificar se vídeo foi assistido (80% do tempo)
        if (durationMinutes > 0 && newValue >= durationMinutes * 0.8 && onComplete) {
          onComplete();
        }

        return newValue;
      });

      setProgress(prev => Math.min(prev + (100 / (durationMinutes * 120)), 100));
    }, 500);

    return () => clearInterval(interval);
  }, [durationMinutes, onProgress, onComplete]);

  if (!youtubeId) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            URL do YouTube inválida
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <iframe
            ref={iframeRef}
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        {/* Progress Bar */}
        {durationMinutes > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>{watchedMinutes.toFixed(1)}min</span>
              <span>{durationMinutes}min</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-slate-300 border-slate-600 hover:bg-slate-700"
          >
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-slate-300 border-slate-600 hover:bg-slate-700 ml-auto"
          >
            <Maximize className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
