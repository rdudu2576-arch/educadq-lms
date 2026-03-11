import React from "react";

interface Props {
  youtubeUrl?: string;
}

function extractVideoId(url: string): string | null {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  // Fallback: try v= parameter
  const urlObj = new URL(url);
  return urlObj.searchParams.get("v");
}

export default function LessonPlayer({ youtubeUrl }: Props) {
  if (!youtubeUrl) return null;

  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
        <p className="text-slate-400">URL do vídeo inválida.</p>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
        title="Vídeo aula"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="border-0"
      />
    </div>
  );
}
