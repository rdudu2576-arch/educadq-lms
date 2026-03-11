/**
 * Serviço de Aulas
 * Gerencia operações relacionadas a aulas (video, live, text, material)
 */

export type LessonType = 'video' | 'live' | 'text' | 'material';

export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  description?: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  liveUrl?: string;
  order: number;
  durationMinutes?: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LessonMaterial {
  id: number;
  lessonId: number;
  title: string;
  type: 'pdf' | 'document' | 'spreadsheet' | 'video' | 'link';
  url: string;
  fileSize?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLessonInput {
  moduleId: number;
  title: string;
  description?: string;
  type: LessonType;
  content?: string;
  videoUrl?: string;
  liveUrl?: string;
  order: number;
  durationMinutes?: number;
}

export interface UpdateLessonInput {
  title?: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  liveUrl?: string;
  order?: number;
  durationMinutes?: number;
  isPublished?: boolean;
}

export interface AddMaterialInput {
  lessonId: number;
  title: string;
  type: 'pdf' | 'document' | 'spreadsheet' | 'video' | 'link';
  url: string;
  fileSize?: number;
}

/**
 * Validar URL do YouTube
 */
export function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
  return youtubeRegex.test(url);
}

/**
 * Extrair ID do vídeo YouTube
 */
export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

/**
 * Validar URL do Google Meet
 */
export function isValidGoogleMeetUrl(url: string): boolean {
  return /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(url);
}

/**
 * Validar URL do Google Drive
 */
export function isValidGoogleDriveUrl(url: string): boolean {
  return /^https:\/\/drive\.google\.com\//.test(url);
}

/**
 * Formatar duração em minutos para string legível
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

/**
 * Obter ícone baseado no tipo de aula
 */
export function getLessonTypeIcon(type: LessonType): string {
  const icons: Record<LessonType, string> = {
    video: '🎥',
    live: '📹',
    text: '📝',
    material: '📎',
  };
  return icons[type];
}

/**
 * Obter label baseado no tipo de aula
 */
export function getLessonTypeLabel(type: LessonType): string {
  const labels: Record<LessonType, string> = {
    video: 'Vídeo (YouTube)',
    live: 'Aula ao Vivo (Google Meet)',
    text: 'Aula de Texto',
    material: 'Material Complementar',
  };
  return labels[type];
}

/**
 * Validar dados de criação de aula
 */
export function validateLessonInput(input: CreateLessonInput): string[] {
  const errors: string[] = [];

  if (!input.title || input.title.trim().length === 0) {
    errors.push('Título da aula é obrigatório');
  }

  if (!input.type) {
    errors.push('Tipo de aula é obrigatório');
  }

  switch (input.type) {
    case 'video':
      if (!input.videoUrl) {
        errors.push('URL do vídeo é obrigatória');
      } else if (!isValidYouTubeUrl(input.videoUrl)) {
        errors.push('URL do YouTube inválida');
      }
      break;

    case 'live':
      if (!input.liveUrl) {
        errors.push('URL da aula ao vivo é obrigatória');
      } else if (!isValidGoogleMeetUrl(input.liveUrl)) {
        errors.push('URL do Google Meet inválida');
      }
      break;

    case 'text':
      if (!input.content || input.content.trim().length === 0) {
        errors.push('Conteúdo da aula é obrigatório');
      }
      break;

    case 'material':
      if (!input.content || input.content.trim().length === 0) {
        errors.push('Descrição do material é obrigatória');
      }
      break;
  }

  return errors;
}

/**
 * Calcular progresso de aula baseado em tempo assistido
 */
export function calculateLessonProgress(watchedMinutes: number, totalMinutes: number): number {
  if (totalMinutes === 0) return 0;
  const progress = (watchedMinutes / totalMinutes) * 100;
  return Math.min(Math.round(progress), 100);
}

/**
 * Verificar se aula está completa
 */
export function isLessonComplete(watchedMinutes: number, totalMinutes: number, threshold = 0.8): boolean {
  if (totalMinutes === 0) return true;
  return watchedMinutes >= totalMinutes * threshold;
}
