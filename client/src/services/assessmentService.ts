/**
 * Serviço de Avaliações
 * Gerencia operações relacionadas a avaliações e questões
 */

export interface Question {
  id: number;
  assessmentId: number;
  title: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionOption {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
  order: number;
  createdAt: Date;
}

export interface Assessment {
  id: number;
  lessonId?: number;
  courseId?: number;
  title: string;
  description?: string;
  type: 'quiz' | 'assignment' | 'exam';
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssessmentInput {
  lessonId?: number;
  courseId?: number;
  title: string;
  description?: string;
  type: 'quiz' | 'assignment' | 'exam';
  passingScore?: number;
  maxAttempts?: number;
  timeLimit?: number;
}

export interface CreateQuestionInput {
  assessmentId: number;
  title: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  order: number;
}

export interface CreateQuestionOptionInput {
  questionId: number;
  text: string;
  isCorrect: boolean;
  order: number;
}

/**
 * Distribuição equilibrada de respostas corretas
 * Garante que as respostas corretas sejam distribuídas uniformemente entre as alternativas
 */
export function getBalancedCorrectAnswerPosition(questionIndex: number, totalQuestions: number): number {
  // Distribuição: 20% A, 20% B, 20% C, 20% D, 20% E
  const positions = [0, 1, 2, 3, 4]; // A, B, C, D, E
  return positions[questionIndex % 5];
}

/**
 * Embaralhar opções de questão mantendo a resposta correta
 */
export function shuffleQuestionOptions(options: QuestionOption[]): QuestionOption[] {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calcular pontuação da avaliação
 */
export function calculateScore(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

/**
 * Verificar se aluno passou na avaliação
 */
export function isPassed(score: number, passingScore: number): boolean {
  return score >= passingScore;
}

/**
 * Obter label do tipo de avaliação
 */
export function getAssessmentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    quiz: 'Quiz',
    assignment: 'Tarefa',
    exam: 'Exame',
  };
  return labels[type] || type;
}

/**
 * Validar dados de criação de questão
 */
export function validateQuestionInput(input: CreateQuestionInput): string[] {
  const errors: string[] = [];

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
export function validateQuestionOptionInput(input: CreateQuestionOptionInput): string[] {
  const errors: string[] = [];

  if (!input.text || input.text.trim().length === 0) {
    errors.push('Texto da opção é obrigatório');
  }

  return errors;
}

/**
 * Formatar tempo restante para exibição
 */
export function formatTimeRemaining(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Verificar se tempo está acabando (menos de 5 minutos)
 */
export function isTimeRunningOut(seconds: number): boolean {
  return seconds < 300; // 5 minutos
}

/**
 * Gerar feedback baseado na pontuação
 */
export function generateFeedback(score: number, passingScore: number): string {
  if (score >= passingScore + 20) {
    return 'Excelente desempenho! Você dominou bem este conteúdo.';
  } else if (score >= passingScore) {
    return 'Parabéns! Você foi aprovado nesta avaliação.';
  } else if (score >= passingScore - 10) {
    return 'Você ficou perto de passar. Revise o conteúdo e tente novamente.';
  } else {
    return 'Você não foi aprovado. Revise o conteúdo e tente novamente.';
  }
}

/**
 * Calcular progresso de avaliação
 */
export function calculateAssessmentProgress(answeredQuestions: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((answeredQuestions / totalQuestions) * 100);
}
