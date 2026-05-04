import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[ZMKT] Supabase não configurado. Verifique o arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      // Desabilita navigator.locks que causa deadlock no Chrome
      lock: (name, acquireTimeout, fn) => fn(),
      // Não tentar detectar token na URL (evita conflito com OAuth FB)
      detectSessionInUrl: false,
    }
  }
);
