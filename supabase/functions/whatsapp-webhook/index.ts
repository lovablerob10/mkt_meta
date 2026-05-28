import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

// ── Constantes ──────────────────────────────────────────
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VERIFY_TOKEN = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "ZMKT_WA_2026";
const WHATSAPP_TOKEN = Deno.env.get("WHATSAPP_CLOUD_TOKEN") || "";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// ── Main Handler ────────────────────────────────────────
Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);

  // ── GET: Verificação do Webhook Meta ──────────────────
  if (req.method === "GET") {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    console.log("[ZMKT-WA] Webhook verification request:", { mode, token: token?.substring(0, 4) + "..." });

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[ZMKT-WA] ✅ Webhook verified successfully");
      return new Response(challenge, {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "text/plain" },
      });
    }

    console.warn("[ZMKT-WA] ❌ Webhook verification failed");
    return new Response("Forbidden", { status: 403, headers: CORS_HEADERS });
  }

  // ── POST: Recebimento de Mensagem ─────────────────────
  if (req.method === "POST") {
    try {
      const body = await req.json();

      // Extrair dados do payload da Meta
      const entry = body?.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;

      // Ignorar eventos sem mensagem (status updates, etc.)
      if (!value?.messages?.length) {
        console.log("[ZMKT-WA] Evento sem mensagem — ignorado (provavelmente status update)");
        return new Response("OK", { status: 200, headers: CORS_HEADERS });
      }

      const message = value.messages[0];
      const contact = value.contacts?.[0];
      const metadata = value.metadata;
      
      // Extrair Phone Number ID para identificar o cliente
      const phoneNumberId = metadata?.phone_number_id || null;

      // Dados do remetente
      const waId = message.from; // ex: "5511999999999"
      const displayName = contact?.profile?.name || null;
      const firstMessage =
        message.type === "text"
          ? message.text?.body
          : `[${message.type}]`;

      console.log(`[ZMKT-WA] 📩 Nova mensagem de ${displayName || waId}: "${firstMessage?.substring(0, 50)}..."`);

      // Dados do anúncio CTWA (Click-to-WhatsApp referral)
      const referral = message.referral || null;
      const adId = referral?.source_id || null;
      const adTitle = referral?.headline || null;
      const campaignId = referral?.source_url || null;
      const campaignName = referral?.body || adTitle || null;

      if (referral) {
        console.log(`[ZMKT-WA] 📣 Lead veio do anúncio: ${adTitle || adId}`);
      } else {
        console.log("[ZMKT-WA] 💬 Lead orgânico (sem referral de anúncio)");
      }

      // Supabase Client com service_role (para escrita)
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Calcular score por IA (assíncrono mas aguardamos por ser rápido)
      const { score, score_label, score_reason } = await scoreConversation(
        firstMessage,
        displayName
      );

      console.log(`[ZMKT-WA] 🤖 Score IA: ${score} (${score_label}) — ${score_reason}`);

      // Identificar qual cliente é dono deste número de WhatsApp
      let clientId = null;
      if (phoneNumberId) {
        const { data: clientData } = await supabase
          .from("clients")
          .select("id")
          .eq("whatsapp_phone_id", phoneNumberId)
          .single();
          
        if (clientData) {
          clientId = clientData.id;
          console.log(`[ZMKT-WA] 🏢 Cliente identificado: ${clientId}`);
        } else {
          console.log(`[ZMKT-WA] ⚠️ Nenhum cliente encontrado para whatsapp_phone_id: ${phoneNumberId}`);
        }
      }

      // Verificar se o lead já existe (para saber se é primeira mensagem)
      const { data: existingLead } = await supabase
        .from("whatsapp_leads")
        .select("id, messages_count")
        .eq("wa_id", waId)
        .single();

      const isNewLead = !existingLead;

      // Salvar/atualizar lead no banco
      if (isNewLead) {
        // Novo lead — salva com scoring IA
        const { data: leadData, error: leadError } = await supabase
          .from("whatsapp_leads")
          .insert({
            wa_id: waId,
            client_id: clientId,
            phone: waId,
            display_name: displayName,
            first_message: firstMessage,
            ad_id: adId,
            ad_title: adTitle,
            campaign_id: campaignId,
            campaign_name: campaignName,
            score,
            score_label,
            score_reason,
            messages_count: 1,
            updated_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (leadError) {
          console.error("[ZMKT-WA] ❌ Erro ao salvar novo lead:", leadError);
        } else {
          console.log("[ZMKT-WA] ✅ Novo lead criado com sucesso");

          // Salvar a primeira mensagem no histórico
          await supabase.from("whatsapp_messages").insert({
            lead_id: leadData.id,
            wa_id: waId,
            direction: "inbound",
            message_type: message.type || "text",
            content: firstMessage,
            timestamp: new Date().toISOString(),
            raw_payload: message,
          });
        }
      } else {
        // Lead já existe — atualizar e registrar nova mensagem
        const newCount = (existingLead.messages_count || 1) + 1;

        const { error: updateError } = await supabase
          .from("whatsapp_leads")
          .update({
            messages_count: newCount,
            display_name: displayName || undefined, // Atualiza se tiver nome novo
            updated_at: new Date().toISOString(),
          })
          .eq("wa_id", waId);

        if (updateError) {
          console.error("[ZMKT-WA] ❌ Erro ao atualizar lead:", updateError);
        }

        // Salvar mensagem no histórico
        const { error: msgError } = await supabase
          .from("whatsapp_messages")
          .insert({
            lead_id: existingLead.id,
            wa_id: waId,
            direction: "inbound",
            message_type: message.type || "text",
            content: firstMessage,
            timestamp: new Date().toISOString(),
            raw_payload: message,
          });

        if (msgError) {
          console.error("[ZMKT-WA] ❌ Erro ao salvar mensagem:", msgError);
        } else {
          console.log(`[ZMKT-WA] ✅ Mensagem #${newCount} registrada para lead existente`);
        }
      }

      return new Response("EVENT_RECEIVED", {
        status: 200,
        headers: CORS_HEADERS,
      });
    } catch (err) {
      console.error("[ZMKT-WA] ❌ Erro no processamento:", err);
      // Sempre retornar 200 para a Meta não retentar indefinidamente
      return new Response("EVENT_RECEIVED", {
        status: 200,
        headers: CORS_HEADERS,
      });
    }
  }

  return new Response("Method Not Allowed", {
    status: 405,
    headers: CORS_HEADERS,
  });
});

// ── Scoring por IA (OpenAI gpt-4o-mini) ─────────────────
async function scoreConversation(
  message: string | null,
  name: string | null
): Promise<{ score: number; score_label: string; score_reason: string }> {
  // Fallback se não tiver mensagem ou chave da API
  if (!message || !OPENAI_API_KEY) {
    return {
      score: 10,
      score_label: "Frio",
      score_reason: "Sem mensagem inicial para análise.",
    };
  }

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em qualificação de leads para uma agência de marketing digital brasileira (Z/MKT).
Analise a primeira mensagem de um lead que veio de um anúncio Click-to-WhatsApp.
Responda APENAS um JSON válido com exatamente este formato:
{
  "score": número de 0 a 100 (intenção de compra),
  "score_label": "Frio" | "Morno" | "Quente",
  "score_reason": "explicação em 1 frase curta em português"
}

Critérios:
- Frio (0-30): Mensagem automática, só emoji, sem interesse claro, spam
- Morno (31-65): Pedindo informações, interessado mas indeciso, perguntas sobre preço/prazo
- Quente (66-100): Quer comprar/fechar, pedindo orçamento específico, demonstrando urgência`,
          },
          {
            role: "user",
            content: `Nome: ${name || "Desconhecido"}\nMensagem: "${message}"`,
          },
        ],
        temperature: 0.3,
        max_tokens: 150,
      }),
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "{}";

    // Extrair JSON da resposta (pode vir com markdown ```json...```)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        score: Math.min(100, Math.max(0, parsed.score || 10)),
        score_label: ["Frio", "Morno", "Quente"].includes(parsed.score_label)
          ? parsed.score_label
          : "Frio",
        score_reason: parsed.score_reason || "Análise concluída.",
      };
    }
  } catch (err) {
    console.error("[ZMKT-WA] ❌ Erro no scoring IA:", err);
  }

  return {
    score: 10,
    score_label: "Frio",
    score_reason: "Erro na análise automática.",
  };
}
