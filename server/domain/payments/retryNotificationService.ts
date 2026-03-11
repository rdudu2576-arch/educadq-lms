import { TRPCError } from "@trpc/server";
import * as db from "../../infra/db.js";
import { notifyOwner } from "../../_core/notification.js";

export interface NotificationChannels {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

export class RetryNotificationService {
  /**
   * Enviar notificação de falha de pagamento
   */
  static async notifyPaymentFailed(
    studentId: number,
    amount: string,
    retryCount: number,
    nextRetryTime: Date,
    channels: NotificationChannels = {
      email: true,
      sms: false,
      push: true,
      inApp: true,
    }
  ): Promise<void> {
    try {
      const hoursUntilRetry = Math.round(
        (nextRetryTime.getTime() - new Date().getTime()) / (1000 * 60 * 60)
      );

      const messages = {
        email: {
          subject: "Seu pagamento não foi processado",
          body: `
            <h2>Pagamento Pendente</h2>
            <p>Sua tentativa de pagamento de R$ ${amount} não foi processada.</p>
            <p>Não se preocupe! Tentaremos novamente em ${hoursUntilRetry} hora(s).</p>
            <p>Tentativa ${retryCount} de 5</p>
            <p>Se o problema persistir, entre em contato com nosso suporte.</p>
          `,
        },
        sms: {
          message: `EducaDQ: Seu pagamento de R$ ${amount} não foi processado. Tentaremos novamente em ${hoursUntilRetry}h. Suporte: 41 98891-3431`,
        },
        push: {
          title: "Pagamento Pendente",
          body: `Tentaremos processar seu pagamento novamente em ${hoursUntilRetry} hora(s).`,
        },
        inApp: {
          title: "Pagamento Pendente",
          message: `Sua tentativa de pagamento falhou. Tentaremos novamente em ${hoursUntilRetry} hora(s).`,
          type: "warning",
        },
      };

      // Enviar por email
      if (channels.email) {
        await this.sendEmailNotification(studentId, messages.email);
      }

      // Enviar SMS
      if (channels.sms) {
        await this.sendSmsNotification(studentId, messages.sms);
      }

      // Enviar push
      if (channels.push) {
        await this.sendPushNotification(studentId, messages.push);
      }

      // Enviar in-app
      if (channels.inApp) {
        await this.sendInAppNotification(studentId, messages.inApp);
      }
    } catch (error) {
      console.error("[Notification Service] Error sending payment failed notification:", error);
    }
  }

  /**
   * Enviar notificação de pagamento recuperado
   */
  static async notifyPaymentRecovered(
    studentId: number,
    amount: string,
    retryCount: number
  ): Promise<void> {
    try {
      const messages = {
        email: {
          subject: "Seu pagamento foi confirmado!",
          body: `
            <h2>Pagamento Confirmado</h2>
            <p>Ótimas notícias! Seu pagamento de R$ ${amount} foi processado com sucesso após ${retryCount} tentativa(s).</p>
            <p>Você agora tem acesso ao curso.</p>
            <p>Aproveite sua formação!</p>
          `,
        },
        push: {
          title: "Pagamento Confirmado!",
          body: `Seu pagamento de R$ ${amount} foi confirmado. Acesso ao curso liberado!`,
        },
        inApp: {
          title: "Sucesso!",
          message: `Seu pagamento foi confirmado. Você agora tem acesso ao curso.`,
          type: "success",
        },
      };

      await this.sendEmailNotification(studentId, messages.email);
      await this.sendPushNotification(studentId, messages.push);
      await this.sendInAppNotification(studentId, messages.inApp);
    } catch (error) {
      console.error("[Notification Service] Error sending payment recovered notification:", error);
    }
  }

  /**
   * Enviar notificação de pagamento abandonado
   */
  static async notifyPaymentAbandoned(
    studentId: number,
    amount: string,
    maxRetries: number
  ): Promise<void> {
    try {
      const messages = {
        email: {
          subject: "Seu pagamento não pôde ser processado",
          body: `
            <h2>Pagamento Não Processado</h2>
            <p>Infelizmente, seu pagamento de R$ ${amount} não pôde ser processado após ${maxRetries} tentativas.</p>
            <p>Por favor, tente novamente ou entre em contato com nosso suporte.</p>
            <p>WhatsApp: 41 98891-3431</p>
          `,
        },
        sms: {
          message: `EducaDQ: Seu pagamento de R$ ${amount} não pôde ser processado. Tente novamente ou contate: 41 98891-3431`,
        },
        push: {
          title: "Ação Necessária",
          body: `Seu pagamento não pôde ser processado. Por favor, tente novamente.`,
        },
        inApp: {
          title: "Pagamento Não Processado",
          message: `Seu pagamento não pôde ser processado após várias tentativas. Por favor, tente novamente ou entre em contato com o suporte.`,
          type: "error",
        },
      };

      await this.sendEmailNotification(studentId, messages.email);
      await this.sendSmsNotification(studentId, messages.sms);
      await this.sendPushNotification(studentId, messages.push);
      await this.sendInAppNotification(studentId, messages.inApp);
    } catch (error) {
      console.error("[Notification Service] Error sending payment abandoned notification:", error);
    }
  }

  /**
   * Notificar admin sobre falha crítica
   */
  static async notifyAdminCriticalFailure(
    studentId: number,
    amount: string,
    error: string,
    retryCount: number
  ): Promise<void> {
    try {
      await notifyOwner({
        title: "Falha Crítica de Pagamento",
        content: `
Aluno ID: ${studentId}
Valor: R$ ${amount}
Tentativas: ${retryCount}
Erro: ${error}

Ação recomendada: Verificar configuração do provedor de pagamento.
        `,
      });
    } catch (error) {
      console.error("[Notification Service] Error notifying admin:", error);
    }
  }

  private static async sendEmailNotification(
    studentId: number,
    message: { subject: string; body: string }
  ): Promise<void> {
    try {
      // Buscar email do aluno
      // const student = await db.getStudentById(studentId);
      // if (!student?.email) return;

      // Enviar email via serviço de email
      console.log(`[Email] Sending to student ${studentId}: ${message.subject}`);

      // Implementar integração com serviço de email (SendGrid, AWS SES, etc)
      // await emailService.send({
      //   to: student.email,
      //   subject: message.subject,
      //   html: message.body,
      // });

      // Registrar notificação
      // await db.createRetryNotification({
      //   studentId,
      //   type: "email",
      //   status: "sent",
      //   message: message.subject,
      // });
    } catch (error) {
      console.error("[Email Service] Error sending email:", error);
    }
  }

  private static async sendSmsNotification(
    studentId: number,
    message: { message: string }
  ): Promise<void> {
    try {
      // Buscar telefone do aluno
      // const student = await db.getStudentById(studentId);
      // if (!student?.phone) return;

      console.log(`[SMS] Sending to student ${studentId}: ${message.message}`);

      // Implementar integração com serviço de SMS (Twilio, AWS SNS, etc)
      // await smsService.send({
      //   to: student.phone,
      //   message: message.message,
      // });

      // Registrar notificação
      // await db.createRetryNotification({
      //   studentId,
      //   type: "sms",
      //   status: "sent",
      //   message: message.message,
      // });
    } catch (error) {
      console.error("[SMS Service] Error sending SMS:", error);
    }
  }

  private static async sendPushNotification(
    studentId: number,
    message: { title: string; body: string }
  ): Promise<void> {
    try {
      console.log(`[Push] Sending to student ${studentId}: ${message.title}`);

      // Implementar integração com Firebase Cloud Messaging ou similar
      // await pushService.send({
      //   userId: studentId,
      //   title: message.title,
      //   body: message.body,
      // });

      // Registrar notificação
      // await db.createRetryNotification({
      //   studentId,
      //   type: "push",
      //   status: "sent",
      //   message: message.title,
      // });
    } catch (error) {
      console.error("[Push Service] Error sending push:", error);
    }
  }

  private static async sendInAppNotification(
    studentId: number,
    message: { title: string; message: string; type: string }
  ): Promise<void> {
    try {
      console.log(`[In-App] Sending to student ${studentId}: ${message.title}`);

      // Criar notificação in-app no banco de dados
      // await db.createInAppNotification({
      //   studentId,
      //   title: message.title,
      //   message: message.message,
      //   type: message.type,
      //   read: false,
      // });

      // Registrar notificação
      // await db.createRetryNotification({
      //   studentId,
      //   type: "in_app",
      //   status: "sent",
      //   message: message.title,
      // });
    } catch (error) {
      console.error("[In-App Service] Error creating in-app notification:", error);
    }
  }
}
