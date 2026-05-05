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
    if (action === 'get_bms') {
        const bmIds = body.bmIds || [];

        // Obter os BMs
        const actRes = await fetch(`https://graph.facebook.com/v19.0/me/businesses?fields=id,name,verification_status&access_token=${token}`, { cache: 'no-store' });
        const actData = await actRes.json();
        
        let adAccounts = [];
        if (bmIds.length > 0) {
            // Criar um mapa de nomes de BMs para associar às contas
            const bmNameMap = {};
            if (actData.data) {
              for (const biz of actData.data) {
                bmNameMap[biz.id] = biz.name;
              }
            }

            const fetchPromises = bmIds.map(async (bmId) => {
                let localAccs = [];
                const bmName = bmNameMap[bmId] || `BM ${bmId}`;
                try {
                    // Buscar as contas de anúncio do BM (client_ad_accounts ou owned_ad_accounts)
                    const bmAccRes = await fetch(`https://graph.facebook.com/v19.0/${bmId}/client_ad_accounts?fields=id,name,account_id,account_status,currency,balance,amount_spent,spend_cap&access_token=${token}`, { cache: 'no-store' });
                    const bmAccData = await bmAccRes.json();
                    if (bmAccData.data && bmAccData.data.length > 0) {
                        localAccs.push(...bmAccData.data.map(a => ({ ...a, bm_id: bmId, bm_name: bmName })));
                    } else {
                        const ownAccRes = await fetch(`https://graph.facebook.com/v19.0/${bmId}/owned_ad_accounts?fields=id,name,account_id,account_status,currency,balance,amount_spent,spend_cap&access_token=${token}`, { cache: 'no-store' });
                        const ownAccData = await ownAccRes.json();
                        if (ownAccData.data && ownAccData.data.length > 0) {
                            localAccs.push(...ownAccData.data.map(a => ({ ...a, bm_id: bmId, bm_name: bmName })));
                        }
                    }
                } catch (e) {
                    console.error('Erro ao buscar BM', bmId, e);
                }
                return localAccs;
            });
            
            const results = await Promise.all(fetchPromises);
            results.forEach(accs => adAccounts.push(...accs));
            
            // Remove duplicatas caso alguma conta venha mais de uma vez em diferentes BMs
            adAccounts = adAccounts.filter((acc, index, self) => index === self.findIndex((a) => a.id === acc.id));
        } else {
            // Puxar as AdAccounts principais do próprio usuário como fallback
            const addAccRes = await fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_id,account_status,currency,balance,amount_spent,spend_cap&access_token=${token}`, { cache: 'no-store' });
            const addAccData = await addAccRes.json();
            adAccounts = (addAccData.data || []).map(a => ({ ...a, bm_id: null, bm_name: 'Conta Pessoal' }));
        }

        return new Response(JSON.stringify({ 
            success: true, 
            businesses: actData.data || [],
            personalAdAccounts: adAccounts
        }), {
            headers: { ...MKT_CORS, "Content-Type": "application/json" },
        });
    }

    // 2. get_insights (Busca campanhas e métricas)
    if (action === 'get_insights') {
      if (!adAccountId) throw new Error("adAccountId é obrigatório para get_insights");

      // Buscar campanhas ativas
      const campRes = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/campaigns?fields=id,name,status,objective&effective_status=['ACTIVE']&access_token=${token}`, { cache: 'no-store' });
      const campData = await campRes.json();

      const datePreset = body.datePreset || 'last_30d';

      // Buscar insights agregados (investimento, alcance, cliques)
      const insRes = await fetch(`https://graph.facebook.com/v19.0/${adAccountId}/insights?fields=spend,clicks,cpc,impressions,reach,actions&date_preset=${datePreset}&access_token=${token}`, { cache: 'no-store' });
      const insData = await insRes.json();

      // Buscar insights POR CAMPANHA (para detalhamento no relatório)
      const activeCampaigns = campData.data || [];
      const campaignInsightsPromises = activeCampaigns.slice(0, 15).map(async (camp) => {
        try {
          const cInsRes = await fetch(`https://graph.facebook.com/v19.0/${camp.id}/insights?fields=spend,clicks,impressions,reach,actions&date_preset=${datePreset}&access_token=${token}`, { cache: 'no-store' });
          const cInsData = await cInsRes.json();
          const ci = cInsData.data?.[0] || {};

          // Contar leads das actions
          let leads = 0;
          if (ci.actions) {
            for (const act of ci.actions) {
              if (act.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
                  act.action_type === 'onsite_conversion.messaging_first_reply' ||
                  act.action_type === 'lead' ||
                  act.action_type === 'offsite_conversion.fb_pixel_lead') {
                leads += parseInt(act.value || 0);
              }
            }
          }

          return {
            ...camp,
            insights: {
              spend: parseFloat(ci.spend || 0),
              clicks: parseInt(ci.clicks || 0),
              impressions: parseInt(ci.impressions || 0),
              reach: parseInt(ci.reach || 0),
              leads,
              cpl: leads > 0 ? parseFloat(ci.spend || 0) / leads : 0
            }
          };
        } catch (e) {
          return { ...camp, insights: { spend: 0, clicks: 0, impressions: 0, reach: 0, leads: 0, cpl: 0 } };
        }
      });

      const campaignsWithInsights = await Promise.all(campaignInsightsPromises);

      return new Response(JSON.stringify({ 
          success: true, 
          campaigns: campaignsWithInsights,
          insights: insData.data?.[0] || { spend: 0, clicks: 0, impressions: 0, reach: 0 }
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
