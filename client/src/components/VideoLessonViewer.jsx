import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { extractYouTubeId } from '@/services/lessonService';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';
export function VideoLessonViewer(_a) {
    var title = _a.title, videoUrl = _a.videoUrl, description = _a.description, _b = _a.durationMinutes, durationMinutes = _b === void 0 ? 0 : _b, onProgress = _a.onProgress, onComplete = _a.onComplete;
    var iframeRef = useRef(null);
    var _c = useState(false), isPlaying = _c[0], setIsPlaying = _c[1];
    var _d = useState(0), progress = _d[0], setProgress = _d[1];
    var _e = useState(0), watchedMinutes = _e[0], setWatchedMinutes = _e[1];
    var youtubeId = extractYouTubeId(videoUrl);
    useEffect(function () {
        if (!onProgress)
            return;
        var interval = setInterval(function () {
            setWatchedMinutes(function (prev) {
                var newValue = prev + 0.5;
                onProgress(newValue);
                // Verificar se vídeo foi assistido (80% do tempo)
                if (durationMinutes > 0 && newValue >= durationMinutes * 0.8 && onComplete) {
                    onComplete();
                }
                return newValue;
            });
            setProgress(function (prev) { return Math.min(prev + (100 / (durationMinutes * 120)), 100); });
        }, 500);
        return function () { return clearInterval(interval); };
    }, [durationMinutes, onProgress, onComplete]);
    if (!youtubeId) {
        return (<Card className="bg-slate-800 border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            URL do YouTube inválida
          </div>
        </CardContent>
      </Card>);
    }
    return (<Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">{title}</CardTitle>
        {description && <CardDescription className="text-slate-400">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Video Player */}
        <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
          <iframe ref={iframeRef} className="absolute top-0 left-0 w-full h-full" src={"https://www.youtube.com/embed/".concat(youtubeId, "?rel=0&modestbranding=1")} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
        </div>

        {/* Progress Bar */}
        {durationMinutes > 0 && (<div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-400">
              <span>{watchedMinutes.toFixed(1)}min</span>
              <span>{durationMinutes}min</span>
            </div>
            <Progress value={progress} className="h-2"/>
          </div>)}

        {/* Controls */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700" onClick={function () { return setIsPlaying(!isPlaying); }}>
            {isPlaying ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
          </Button>
          <Button size="sm" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700">
            <Volume2 className="w-4 h-4"/>
          </Button>
          <Button size="sm" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700 ml-auto">
            <Maximize className="w-4 h-4"/>
          </Button>
        </div>
      </CardContent>
    </Card>);
}
