/**
 * Script para testar a remoção de departamento
 * Uso: pnpm ts-node scripts/test-delete-department.ts
 */

import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function testDeleteDepartment() {
  const organizationId = 'test-org-id'; // Substitua pelo ID real
  const departmentName = 'Marketing'; // Departamento para testar
  
  try {
    console.log('🧪 [Test] Testando remoção de departamento:', departmentName);
    console.log('   Organization ID:', organizationId);
    
    const response = await fetch(`http://localhost:8080/api/departments/organization/${organizationId}/department/${encodeURIComponent(departmentName)}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // Substitua pelo token real
      }
    });
    
    console.log('   Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [Test] Departamento removido com sucesso!');
      console.log('   Dados:', data);
    } else {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      console.log('❌ [Test] Erro ao remover departamento:');
      console.log('   Status:', response.status);
      console.log('   Erro:', errorData);
    }
    
  } catch (error) {
    console.error('❌ [Test] Erro na requisição:', error);
  }
}

// Executar teste
testDeleteDepartment().catch(console.error);
