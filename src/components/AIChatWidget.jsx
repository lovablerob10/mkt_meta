import { useState } from 'react';
import { Sparkles, X, Send } from 'lucide-react';

const SUGGESTIONS = [
  'Como estão meus anúncios?',
  'Qual campanha gerou mais leads?',
  'Meu CPC está bom?',
  'Resumo da semana',
];

const INITIAL_MESSAGES = [
  {
    role: 'bot',
    text: 'Olá! 👋 Sou a IA da Z/MKT. Posso te ajudar a entender como estão suas campanhas. O que gostaria de saber?',
  },
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: getAIResponse(msg),
        },
      ]);
    }, 800);
  };

  const getAIResponse = (question) => {
    const q = question.toLowerCase();
    if (q.includes('cpc') || q.includes('custo por clique')) {
      return 'Seu CPC médio está em R$ 0,79 — isso é muito bom! Para o mercado de tráfego, um CPC abaixo de R$ 1,50 é considerado excelente. A campanha "Studio Beleza" tem o melhor CPC: R$ 0,21. 🎯';
    }
    if (q.includes('lead') || q.includes('leads')) {
      return 'No total, vocês geraram 387 leads este mês! Sendo 368 pelo WhatsApp e 19 por formulário. A campanha "Famoso - WhatsApp Leads" é a que mais converte com 156 leads. 🚀';
    }
    if (q.includes('anúncio') || q.includes('campanha') || q.includes('como estão')) {
      return 'No geral, suas campanhas estão indo bem! 3 de 5 estão com status "Boa". A campanha "Metropolitano - WhatsApp Vendas" precisa de atenção — o CPC está em R$ 2,58, acima da média. Recomendo revisar o público-alvo ou o criativo. 📊';
    }
    if (q.includes('semana') || q.includes('resumo')) {
      return 'Resumo da última semana: R$ 5.005,30 investidos, 387 leads gerados, 6.369 cliques com CPC médio de R$ 0,79. O alcance total foi de 203.100 pessoas. Destaque: campanha de branding do Studio Beleza atingiu 67 mil pessoas com CPC de R$ 0,21! 💰';
    }
    return 'Entendi! Vou analisar seus dados para responder melhor. No momento, todas as suas 5 contas estão ativas, com um gasto total de R$ 5.005,30 e 387 oportunidades geradas. Quer saber algo específico sobre alguma campanha? 😊';
  };

  return (
    <>
      <button
        className="ai-chat-fab"
        onClick={() => setIsOpen(!isOpen)}
        title="Chat com IA"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {isOpen && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <h3>
              <Sparkles size={18} style={{ color: 'var(--brand-accent)' }} />
              Assistente Z<span style={{ color: 'var(--brand-accent)' }}>/</span>MKT
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--brand-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`ai-chat-msg ${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="ai-chat-suggestions">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="ai-chat-chip"
                onClick={() => handleSend(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="ai-chat-input-bar">
            <input
              type="text"
              placeholder="Pergunte sobre suas campanhas..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={() => handleSend()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
