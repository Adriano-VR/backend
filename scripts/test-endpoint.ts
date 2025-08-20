#!/usr/bin/env tsx

/**
 * Script para testar se o endpoint verify-supabase-user está funcionando
 */

async function testEndpoint() {
    const url = 'http://localhost:8080/auth/verify-supabase-user';
    
    console.log('🧪 Testando endpoint:', url);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                supabaseUserId: 'test-id',
                email: 'test@example.com'
            })
        });
        
        console.log('📊 Status da resposta:', response.status);
        console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Resposta:', data);
        } else {
            const errorText = await response.text();
            console.log('❌ Erro:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Erro na requisição:', error);
    }
}

// Executar teste
testEndpoint();
