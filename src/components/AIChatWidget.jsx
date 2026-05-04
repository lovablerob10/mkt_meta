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

  const handleSend = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;

    const newMessages = [...messages, { role: 'user', text: msg }];
    setMessages(newMessages);
    setInput('');

    try {
      // Dinamic import of supabase
      const { supabase } = await import('../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
         setMessages(prev => [...prev, { role: 'bot', text: 'Você precisa estar logado para falar comigo.' }]);
         return;
      }

      // Convert messages to OpenAI format
      const chatHistory = newMessages.map(m => ({
          role: m.role === 'bot' ? 'assistant' : 'user',
          content: m.text
      }));

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/zmkt-ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ messages: chatHistory })
      });

      const data = await res.json();
      
      if (data.reply) {
         setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
         throw new Error(data.error || 'Erro desconhecido');
      }

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: 'Ops! Tive um problema de conexão com a agência. Tente novamente em alguns segundos. 🔌' },
      ]);
    }
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
