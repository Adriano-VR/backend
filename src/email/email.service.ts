import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private isConfigured = false;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      this.logger.warn('⚠️ SENDGRID_API_KEY não configurada - emails não serão enviados');
      this.isConfigured = false;
      return;
    }
    
    try {
      sgMail.setApiKey(apiKey);
      this.isConfigured = true;
      this.logger.log('✅ SendGrid configurado com sucesso');
    } catch (error) {
      this.logger.error('❌ Erro ao configurar SendGrid:', error);
      this.isConfigured = false;
    }
  }

  private loadTemplate(templateName: string): string {
    const filePath = path.join(__dirname, 'template', `${templateName}.html`);
    return fs.readFileSync(filePath, 'utf8');
  }

  private parseTemplate(template: string, variables: Record<string, string>) {
    let content = template;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      content = content.replace(regex, value);
    });
    return content;
  }

  // Método para enviar email de reset de senha
  async sendPasswordResetEmail(email: string): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn('SendGrid não configurado, email não será enviado');
      return;
    }

    try {
      const template = this.loadTemplate('password-reset');
      const htmlContent = this.parseTemplate(template, {
        email: email,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password` || 'http://localhost:3004/reset-password'
      });

      const msg = {
        to: email,
        from: process.env.SENDGRID_FROM_EMAIL || 'noreply@mentesegura.com',
        subject: 'Reset de Senha - MenteSegura',
        html: htmlContent,
      };

      await sgMail.send(msg);
      this.logger.log(`✅ Email de reset de senha enviado para: ${email}`);
    } catch (error) {
      this.logger.error(`❌ Erro ao enviar email de reset de senha para ${email}:`, error);
      throw new Error(`Falha ao enviar email de reset de senha: ${error.message}`);
    }
  }
}
