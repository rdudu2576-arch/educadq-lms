import nodemailer from "nodemailer";

/**
 * Email Notification Service
 * Gerencia envio de emails para alunos, professores e administradores
 */

// Configurar transportador de email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Envia um email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn("[Email] SMTP não configurado. Email não será enviado.");
      return false;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER || "noreply@educadq.com",
      ...options,
    });

    console.log(`[Email] Email enviado para ${options.to}`);
    return true;
  } catch (error) {
    console.error("[Email] Erro ao enviar email:", error);
    return false;
  }
}

/**
 * Email de boas-vindas para novo aluno
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Bem-vindo à EducaDQ!</h2>
      <p>Olá ${name},</p>
      <p>Sua conta foi criada com sucesso. Você agora pode acessar todos os cursos disponíveis na plataforma.</p>
      <p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/login" 
           style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">
          Acessar Plataforma
        </a>
      </p>
      <p>Se tiver dúvidas, entre em contato conosco.</p>
      <p>Atenciosamente,<br>Equipe EducaDQ</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Bem-vindo à EducaDQ!",
    html,
  });
}

/**
 * Email de confirmação de matrícula
 */
export async function sendEnrollmentConfirmationEmail(
  email: string,
  studentName: string,
  courseName: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Matrícula Confirmada!</h2>
      <p>Olá ${studentName},</p>
      <p>Você foi matriculado com sucesso no curso <strong>${courseName}</strong>.</p>
      <p>Você agora pode acessar todas as aulas e materiais do curso.</p>
      <p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/courses" 
           style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">
          Acessar Curso
        </a>
      </p>
      <p>Bom aprendizado!<br>Equipe EducaDQ</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Matrícula Confirmada - ${courseName}`,
    html,
  });
}

/**
 * Email de pagamento confirmado
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  studentName: string,
  amount: number,
  courseName: string,
  transactionId: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Pagamento Confirmado!</h2>
      <p>Olá ${studentName},</p>
      <p>Seu pagamento foi processado com sucesso.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Curso:</strong> ${courseName}</p>
        <p><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
        <p><strong>ID da Transação:</strong> ${transactionId}</p>
      </div>
      <p>Você agora tem acesso ao curso. Clique no botão abaixo para começar.</p>
      <p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/courses/${courseName}" 
           style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">
          Acessar Curso
        </a>
      </p>
      <p>Obrigado!<br>Equipe EducaDQ</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Pagamento Confirmado",
    html,
  });
}

/**
 * Email de aviso de pagamento vencido
 */
export async function sendOverduePaymentEmail(
  email: string,
  studentName: string,
  amount: number,
  dueDate: Date,
  pixKey?: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Aviso de Pagamento Vencido</h2>
      <p>Olá ${studentName},</p>
      <p>Você tem uma parcela vencida que precisa ser paga.</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ef4444;">
        <p><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
        <p><strong>Data de Vencimento:</strong> ${dueDate.toLocaleDateString("pt-BR")}</p>
        ${pixKey ? `<p><strong>Chave PIX:</strong> ${pixKey}</p>` : ""}
      </div>
      <p>Por favor, efetue o pagamento o mais breve possível para não perder o acesso ao curso.</p>
      <p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/payments" 
           style="display: inline-block; padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px;">
          Pagar Agora
        </a>
      </p>
      <p>Se tiver dúvidas, entre em contato conosco.</p>
      <p>Atenciosamente,<br>Equipe EducaDQ</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Aviso de Pagamento Vencido",
    html,
  });
}

/**
 * Email de conclusão de curso
 */
export async function sendCourseCompletionEmail(
  email: string,
  studentName: string,
  courseName: string,
  certificateUrl?: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Parabéns! Curso Concluído!</h2>
      <p>Olá ${studentName},</p>
      <p>Você concluiu com sucesso o curso <strong>${courseName}</strong>!</p>
      <p>Sua dedicação e esforço foram recompensados. Você agora é um especialista nesta área.</p>
      ${
        certificateUrl
          ? `<p>
        <a href="${certificateUrl}" 
           style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">
          Baixar Certificado
        </a>
      </p>`
          : ""
      }
      <p>Continue aprendendo com nossos outros cursos!</p>
      <p>Atenciosamente,<br>Equipe EducaDQ</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Parabéns! Você concluiu ${courseName}`,
    html,
  });
}

/**
 * Email de nova aula disponível
 */
export async function sendNewLessonEmail(
  email: string,
  studentName: string,
  courseName: string,
  lessonTitle: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Nova Aula Disponível!</h2>
      <p>Olá ${studentName},</p>
      <p>Uma nova aula foi adicionada ao curso <strong>${courseName}</strong>.</p>
      <p><strong>Aula:</strong> ${lessonTitle}</p>
      <p>
        <a href="${process.env.FRONTEND_URL || "http://localhost:3000"}/courses/${courseName}" 
           style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">
          Assistir Aula
        </a>
      </p>
      <p>Não perca!</p>
      <p>Atenciosamente,<br>Equipe EducaDQ</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Nova aula em ${courseName}`,
    html,
  });
}

/**
 * Email de recuperação de senha
 */
export async function sendPasswordResetEmail(
  email: string,
  resetLink: string
): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Recuperar Senha</h2>
      <p>Recebemos uma solicitação para redefinir sua senha.</p>
      <p>Clique no botão abaixo para criar uma nova senha:</p>
      <p>
        <a href="${resetLink}" 
           style="display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px;">
          Redefinir Senha
        </a>
      </p>
      <p>Este link expira em 1 hora.</p>
      <p>Se você não solicitou isso, ignore este email.</p>
      <p>Atenciosamente,<br>Equipe EducaDQ</p>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Recuperar Senha - EducaDQ",
    html,
  });
}

/**
 * Email para administrador - Nova venda
 */
export async function sendAdminNewSaleEmail(
  studentName: string,
  courseName: string,
  amount: number
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || "admin@educadq.com";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Nova Venda!</h2>
      <p>Uma nova venda foi registrada na plataforma.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Aluno:</strong> ${studentName}</p>
        <p><strong>Curso:</strong> ${courseName}</p>
        <p><strong>Valor:</strong> R$ ${amount.toFixed(2)}</p>
        <p><strong>Data:</strong> ${new Date().toLocaleDateString("pt-BR")}</p>
      </div>
      <p>Acesse o painel administrativo para mais detalhes.</p>
    </div>
  `;

  return sendEmail({
    to: adminEmail,
    subject: "Nova Venda - EducaDQ",
    html,
  });
}
