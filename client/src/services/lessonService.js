/**
 * Serviço de Aulas
 * Gerencia operações relacionadas a aulas (video, live, text, material)
 */
/**
 * Validar URL do YouTube
 */
export function isValidYouTubeUrl(url) {
    var youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
    return youtubeRegex.test(url);
}
/**
 * Extrair ID do vídeo YouTube
 */
export function extractYouTubeId(url) {
    var match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
}
/**
 * Validar URL do Google Meet
 */
export function isValidGoogleMeetUrl(url) {
    return /^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}/.test(url);
}
/**
 * Validar URL do Google Drive
 */
export function isValidGoogleDriveUrl(url) {
    return /^https:\/\/drive\.google\.com\//.test(url);
}
/**
 * Formatar duração em minutos para string legível
 */
export function formatDuration(minutes) {
    if (minutes < 60) {
        return "".concat(minutes, "min");
    }
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    return mins > 0 ? "".concat(hours, "h ").concat(mins, "min") : "".concat(hours, "h");
}
/**
 * Obter ícone baseado no tipo de aula
 */
export function getLessonTypeIcon(type) {
    var icons = {
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
export function getLessonTypeLabel(type) {
    var labels = {
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
export function validateLessonInput(input) {
    var errors = [];
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
            }
            else if (!isValidYouTubeUrl(input.videoUrl)) {
                errors.push('URL do YouTube inválida');
            }
            break;
        case 'live':
            if (!input.liveUrl) {
                errors.push('URL da aula ao vivo é obrigatória');
            }
            else if (!isValidGoogleMeetUrl(input.liveUrl)) {
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
export function calculateLessonProgress(watchedMinutes, totalMinutes) {
    if (totalMinutes === 0)
        return 0;
    var progress = (watchedMinutes / totalMinutes) * 100;
    return Math.min(Math.round(progress), 100);
}
/**
 * Verificar se aula está completa
 */
export function isLessonComplete(watchedMinutes, totalMinutes, threshold) {
    if (threshold === void 0) { threshold = 0.8; }
    if (totalMinutes === 0)
        return true;
    return watchedMinutes >= totalMinutes * threshold;
}
