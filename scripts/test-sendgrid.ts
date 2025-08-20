/**
 * Script para testar as credenciais do SendGrid
 * Uso: pnpm ts-node scripts/test-sendgrid.ts
 */

import sgMail from '@sendgrid/mail';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testSendGrid() {
  console.log('🧪 [Test] Testando configuração do SendGrid...');
  
  const apiKey = process.env.SENDGRID_API_KEY;
  
  if (!apiKey) {
    console.error('❌ [Test] SENDGRID_API_KEY não encontrada no .env');
    process.exit(1);
  }
  
  console.log('🔑 [Test] API Key encontrada:', apiKey.substring(0, 10) + '...');
  
  // Configurar SendGrid
  sgMail.setApiKey(apiKey);
  
  // Email de teste
  const testEmail = {
    to: 'marcosul@gmail.com', // Email do usuário que está testando
    from: 'contact@xbase.app', // Mesmo from do EmailService
    subject: '🧪 Teste de SendGrid - MenteSegura',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>🧪 Teste de Configuração SendGrid</h2>
        <p>Este é um email de teste para verificar se o SendGrid está configurado corretamente.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>API Key (primeiros 10 chars):</strong> ${apiKey.substring(0, 10)}...</p>
        <hr>
        <p style="color: #666;">Se você recebeu este email, o SendGrid está funcionando! 🎉</p>
      </div>
    `,
  };
  
  try {
    console.log('📤 [Test] Enviando email de teste...');
    const result = await sgMail.send(testEmail);
    console.log('✅ [Test] Email enviado com sucesso!');
    console.log('📊 [Test] Status code:', result[0]?.statusCode);
    console.log('📊 [Test] Message ID:', result[0]?.headers?.['x-message-id']);
    
    console.log('\n🎉 [Test] SendGrid está configurado corretamente!');
    console.log('📧 [Test] Verifique sua caixa de entrada:', testEmail.to);
    
  } catch (error: any) {
    console.error('❌ [Test] Erro ao enviar email:', error);
    
    if (error?.response?.body) {
      console.error('📋 [Test] Detalhes do erro:');
      console.error(JSON.stringify(error.response.body, null, 2));
    }
    
    // Análise comum de erros
    if (error?.code === 401) {
      console.error('🔐 [Test] Erro de autenticação - verifique sua API key');
    } else if (error?.code === 403) {
      console.error('🚫 [Test] Acesso negado - verifique permissões da API key');
    } else if (error?.message?.includes('Unauthorized')) {
      console.error('🔐 [Test] API key inválida ou expirada');
    }
    
    process.exit(1);
  }
}

// Executar teste
testSendGrid().catch(console.error);
