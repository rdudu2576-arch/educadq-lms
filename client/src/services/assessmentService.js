/**
 * Serviço de Avaliações
 * Gerencia operações relacionadas a avaliações e questões
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Distribuição equilibrada de respostas corretas
 * Garante que as respostas corretas sejam distribuídas uniformemente entre as alternativas
 */
export function getBalancedCorrectAnswerPosition(questionIndex, totalQuestions) {
    // Distribuição: 20% A, 20% B, 20% C, 20% D, 20% E
    var positions = [0, 1, 2, 3, 4]; // A, B, C, D, E
    return positions[questionIndex % 5];
}
/**
 * Embaralhar opções de questão mantendo a resposta correta
 */
export function shuffleQuestionOptions(options) {
    var _a;
    var shuffled = __spreadArray([], options, true);
    for (var i = shuffled.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [shuffled[j], shuffled[i]], shuffled[i] = _a[0], shuffled[j] = _a[1];
    }
    return shuffled;
}
/**
 * Calcular pontuação da avaliação
 */
export function calculateScore(correctAnswers, totalQuestions) {
    if (totalQuestions === 0)
        return 0;
    return Math.round((correctAnswers / totalQuestions) * 100);
}
/**
 * Verificar se aluno passou na avaliação
 */
export function isPassed(score, passingScore) {
    return score >= passingScore;
}
/**
 * Obter label do tipo de avaliação
 */
export function getAssessmentTypeLabel(type) {
    var labels = {
        quiz: 'Quiz',
        assignment: 'Tarefa',
        exam: 'Exame',
    };
    return labels[type] || type;
}
/**
 * Validar dados de criação de questão
 */
export function validateQuestionInput(input) {
    var errors = [];
    if (!input.title || input.title.trim().length === 0) {
        errors.push('Título da questão é obrigatório');
    }
    if (!input.type) {
        errors.push('Tipo de questão é obrigatório');
    }
    return errors;
}
/**
 * Validar dados de criação de opção de questão
 */
export function validateQuestionOptionInput(input) {
    var errors = [];
    if (!input.text || input.text.trim().length === 0) {
        errors.push('Texto da opção é obrigatório');
    }
    return errors;
}
/**
 * Formatar tempo restante para exibição
 */
export function formatTimeRemaining(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var secs = seconds % 60;
    if (hours > 0) {
        return "".concat(hours, "h ").concat(minutes, "m ").concat(secs, "s");
    }
    else if (minutes > 0) {
        return "".concat(minutes, "m ").concat(secs, "s");
    }
    else {
        return "".concat(secs, "s");
    }
}
/**
 * Verificar se tempo está acabando (menos de 5 minutos)
 */
export function isTimeRunningOut(seconds) {
    return seconds < 300; // 5 minutos
}
/**
 * Gerar feedback baseado na pontuação
 */
export function generateFeedback(score, passingScore) {
    if (score >= passingScore + 20) {
        return 'Excelente desempenho! Você dominou bem este conteúdo.';
    }
    else if (score >= passingScore) {
        return 'Parabéns! Você foi aprovado nesta avaliação.';
    }
    else if (score >= passingScore - 10) {
        return 'Você ficou perto de passar. Revise o conteúdo e tente novamente.';
    }
    else {
        return 'Você não foi aprovado. Revise o conteúdo e tente novamente.';
    }
}
/**
 * Calcular progresso de avaliação
 */
export function calculateAssessmentProgress(answeredQuestions, totalQuestions) {
    if (totalQuestions === 0)
        return 0;
    return Math.round((answeredQuestions / totalQuestions) * 100);
}
