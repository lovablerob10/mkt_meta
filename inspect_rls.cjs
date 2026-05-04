const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function run() {
    console.log('--- RLS POLICIES INSPECTION ---');
    
    // Check if RLS is even enabled
    const { data: rlsStatus, error: errRls } = await supabase.from('pg_class')
        .select('relrowsecurity')
        .eq('relname', 'meta_integrations')
        .single();
    console.log('RLS Enabled Status:', rlsStatus);

    // Check policies
    const { data: p2, error: ep2 } = await supabase.from('pg_policies').select('*').eq('tablename', 'meta_integrations');
    console.log('Policies:', JSON.stringify(p2, null, 2));
}

run();
