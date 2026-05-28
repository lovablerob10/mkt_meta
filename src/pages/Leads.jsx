import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Phone, MessageCircle, Filter, Search, Users, Loader,
  RefreshCw, TrendingUp, Zap, Flame, Snowflake, ThermometerSun,
  Megaphone, Clock, Calendar, Building2, ChevronDown, X, ChevronRight,
  ArrowLeft, Hash
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const STATUS_MAP = {
  new:       { label: 'Novo',       class: 'good',    emoji: '🟢' },
  contacted: { label: 'Contatado',  class: 'warning', emoji: '🟡' },
  converted: { label: 'Convertido', class: 'good',    emoji: '✅' },
  lost:      { label: 'Perdido',    class: 'bad',     emoji: '🔴' },
};

const SCORE_CONFIG = {
  Frio:       { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.3)',  icon: Snowflake },
  Morno:      { color: '#FACC15', bg: 'rgba(250,204,21,0.12)',  border: 'rgba(250,204,21,0.3)',  icon: ThermometerSun },
  Quente:     { color: '#22C55E', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.3)',   icon: Flame },
  Convertido: { color: '#FF7A2E', bg: 'rgba(255,122,46,0.12)',  border: 'rgba(255,122,46,0.3)',  icon: TrendingUp },
};

const DATE_PRESETS = [
  { label: 'Todos',       value: 'all' },
  { label: 'Hoje',        value: 'today' },
  { label: 'Últimos 7d',  value: '7d' },
  { label: 'Últimos 15d', value: '15d' },
  { label: 'Últimos 30d', value: '30d' },
  { label: 'Este mês',    value: 'month' },
  { label: 'Personalizado', value: 'custom' },
];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Conversation drawer
  const [selectedLead, setSelectedLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const openConversation = useCallback(async (lead) => {
    setSelectedLead(lead);
    setLoadingMessages(true);
    try {
      const { data, error: msgErr } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('lead_id', lead.id)
        .order('timestamp', { ascending: true });
      if (msgErr) throw msgErr;
      setMessages(data || []);
    } catch (err) {
      console.error('[ZMKT] Erro ao carregar mensagens:', err);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const closeConversation = useCallback(() => {
    setSelectedLead(null);
    setMessages([]);
  }, []);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [datePreset, setDatePreset] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [showDateCustom, setShowDateCustom] = useState(false);

  // Load clients for filter
  useEffect(() => {
    supabase.from('clients').select('id, name').order('name').then(({ data }) => {
      if (data) setClients(data);
    });
  }, []);

  // Load leads
  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: dbError } = await supabase
        .from('whatsapp_leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (dbError) throw dbError;
      setLeads(data || []);
    } catch (err) {
      console.error('[ZMKT] Erro ao carregar leads:', err);
      setError(err.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Realtime
  useEffect(() => {
    loadLeads();
    const channel = supabase
      .channel('whatsapp_leads_rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'whatsapp_leads' }, (payload) => {
        if (payload.eventType === 'INSERT') setLeads(prev => [payload.new, ...prev]);
        else if (payload.eventType === 'UPDATE') setLeads(prev => prev.map(l => l.id === payload.new.id ? payload.new : l));
        else if (payload.eventType === 'DELETE') setLeads(prev => prev.filter(l => l.id !== payload.old.id));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [loadLeads]);

  // Date filter logic
  const getDateRange = useCallback(() => {
    const now = new Date();
    const startOf = (d) => { d.setHours(0,0,0,0); return d; };
    switch (datePreset) {
      case 'today': return { from: startOf(new Date()), to: now };
      case '7d':    return { from: new Date(now - 7*86400000), to: now };
      case '15d':   return { from: new Date(now - 15*86400000), to: now };
      case '30d':   return { from: new Date(now - 30*86400000), to: now };
      case 'month': return { from: startOf(new Date(now.getFullYear(), now.getMonth(), 1)), to: now };
      case 'custom': return {
        from: dateFrom ? new Date(dateFrom) : null,
        to: dateTo ? new Date(dateTo + 'T23:59:59') : null,
      };
      default: return { from: null, to: null };
    }
  }, [datePreset, dateFrom, dateTo]);

  // Filtered leads
  const filtered = useMemo(() => {
    const { from, to } = getDateRange();
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (scoreFilter !== 'all' && lead.score_label !== scoreFilter) return false;
      if (clientFilter !== 'all' && lead.client_id !== clientFilter) return false;
      if (from && new Date(lead.created_at) < from) return false;
      if (to && new Date(lead.created_at) > to) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!(lead.display_name?.toLowerCase().includes(q) ||
              lead.phone?.includes(q) ||
              lead.first_message?.toLowerCase().includes(q) ||
              lead.ad_title?.toLowerCase().includes(q) ||
              lead.campaign_name?.toLowerCase().includes(q)))
          return false;
      }
      return true;
    });
  }, [leads, statusFilter, scoreFilter, clientFilter, search, getDateRange]);

  // KPIs
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.score_label === 'Quente').length;
  const warmLeads = leads.filter(l => l.score_label === 'Morno').length;
  const coldLeads = leads.filter(l => l.score_label === 'Frio').length;
  const todayLeads = leads.filter(l => {
    const today = new Date().toISOString().split('T')[0];
    return l.created_at?.startsWith(today);
  }).length;

  const hasActiveFilters = statusFilter !== 'all' || scoreFilter !== 'all' ||
    clientFilter !== 'all' || datePreset !== 'all' || search;

  const clearFilters = () => {
    setStatusFilter('all'); setScoreFilter('all'); setClientFilter('all');
    setDatePreset('all'); setDateFrom(''); setDateTo(''); setSearch('');
    setShowDateCustom(false);
  };

  return (
    <div className="page-content">
      <div className="page-heading animate-in">
        <h1>Central de <span className="accent">Leads</span></h1>
        <p className="page-description">
          Leads capturados via WhatsApp (Click-to-WhatsApp) com scoring por IA em tempo real.
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="metrics-grid animate-in" style={{ marginBottom: 'var(--space-24)' }}>
        <KpiCard icon={<Users size={20} />} label="Total de Leads" value={totalLeads} color="var(--brand-accent)" />
        <KpiCard icon={<Flame size={20} />} label="Quentes" value={hotLeads} color="#22C55E" highlight />
        <KpiCard icon={<ThermometerSun size={20} />} label="Mornos" value={warmLeads} color="#FACC15" />
        <KpiCard icon={<Snowflake size={20} />} label="Frios" value={coldLeads} color="#60A5FA" />
        <KpiCard icon={<Clock size={20} />} label="Novos Hoje" value={todayLeads} color="var(--brand-accent-light)" />
      </div>

      {/* FILTERS PANEL */}
      <div className="panel animate-in" style={{ padding: 'var(--space-16)', marginBottom: 'var(--space-16)' }}>
        {/* Row 1: Status + Client + Date */}
        <div style={{ display: 'flex', gap: 'var(--space-12)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={15} style={{ color: 'var(--brand-muted)', flexShrink: 0 }} />

          {/* Status chips */}
          {[
            { label: 'Todos', value: 'all' },
            { label: '🟢 Novos', value: 'new' },
            { label: '🟡 Contatados', value: 'contacted' },
            { label: '✅ Convertidos', value: 'converted' },
            { label: '🔴 Perdidos', value: 'lost' },
          ].map(({ label, value }) => (
            <button key={value}
              className={`filter-chip${statusFilter === value ? ' active' : ''}`}
              onClick={() => setStatusFilter(value)}>{label}</button>
          ))}

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'var(--brand-muted-deep)', opacity: 0.4 }} />

          {/* Client select */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Building2 size={14} style={{ position: 'absolute', left: 10, color: 'var(--brand-muted)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="form-select"
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              style={{
                paddingLeft: 32, minWidth: 170, fontSize: '0.8rem',
                padding: '8px 32px 8px 32px', height: 34,
              }}
            >
              <option value="all">Todos os Clientes</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date preset select */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Calendar size={14} style={{ position: 'absolute', left: 10, color: 'var(--brand-muted)', pointerEvents: 'none', zIndex: 1 }} />
            <select
              className="form-select"
              value={datePreset}
              onChange={(e) => {
                setDatePreset(e.target.value);
                setShowDateCustom(e.target.value === 'custom');
                if (e.target.value !== 'custom') { setDateFrom(''); setDateTo(''); }
              }}
              style={{
                paddingLeft: 32, minWidth: 155, fontSize: '0.8rem',
                padding: '8px 32px 8px 32px', height: 34,
              }}
            >
              {DATE_PRESETS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Custom date range (conditional) */}
        {showDateCustom && (
          <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center', marginTop: 'var(--space-8)', paddingLeft: 28 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-muted)' }}>De:</span>
            <input type="date" className="form-input"
              style={{ width: 150, fontSize: '0.8rem', padding: '6px 10px', height: 34 }}
              value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-muted)' }}>Até:</span>
            <input type="date" className="form-input"
              style={{ width: 150, fontSize: '0.8rem', padding: '6px 10px', height: 34 }}
              value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        )}

        {/* Row 3: Score filters + Search + Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center', marginTop: 'var(--space-10)', flexWrap: 'wrap' }}>
          <Zap size={15} style={{ color: 'var(--brand-muted)', flexShrink: 0 }} />
          {[
            { label: 'Todos Scores', value: 'all' },
            { label: '🔵 Frio', value: 'Frio' },
            { label: '🟡 Morno', value: 'Morno' },
            { label: '🟢 Quente', value: 'Quente' },
          ].map(({ label, value }) => (
            <button key={value}
              className={`filter-chip${scoreFilter === value ? ' active' : ''}`}
              onClick={() => setScoreFilter(value)}>{label}</button>
          ))}

          <div style={{ flex: 1 }} />

          {/* Search */}
          <div style={{ position: 'relative', minWidth: 220, maxWidth: 360, flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-muted)' }} />
            <input className="form-input"
              style={{ paddingLeft: 36, height: 34, fontSize: '0.8rem' }}
              placeholder="Buscar nome, telefone, anúncio..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}
              style={{ fontSize: '0.65rem', padding: '6px 10px', color: 'var(--color-error)' }}>
              <X size={12} /> Limpar
            </button>
          )}

          <button className="btn btn-ghost btn-sm" onClick={loadLeads} title="Atualizar"
            style={{ fontSize: '0.65rem', padding: '6px 10px' }}>
            <RefreshCw size={12} /> Atualizar
          </button>
        </div>

        {/* Active filter summary */}
        {hasActiveFilters && (
          <div style={{
            marginTop: 'var(--space-8)', paddingTop: 'var(--space-8)',
            borderTop: 'var(--border-subtle)',
            fontSize: '0.7rem', color: 'var(--brand-muted)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-8)',
          }}>
            <Filter size={10} />
            Mostrando <strong style={{ color: 'var(--brand-accent)' }}>{filtered.length}</strong> de {leads.length} leads
            {clientFilter !== 'all' && (
              <span style={{ background: 'var(--brand-accent-10)', padding: '2px 8px', borderRadius: 'var(--radius-full)', color: 'var(--brand-accent)' }}>
                Cliente: {clients.find(c => c.id === clientFilter)?.name || clientFilter}
              </span>
            )}
            {datePreset !== 'all' && (
              <span style={{ background: 'var(--brand-blue-10)', padding: '2px 8px', borderRadius: 'var(--radius-full)', color: 'var(--brand-blue-light)' }}>
                {DATE_PRESETS.find(p => p.value === datePreset)?.label}
                {datePreset === 'custom' && dateFrom && ` (${dateFrom})`}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ERROR */}
      {error && (
        <div className="panel animate-in" style={{
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
          color: '#fca5a5', fontSize: 'var(--font-body-sm)', padding: 'var(--space-16)', marginBottom: 'var(--space-16)',
        }}>⚠️ Erro: {error}</div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="panel" style={{ textAlign: 'center', padding: 'var(--space-64)' }}>
          <Loader size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--brand-accent)' }} />
          <div style={{ color: 'var(--brand-muted)', marginTop: 'var(--space-12)' }}>Carregando leads...</div>
        </div>
      )}

      {/* LEADS GRID */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(370px, 1fr))', gap: 'var(--space-16)' }}>
          {filtered.map((lead) => <LeadCard key={lead.id} lead={lead} onOpen={openConversation} />)}
        </div>
      )}

      {/* CONVERSATION DRAWER */}
      {selectedLead && (
        <ConversationDrawer
          lead={selectedLead}
          messages={messages}
          loading={loadingMessages}
          onClose={closeConversation}
        />
      )}

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: 'var(--space-64)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-16)' }}>
            {leads.length === 0 ? '📱' : '🔍'}
          </div>
          <div style={{ color: 'var(--brand-muted)', fontSize: 'var(--font-body-md)', marginBottom: 'var(--space-8)' }}>
            {leads.length === 0 ? 'Nenhum lead WhatsApp ainda' : 'Nenhum lead encontrado com os filtros atuais'}
          </div>
          <div style={{ color: 'var(--brand-muted-deep)', fontSize: 'var(--font-body-sm)' }}>
            {leads.length === 0
              ? 'Os leads aparecerão aqui automaticamente quando alguém enviar mensagem via anúncio Click-to-WhatsApp.'
              : 'Tente limpar os filtros ou alterar a busca.'}
          </div>
          {hasActiveFilters && leads.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} style={{ marginTop: 'var(--space-16)' }}>
              <X size={14} /> Limpar Filtros
            </button>
          )}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--brand-muted-deep)', fontSize: 'var(--font-caption)' }}>
          Mostrando {filtered.length} de {leads.length} leads
        </div>
      )}
    </div>
  );
}

// ── LEAD CARD ────────────────────────────────────────────
function LeadCard({ lead, onOpen }) {
  const statusConf = STATUS_MAP[lead.status] || STATUS_MAP.new;
  const scoreConf = SCORE_CONFIG[lead.score_label] || SCORE_CONFIG.Frio;
  const ScoreIcon = scoreConf.icon;

  return (
    <div className="panel animate-in" onClick={() => onOpen(lead)} style={{
      marginBottom: 0, transition: 'all 0.2s ease', cursor: 'pointer',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = scoreConf.border;
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${scoreConf.border}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
      }}>
      {/* Score accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${scoreConf.color}, ${scoreConf.color}60)` }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 'var(--space-12)', paddingTop: 'var(--space-4)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-body-md)', color: 'var(--brand-offwhite)' }}>
            {lead.display_name || 'Lead Anônimo'}
          </div>
          <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)', marginTop: 2,
            display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <Clock size={10} /> {getTimeAgo(lead.created_at)}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px',
          borderRadius: 'var(--radius-full)', background: scoreConf.bg, border: `1px solid ${scoreConf.border}`,
          color: scoreConf.color, fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          <ScoreIcon size={13} /> {lead.score_label} {lead.score}
        </div>
      </div>

      {/* Contact info */}
      <div style={{ fontSize: 'var(--font-body-sm)', color: 'var(--brand-offwhite-80)',
        display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 'var(--space-12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          <Phone size={13} style={{ color: 'var(--brand-muted)', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{formatPhone(lead.phone)}</span>
        </div>
        {lead.ad_title && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <Megaphone size={13} style={{ color: 'var(--brand-accent)', flexShrink: 0 }} />
            <span style={{ color: 'var(--brand-accent-light)', fontSize: '0.8rem', overflow: 'hidden',
              textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.ad_title}</span>
          </div>
        )}
        {lead.first_message && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-8)', marginTop: 'var(--space-4)' }}>
            <MessageCircle size={13} style={{ color: '#25D366', flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: '0.8rem', fontStyle: 'italic', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              "{lead.first_message}"
            </span>
          </div>
        )}
      </div>

      {/* AI reason */}
      {lead.score_reason && (
        <div style={{ padding: 'var(--space-8) var(--space-12)', background: scoreConf.bg,
          borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: scoreConf.color,
          display: 'flex', alignItems: 'center', gap: 'var(--space-8)',
          marginBottom: 'var(--space-12)', border: `1px solid ${scoreConf.border}` }}>
          <Zap size={12} style={{ flexShrink: 0 }} />
          <span style={{ opacity: 0.9 }}>IA: {lead.score_reason}</span>
        </div>
      )}

      {/* Status + campaign */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-12)' }}>
        <span className={`status-badge ${statusConf.class}`} style={{ fontSize: '0.65rem' }}>
          <span className="status-dot" /> {statusConf.label}
        </span>
        {lead.campaign_name && (
          <span style={{ fontSize: '0.65rem', color: 'var(--brand-muted-deep)', maxWidth: '50%',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.campaign_name}</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
        <a href={`tel:+${lead.phone}`} className="btn btn-secondary btn-sm"
          onClick={(e) => e.stopPropagation()}
          style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', fontSize: '0.7rem' }}>
          <Phone size={13} /> Ligar
        </a>
        <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="btn btn-primary btn-sm"
          style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', background: '#25D366', border: 'none', fontSize: '0.7rem' }}>
          <MessageCircle size={13} /> WhatsApp
        </a>
        {(lead.messages_count || 0) > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-muted)',
            fontSize: '0.65rem', padding: '6px 8px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.04)' }}>
            <Hash size={10} />{lead.messages_count}
          </div>
        )}
      </div>
    </div>
  );
}

// ── CONVERSATION DRAWER ──────────────────────────────────
function ConversationDrawer({ lead, messages, loading, onClose }) {
  const scoreConf = SCORE_CONFIG[lead.score_label] || SCORE_CONFIG.Frio;
  const ScoreIcon = scoreConf.icon;

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)', zIndex: 999,
        animation: 'fadeIn 0.2s ease',
      }} />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(520px, 95vw)', zIndex: 1000,
        background: 'var(--brand-bg-card)', borderLeft: 'var(--border-subtle)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-16) var(--space-20)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-16)',
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'relative', zIndex: 10,
        }}>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
            <ArrowLeft size={18} />
          </button>
          
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${scoreConf.color}40, ${scoreConf.color}80)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--brand-offwhite)', fontWeight: 'bold', fontSize: '1rem',
            boxShadow: `0 0 10px ${scoreConf.color}30`
          }}>
            {lead.display_name ? lead.display_name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--brand-offwhite)', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {lead.display_name || 'Lead Anônimo'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--brand-muted)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginTop: 2 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Phone size={10} /> {formatPhone(lead.phone)}
              </span>
              {lead.ad_title && (
                <>
                  <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--brand-muted-deep)' }} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-accent-light)' }}>
                    <Megaphone size={10} /> <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.ad_title}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div style={{
          flex: 1, overflow: 'auto',
          display: 'flex', flexDirection: 'column',
          background: 'var(--brand-bg)',
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}>
          {/* AI Analysis Floating Card */}
          {lead.score_reason && (
            <div style={{
              margin: 'var(--space-16) var(--space-20)',
              padding: 'var(--space-12) var(--space-16)',
              background: `linear-gradient(to right, rgba(255,255,255,0.03), rgba(0,0,0,0.2))`,
              border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: `3px solid ${scoreConf.color}`,
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem', color: 'var(--brand-offwhite-80)',
              display: 'flex', alignItems: 'flex-start', gap: 'var(--space-12)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{ 
                background: scoreConf.color, color: '#000', padding: 4, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2,
                boxShadow: `0 0 10px ${scoreConf.color}60`
              }}>
                <Zap size={10} fill="#000" />
              </div>
              <div style={{ flex: 1, lineHeight: 1.5 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <strong style={{ color: scoreConf.color, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Análise de Intenção
                  </strong>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                    borderRadius: 'var(--radius-full)', background: scoreConf.bg,
                    border: `1px solid ${scoreConf.border}`, color: scoreConf.color,
                    fontSize: '0.65rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    <ScoreIcon size={10} /> {lead.score_label} {lead.score}
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem' }}>{lead.score_reason}</div>
              </div>
            </div>
          )}

          {/* Messages Wrapper */}
          <div style={{ padding: '0 var(--space-20) var(--space-20)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-32)', color: 'var(--brand-muted)' }}>
                <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
                <div style={{ marginTop: 'var(--space-8)', fontSize: 'var(--font-body-sm)' }}>Sincronizando conversas...</div>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--space-32)' }}>
                <MessageCircle size={32} style={{ color: 'var(--brand-muted-deep)', marginBottom: 'var(--space-8)' }} />
                <div style={{ color: 'var(--brand-muted)', fontSize: 'var(--font-body-sm)' }}>
                  Histórico de mensagens não disponível.
                </div>
                {lead.first_message && (
                  <div style={{
                    marginTop: 'var(--space-16)', padding: 'var(--space-12) var(--space-16)',
                    background: 'rgba(30, 41, 59, 0.6)', borderRadius: '18px 18px 18px 4px',
                    border: '1px solid rgba(255,255,255,0.05)', textAlign: 'left',
                    fontSize: '0.85rem', color: 'var(--brand-offwhite-80)', fontStyle: 'italic',
                    alignSelf: 'flex-start', maxWidth: '85%'
                  }}>
                    "{lead.first_message}"
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Date header */}
                <div style={{ textAlign: 'center', margin: 'var(--space-8) 0' }}>
                  <span style={{
                    fontSize: '0.65rem', color: 'var(--brand-muted)',
                    padding: '4px 12px', background: 'rgba(255,255,255,0.04)', 
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 'var(--radius-full)', fontWeight: 500, letterSpacing: '0.02em',
                    backdropFilter: 'blur(4px)',
                  }}>
                    {new Date(messages[0]?.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              {messages.map((msg, i) => {
                const isOut = msg.direction === 'outbound';
                return (
                  <div key={msg.id || i} style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: isOut ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isOut ? 'flex-end' : 'flex-start',
                  }}>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: isOut ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isOut 
                        ? 'linear-gradient(135deg, rgba(37,211,102,0.9) 0%, rgba(21,163,74,0.9) 100%)' 
                        : 'rgba(30, 41, 59, 0.85)',
                      border: isOut 
                        ? '1px solid rgba(37,211,102,0.3)'
                        : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      backdropFilter: isOut ? 'none' : 'blur(8px)',
                      WebkitBackdropFilter: isOut ? 'none' : 'blur(8px)',
                      fontSize: '0.9rem',
                      color: isOut ? '#fff' : 'var(--brand-offwhite)',
                      lineHeight: 1.45,
                      wordBreak: 'break-word',
                      position: 'relative',
                    }}>
                      {msg.message_type !== 'text' && (
                        <div style={{ fontSize: '0.75rem', color: isOut ? 'rgba(255,255,255,0.8)' : 'var(--brand-muted)', marginBottom: 4, fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 12 }}>📎</span> {msg.message_type}
                        </div>
                      )}
                      {msg.content}
                      
                      <div style={{ 
                        fontSize: '0.65rem', 
                        color: isOut ? 'rgba(255,255,255,0.7)' : 'var(--brand-muted)',
                        marginTop: 4, 
                        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4,
                        float: 'right', marginLeft: 12, transform: 'translateY(2px)'
                      }}>
                        {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        {isOut && <span style={{ fontSize: 10 }}>✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          padding: 'var(--space-12) var(--space-20)',
          borderTop: 'var(--border-subtle)',
          display: 'flex', gap: 'var(--space-8)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <a href={`tel:+${lead.phone}`}
            className="btn btn-secondary btn-sm"
            style={{ flex: 1, justifyContent: 'center', textDecoration: 'none', fontSize: '0.75rem' }}>
            <Phone size={14} /> Ligar
          </a>
          <a href={`https://wa.me/${lead.phone}`} target="_blank" rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
            style={{ flex: 1, justifyContent: 'center', textDecoration: 'none',
              background: '#25D366', border: 'none', fontSize: '0.75rem' }}>
            <MessageCircle size={14} /> Abrir WhatsApp
          </a>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── KPI CARD ─────────────────────────────────────────────
function KpiCard({ icon, label, value, color, highlight }) {
  return (
    <div className={`metric-card${highlight ? ' highlight' : ''}`} style={{ borderLeftColor: color }}>
      <div className="metric-card-header">
        <div className="metric-card-icon" style={{ background: `${color}15`, color }}>{icon}</div>
      </div>
      <div className="metric-card-value" style={{ fontSize: '1.75rem' }}>{value}</div>
      <div className="metric-card-label">{label}</div>
    </div>
  );
}

// ── HELPERS ──────────────────────────────────────────────
function formatPhone(phone) {
  if (!phone) return '—';
  const c = phone.replace(/\D/g, '');
  if (c.length === 13) return `+${c.slice(0,2)} (${c.slice(2,4)}) ${c.slice(4,9)}-${c.slice(9)}`;
  if (c.length === 12) return `+${c.slice(0,2)} (${c.slice(2,4)}) ${c.slice(4,8)}-${c.slice(8)}`;
  return phone;
}

function getTimeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
  if (diff < 1) return 'agora';
  if (diff < 60) return `${diff}min atrás`;
  const h = Math.floor(diff / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  if (d === 1) return 'ontem';
  if (d < 7) return `${d} dias atrás`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
