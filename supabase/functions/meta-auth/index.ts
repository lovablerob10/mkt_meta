import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

// Tipos de ambiente
const MKT_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const fbAppId = Deno.env.get('META_APP_ID') || '';
const fbAppSecret = Deno.env.get('META_APP_SECRET') || '';

Deno.serve(async (req) => {
  // Tratamento de CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: MKT_CORS });
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Validação de token JWT do usuário que chamou a função
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Token de autorização não encontrado");

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);

    if (authError || !user) throw new Error("Usuário não autenticado no Supabase");

    // Lendo o profile para garantir que apenas MASTER faça integrações principais
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'MASTER') {
      throw new Error("Apenas administradores MASTER podem configurar a integração primária do Meta");
    }

    // Pega o token curto do body
    const body = await req.json();
    const { shortLivedToken } = body;

    if (!shortLivedToken) throw new Error("Faltando o token do Facebook SDK");

    // 1. Trocar por um ShortLivedToken usando AppSecret -> LongLivedToken
    const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${fbAppId}&client_secret=${fbAppSecret}&fb_exchange_token=${shortLivedToken}`;
    
    const exchangeRes = await fetch(url);
    const exchangeData = await exchangeRes.json();

    if (exchangeData.error) {
       console.error("Meta Exchange Error:", exchangeData.error);
       throw new Error(`Erro no Meta: ${exchangeData.error.message}`);
    }

    const longLivedToken = exchangeData.access_token;

    // 2. Obter ID do usuário do Facebook para associar
    const meRes = await fetch(`https://graph.facebook.com/v19.0/me?access_token=${longLivedToken}`);
    const meData = await meRes.json();
    const metaUserId = meData.id;

    // 3. Salvar no banco
    const { error: dbError } = await supabaseClient
      .from('meta_integrations')
      .upsert(
        {
          profile_id: user.id,
          meta_user_id: metaUserId,
          access_token: longLivedToken,
          status: 'connected',
          updated_at: new Date().toISOString()
        },
        { onConflict: 'profile_id' }
      );

    if (dbError) {
       console.error("DB Error:", dbError);
       throw new Error("Erro ao salvar integração no banco");
    }

    return new Response(JSON.stringify({ success: true, meta_user_id: metaUserId }), {
      headers: { ...MKT_CORS, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro no meta-auth:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...MKT_CORS, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
