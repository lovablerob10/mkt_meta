import { useState } from 'react';
import {
  Phone, Mail, MessageCircle, ExternalLink,
  Filter, Search, UserPlus,
} from 'lucide-react';
import { MOCK_LEADS } from '../data/mockData';

const STATUS_MAP = {
  new: { label: 'Novo', class: 'good' },
  contacted: { label: 'Contatado', class: 'warning' },
  converted: { label: 'Convertido', class: 'good' },
};

export default function Leads() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MOCK_LEADS.filter((lead) => {
    if (filter !== 'all' && lead.status !== filter) return false;
    if (search && !lead.name.toLowerCase().includes(search.toLowerCase()) &&
        !lead.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-content">
      <div className="page-heading animate-in">
        <h1>Central de <span className="accent">Leads</span></h1>
        <p className="page-description">
          Todos os leads gerados por formulários e WhatsApp. Clique para entrar em contato.
        </p>
      </div>

      {/* Filters */}
      <div className="filter-bar animate-in" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 'var(--space-12)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={16} style={{ color: 'var(--brand-muted)' }} />
          {[
            { label: 'Todos', value: 'all' },
            { label: '🟢 Novos', value: 'new' },
            { label: '🟡 Contatados', value: 'contacted' },
            { label: '✅ Convertidos', value: 'converted' },
          ].map(({ label, value }) => (
            <button
              key={value}
              className={`filter-chip${filter === value ? ' active' : ''}`}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--brand-muted)',
            }} />
            <input
              className="form-input"
              style={{ paddingLeft: 36, maxWidth: 240 }}
              placeholder="Buscar lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Leads grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: 'var(--space-16)',
      }}>
        {filtered.map((lead) => (
          <div key={lead.id} className="panel animate-in" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-16)' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-body-md)', color: 'var(--brand-offwhite)' }}>
                  {lead.name}
                </div>
                <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted)', marginTop: 4 }}>
                  {lead.source}
                </div>
              </div>
              <span className={`status-badge ${STATUS_MAP[lead.status].class}`}>
                <span className="status-dot" />
                {STATUS_MAP[lead.status].label}
              </span>
            </div>

            <div style={{ fontSize: 'var(--font-body-sm)', color: 'var(--brand-offwhite-80)', marginBottom: 'var(--space-12)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)', marginBottom: 6 }}>
                <Mail size={14} style={{ color: 'var(--brand-muted)' }} />
                {lead.email}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
                <Phone size={14} style={{ color: 'var(--brand-muted)' }} />
                {lead.phone}
              </div>
            </div>

            <div style={{ fontSize: 'var(--font-caption)', color: 'var(--brand-muted-deep)', marginBottom: 'var(--space-16)' }}>
              {lead.campaign} · {new Date(lead.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
              <a
                href={`tel:${lead.phone}`}
                className="btn btn-secondary btn-sm"
                title="Ligar"
              >
                <Phone size={14} /> Ligar
              </a>
              <a
                href={`https://wa.me/${lead.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ background: '#25D366', border: 'none' }}
                title="WhatsApp"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a
                href={`mailto:${lead.email}`}
                className="btn btn-ghost btn-sm"
                title="E-mail"
              >
                <Mail size={14} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="panel" style={{ textAlign: 'center', padding: 'var(--space-64)' }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--space-16)' }}>🔍</div>
          <div style={{ color: 'var(--brand-muted)' }}>Nenhum lead encontrado.</div>
        </div>
      )}
    </div>
  );
}
