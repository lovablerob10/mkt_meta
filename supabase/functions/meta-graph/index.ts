import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

// Tipos de ambiente
const MKT_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: MKT_CORS });
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Não autorizado");

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);

    if (authError || !user) throw new Error("Usuário não autenticado no Supabase");

    // Verificar se existe integração ativa e puxar o token do MASTER
    // Note: Numa arquitetura real, você pode varrer se o usuário é MASTER (pega o próprio token)
    // Se o usuário for REC/Gestor, ele pode pegar o token do Master ou da Agência associada.
    // Vamos simplificar: pegamos a tabela inteira (LIMIT 1) ou do Master
    const { data: profiles } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    let integrationProfileId = user.id;

    if (profiles?.role !== 'MASTER') {
       // Se for gestor ou cliente, vai pegar o token do Master do sistema 
       // Obs: Para SaaS Multi-tenant, deve pegar o token do tenant dono da conta. 
       // Aqui simularemos pegando o primeiro MASTER do sistema
       const { data: masterData } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('role', 'MASTER')
          .limit(1);
       if (masterData && masterData.length > 0) {
          integrationProfileId = masterData[0].id;
       }
    }

    const { data: integration, error: intError } = await supabaseClient
      .from('meta_integrations')
      .select('access_token')
      .eq('profile_id', integrationProfileId)
      .single();

    if (intError || !integration?.access_token) {
        return new Response(JSON.stringify({ notConfigured: true }), {
            headers: { ...MKT_CORS, "Content-Type": "application/json" }
        });
    }

    const token = integration.access_token;

    // Lendo ação pedida
    const body = await req.json();
    const { action, adAccountId } = body;

    // Ações Suportadas
    // 1. get_bms (Resgata todas os BMs (Businesses) vinculados a este token)
    if (action === 'get_bms') {
        // Obter os BMs
        const actRes = await fetch(`https://graph.facebook.com/v19.0/me/businesses?fields=id,name,verification_status&access_token=${token}`, { cache: 'no-store' });
        const actData = await actRes.json();
        
        // Puxar as AdAccounts principais do próprio usuário como fallback, pois muitas vezes 
        // a AdAccount é pessoal e não do BM.
        const addAccRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_id,account_status,currency&access_token=${token}`, { cache: 'no-store' });
        const addAccData = await addAccRes.json();

        return new Response(JSON.stringify({ 
            success: true, 
            businesses: actData.data || [],
            personalAdAccounts: addAccData.data || []
        }), {
            headers: { ...MKT_CORS, "Content-Type": "application/json" },
        });
    }

    throw new Error("Ação inválida");

  } catch (error) {
    console.error("Erro no meta-graph:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...MKT_CORS, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
