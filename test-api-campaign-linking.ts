import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

async function testApiCampaignLinking() {
  console.log('🧪 [TestApiCampaignLinking] Iniciando teste via API...');

  try {
    // 1. Fazer login para obter token
    console.log('🔐 [TestApiCampaignLinking] Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'rodrigues.adriano2607@gmail.com',
      password: '123456',
    });

    const token = loginResponse.data.access_token;
    console.log('✅ [TestApiCampaignLinking] Login realizado com sucesso');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // 2. Buscar campanhas ativas
    console.log('🔍 [TestApiCampaignLinking] Buscando campanhas...');
    const campaignsResponse = await axios.get(`${API_BASE_URL}/campaigns`, { headers });
    const activeCampaigns = campaignsResponse.data.filter((c: any) => c.status === 'active');
    
    if (activeCampaigns.length === 0) {
      console.log('❌ [TestApiCampaignLinking] Nenhuma campanha ativa encontrada');
      return;
    }

    const activeCampaign = activeCampaigns[0];
    console.log(`✅ [TestApiCampaignLinking] Campanha ativa encontrada: ${activeCampaign.name}`);

    // 3. Buscar formulários da organização
    console.log('🔍 [TestApiCampaignLinking] Buscando formulários...');
    const formsResponse = await axios.get(`${API_BASE_URL}/forms`, { headers });
    const forms = formsResponse.data;
    
    if (forms.length === 0) {
      console.log('❌ [TestApiCampaignLinking] Nenhum formulário encontrado');
      return;
    }

    const form = forms[0];
    console.log(`✅ [TestApiCampaignLinking] Formulário encontrado: ${form.title}`);

    // 4. Buscar perfil do usuário
    console.log('🔍 [TestApiCampaignLinking] Buscando perfil do usuário...');
    const profileResponse = await axios.get(`${API_BASE_URL}/profile`, { headers });
    const profile = profileResponse.data;
    console.log(`✅ [TestApiCampaignLinking] Perfil encontrado: ${profile.name}`);

    // 5. Criar submitted form via API (deve vincular automaticamente)
    console.log('📝 [TestApiCampaignLinking] Criando submitted form via API...');
    const submittedFormData = {
      formId: form.id,
      profileId: profile.id,
      status: 'pending',
      // Não fornecer campaignId - deve ser vinculado automaticamente
    };

    const submittedFormResponse = await axios.post(
      `${API_BASE_URL}/submitted-forms`,
      submittedFormData,
      { headers }
    );

    const submittedForm = submittedFormResponse.data;
    console.log('📊 [TestApiCampaignLinking] Resultado:');
    console.log(`   - Submitted Form ID: ${submittedForm.id}`);
    console.log(`   - Formulário: ${form.title}`);
    console.log(`   - Usuário: ${profile.name}`);
    console.log(`   - Campaign ID: ${submittedForm.campaignId || 'null'}`);

    if (submittedForm.campaignId === activeCampaign.id) {
      console.log('✅ [TestApiCampaignLinking] SUCESSO: Submitted form foi vinculado automaticamente à campanha ativa!');
    } else {
      console.log('❌ [TestApiCampaignLinking] FALHA: Submitted form não foi vinculado à campanha ativa');
      console.log(`   - Esperado: ${activeCampaign.id}`);
      console.log(`   - Recebido: ${submittedForm.campaignId}`);
    }

    // 6. Testar cenário sem campanha ativa
    console.log('\n🧪 [TestApiCampaignLinking] Testando cenário sem campanha ativa...');
    
    // Pausar a campanha ativa
    await axios.patch(
      `${API_BASE_URL}/campaigns/${activeCampaign.id}`,
      { status: 'paused' },
      { headers }
    );

    console.log('⏸️ [TestApiCampaignLinking] Campanha pausada');

    // Criar outro submitted form
    const submittedFormData2 = {
      formId: form.id,
      profileId: profile.id,
      status: 'pending',
    };

    const submittedFormResponse2 = await axios.post(
      `${API_BASE_URL}/submitted-forms`,
      submittedFormData2,
      { headers }
    );

    const submittedForm2 = submittedFormResponse2.data;
    console.log(`📊 [TestApiCampaignLinking] Resultado sem campanha ativa:`);
    console.log(`   - Submitted Form ID: ${submittedForm2.id}`);
    console.log(`   - Campaign ID: ${submittedForm2.campaignId || 'null'}`);

    if (!submittedForm2.campaignId) {
      console.log('✅ [TestApiCampaignLinking] SUCESSO: Submitted form não foi vinculado (não há campanha ativa)');
    } else {
      console.log('❌ [TestApiCampaignLinking] FALHA: Submitted form foi vinculado mesmo sem campanha ativa');
    }

    // 7. Reativar a campanha
    await axios.patch(
      `${API_BASE_URL}/campaigns/${activeCampaign.id}`,
      { status: 'active' },
      { headers }
    );

    console.log('🔄 [TestApiCampaignLinking] Campanha reativada');

  } catch (error: any) {
    console.error('❌ [TestApiCampaignLinking] Erro durante o teste:', error.response?.data || error.message);
  }
}

// Executar o teste
testApiCampaignLinking();
