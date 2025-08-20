import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

interface AuthTestResult {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
  error?: string;
}

/**
 * Testar autenticação com diferentes credenciais
 */
async function testAuth(email: string, password: string): Promise<AuthTestResult> {
  console.log(`🔐 [AuthTest] Testando login: ${email}`);
  
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password
    });

    const { access_token, user } = response.data;
    
    console.log(`✅ [AuthTest] Login bem-sucedido para ${email}`);
    console.log(`   Token: ${access_token.substring(0, 20)}...`);
    console.log(`   Usuário: ${user.name} (${user.role})`);
    
    return {
      success: true,
      message: `Login bem-sucedido para ${email}`,
      token: access_token,
      user
    };
    
  } catch (error: any) {
    console.error(`❌ [AuthTest] Falha no login para ${email}:`, error.message);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data)}`);
    }
    
    return {
      success: false,
      message: `Falha no login para ${email}`,
      error: error.message
    };
  }
}

/**
 * Testar múltiplas credenciais
 */
async function testMultipleCredentials() {
  console.log('🧪 [AuthTest] Testando múltiplas credenciais...\n');
  
  const credentials = [
    { email: 'colaborador@demo.com', password: '111111' },
    { email: 'gestor@demo.com', password: '123456' },
    { email: 'profissional@demo.com', password: '123456' },
    { email: 'colaborador1_detran@demo.com', password: '123456' },
    { email: 'gestor_detran@demo.com', password: '123456' }
  ];
  
  const results: (AuthTestResult & { email: string })[] = [];
  
  for (const cred of credentials) {
    console.log(`\n📋 Testando: ${cred.email}`);
    const result = await testAuth(cred.email, cred.password);
    results.push({ email: cred.email, ...result });
    
    // Pausa entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Relatório
  const successCount = results.filter(r => r.success).length;
  console.log(`\n📊 Resumo: ${successCount}/${credentials.length} credenciais funcionaram`);
  
  if (successCount > 0) {
    console.log('\n✅ Credenciais que funcionaram:');
    results.filter(r => r.success).forEach(result => {
      console.log(`   - ${result.email} (${result.user?.role})`);
    });
  }
  
  if (successCount < credentials.length) {
    console.log('\n❌ Credenciais que falharam:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`   - ${result.email}: ${result.error}`);
    });
  }
  
  return results;
}

/**
 * Função principal
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 2) {
    // Testar credenciais específicas
    const [email, password] = args;
    console.log(`🔐 [AuthTest] Testando credenciais específicas...\n`);
    
    const result = await testAuth(email, password);
    
    if (result.success) {
      console.log('\n🎉 Autenticação bem-sucedida!');
      console.log('💡 Use estas credenciais nos scripts de teste:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      process.exit(0);
    } else {
      console.log('\n❌ Autenticação falhou');
      process.exit(1);
    }
  } else {
    // Testar múltiplas credenciais
    await testMultipleCredentials();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { testAuth, testMultipleCredentials };
