const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function run() {
    console.log('--- DB INSPECTION ---');
    
    // 1. Check if table exists and schema
    const { data: test, error: errTest } = await supabase.from('meta_integrations').select('*').limit(0);
    if (errTest) {
        console.error('Table meta_integrations error:', errTest.message);
    } else {
        console.log('Table meta_integrations exists.');
    }

    // 2. Try to get profiles to confirm user exists
    const { data: profile, error: errProf } = await supabase.from('profiles').select('id, role, email').eq('email', 'atendimento@zaramkt.com.br').single();
    console.log('Profile atendimento:', profile);

    // 3. Check for any existing integrations
    const { data: integ, error: errInteg } = await supabase.from('meta_integrations').select('*');
    console.log('Integrations:', integ);

    // 4. Check for clients
    const { data: clients, error: errClients } = await supabase.from('clients').select('id, name');
    console.log('Clients count:', clients?.length);
}

run();
