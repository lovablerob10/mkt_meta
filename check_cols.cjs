const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)[1].trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

const supabase = createClient(url, key);

async function run() {
    // We can't use raw SQL easily without RPC or similar, 
    // but we can try to guess the columns by inserting a dummy row and rolling back? 
    // No, let's just try to select some common names.
    
    const { data: d, error: e } = await supabase.from('meta_integrations').select('id, profile_id, access_token, meta_user_id').limit(0);
    if (e) {
        console.log('Error selecting columns:', e.message);
    } else {
        console.log('Columns id, profile_id, access_token, meta_user_id exist.');
    }
}

run();
