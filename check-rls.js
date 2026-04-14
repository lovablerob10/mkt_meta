import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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
// Use o anonKey simulando o client normal
const anonKey = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(url, anonKey);

async function checkRLS() {
  console.log("Tentando ler o profile sem login (anon)...");
  const { data: anonData, error: anonError } = await supabase.from('profiles').select('*');
  console.log("Anon Error:", anonError?.message || "Success");

  console.log("Fazendo login como MASTER...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'atendimento@zaramkt.com.br',
    password: '@Senha1234'
  });

  if (authError) {
    console.error("Login Error:", authError.message);
    return;
  }

  console.log("Lendo profiles como MASTER...");
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
  
  if (profileError) {
    console.error("Master Profile Error:", profileError);
  } else {
    console.log("Master Profiles:", profiles);
  }
  
  // Tentar ler um único
  const { data: single, error: singleError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();
    
  console.log("Lendo .single():", singleError || single);
}

checkRLS();
