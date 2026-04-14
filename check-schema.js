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

async function checkSchemaDetailed() {
  const { data: d1, error: e1 } = await supabaseAdmin.from('meta_integrations').select('*').limit(1);
  console.log("meta_integrations error:", e1?.message);

  const { data: d2, error: e2 } = await supabaseAdmin.from('ad_accounts').select('*').limit(1);
  console.log("ad_accounts error:", e2?.message);
}

checkSchemaDetailed();
