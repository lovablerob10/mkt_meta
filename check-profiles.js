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

async function checkProfiles() {
  const { data, error } = await supabaseAdmin.from('profiles').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Profiles:', data);
  }
}

checkProfiles();
