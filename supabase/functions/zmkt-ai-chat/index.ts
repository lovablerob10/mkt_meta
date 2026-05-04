import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

// Tipos de ambiente
const MKT_CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Chave da OpenAI para o ChatGPT
const openAiKey = Deno.env.get('OPENAI_API_KEY') || '';

const SYSTEM_PROMPT = `Você é o Assistente de Inteligência Artificial da agência Z/MKT.
Seu objetivo é ajudar Gestores e Clientes a entenderem o desempenho de suas campanhas de tráfego pago (Meta Ads).
Seja cordial, direto, focado em resultados, e use emojis de forma moderada.

Métricas típicas que você ajuda a interpretar:
- Investimento Total (Gasto)
- Oportunidades (Leads)
- Custo por Clique (CPC)
- Alcance e Impressões

Regras:
1. Se não souber a resposta sobre um dado específico, informe que você é uma IA em desenvolvimento e que os dados completos estão nos cards do painel principal.
2. Destaque sempre os resultados positivos, mas alerte de forma gentil caso o CPC esteja alto (acima de R$ 2,50).
`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: MKT_CORS });
  }

  try {
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("Token de autorização não encontrado");

    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);

    if (authError || !user) throw new Error("Usuário não autenticado");

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error("O formato de 'messages' é inválido");
    }

    if (!openAiKey) {
        // Fallback gracefully if no API key is provided
        return new Response(JSON.stringify({ 
           reply: "Opa! Estou sem minha chave da OpenAI no servidor, então ainda não posso pensar direito. Peça pro desenvolvedor colocar a OPENAI_API_KEY nas variáveis de ambiente do Supabase!" 
        }), { headers: { ...MKT_CORS, "Content-Type": "application/json" } });
    }

    // Call OpenAI Chat Completions API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
       console.error("OpenAI Error:", data.error);
       throw new Error("Erro na API da OpenAI");
    }

    const reply = data.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...MKT_CORS, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erro no chat IA:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...MKT_CORS, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
