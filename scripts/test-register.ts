/**
 * Script para testar o registro de usuário
 * Uso: pnpm ts-node scripts/test-register.ts
 */

import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testRegister() {
  const testEmail = `test-${Date.now()}@gmail.com`;
  
  try {
    console.log('🧪 [Test] Testando registro com email:', testEmail);
    
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Usuário Teste',
        email: testEmail,
        password: 'Teste123!'
      })
    });
    
    const data = await response.json() as any;
    
    if (response.ok) {
      console.log('✅ [Test] Registro bem-sucedido!');
      console.log('   Token:', data.access_token ? 'Gerado' : 'Não gerado');
      console.log('   Usuário:', data.user?.email);
      console.log('   Mensagem:', data.message);
      console.log('   Email enviado:', data.emailSent);
    } else {
      console.log('❌ [Test] Erro no registro:');
      console.log('   Status:', response.status);
      console.log('   Mensagem:', data.message);
      console.log('   Erro:', data.error);
    }
    
  } catch (error) {
    console.error('❌ [Test] Erro na requisição:', error);
  }
}

// Executar teste
testRegister().catch(console.error);
