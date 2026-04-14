import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const url = env['VITE_SUPABASE_URL'];
const anonKey = env['VITE_SUPABASE_ANON_KEY'];

if (!url || !anonKey) {
  console.error("❌ ERRO: Faltando VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function runTest() {
  console.log("🚀 Testando Auth e Edge Function 'create-user'...\n");

  console.log("1️⃣ Fazendo login como Master (atendimento@zaramkt.com.br)...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'atendimento@zaramkt.com.br',
    password: '@Senha1234'
  });

  if (authError) {
    console.error("❌ Erro no login:", authError.message);
    process.exit(1);
  }

  console.log("✅ Login bem-sucedido! Token obtido.");

  const newUserPayload = {
    email: `teste-${Date.now()}@zaramkt.com.br`,
    password: '@Password123',
    name: 'Gestor Teste API',
    role: 'GESTOR'
  };

  console.log(`\n2️⃣ Chamando Edge Function para criar usuário (${newUserPayload.email})...`);
  
  // Usar fetch diretamente para ver o detalhe do erro do body
  const res = await fetch(`${url}/functions/v1/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authData.session.access_token}`
    },
    body: JSON.stringify(newUserPayload)
  });

  const responseText = await res.text();
  console.log(`HTTP Status: ${res.status}`);
  console.log(`Response Body: ${responseText}`);
}

runTest();
