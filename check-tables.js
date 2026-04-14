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
const serviceRole = env['SUPABASE_SERVICE_ROLE_KEY'];

const supabaseAdmin = createClient(url, serviceRole);

async function listTables() {
  const { data, error } = await supabaseAdmin.rpc('get_tables'); // Or any manual postgres query via Edge function if 'get_tables' RPC isn't available
  // Let's use standard REST API to query `information_schema.tables` if possible. Wait, PostgREST does not expose information_schema by default.
  // I will just query `meta_integrations` and see if it fails.
  const { error: e1 } = await supabaseAdmin.from('meta_integrations').select('id').limit(1);
  console.log("meta_integrations exists?", !e1 || e1.code !== '42P01');

  const { error: e2 } = await supabaseAdmin.from('ad_accounts').select('id').limit(1);
  console.log("ad_accounts exists?", !e2 || e2.code !== '42P01');
}

listTables();
