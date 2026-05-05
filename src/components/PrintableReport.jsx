import React, { forwardRef } from 'react';

const fmt = (n) => n ? n.toLocaleString('pt-BR') : '0';
const fmtCurrency = (n) => n ? `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00';

const PrintableReport = forwardRef(({ client, period, metrics, insightText, agencyLogo, clientLogo, campaigns = [] }, ref) => {
  const cellStyle = { padding: '8px 10px', fontSize: '11px', textAlign: 'left', borderBottom: '1px solid #E5E5E5', color: '#333' };
  const cellBold = { ...cellStyle, fontWeight: 700, color: '#000' };
  const cellRight = { ...cellStyle, textAlign: 'right' };
  const cellRightBold = { ...cellRight, fontWeight: 700, color: '#000' };

  return (
    <div 
      ref={ref} 
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#FFFFFF',
        color: '#000000',
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '40px 50px',
        boxSizing: 'border-box',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px', color: '#000000' }}>
        <div style={{ width: '150px', height: '50px', display: 'flex', alignItems: 'center' }}>
          {agencyLogo ? (
            <img src={agencyLogo} alt="Agência" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px', color: '#000000' }}>Z/MKT</div>
          )}
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: '#000000' }}>Relatório de Performance</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>{period}</p>
        </div>

        <div style={{ width: '150px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {clientLogo ? (
            <img src={clientLogo} alt="Cliente" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#000000' }}>{client?.name || 'Cliente'}</div>
          )}
        </div>
      </div>

      {/* Main KPIs */}
      <div style={{ marginBottom: campaigns.length > 0 ? '24px' : '40px' }}>
        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #E5E5E5', paddingBottom: '8px', marginBottom: '20px', color: '#000000', fontWeight: '800' }}>Visão Geral de Resultados</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px', backgroundColor: '#FAFAFA' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Investimento Total</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#000000' }}>{fmtCurrency(metrics?.spend)}</p>
          </div>
          
          <div style={{ border: '1px solid #000', borderRadius: '8px', padding: '20px', backgroundColor: '#000', color: '#FFF' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#CCC', fontWeight: '500' }}>Leads Gerados</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#FFFFFF' }}>{fmt(metrics?.leads)}</p>
          </div>

          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px', backgroundColor: '#FAFAFA' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Custo por Lead (CPL)</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '900', color: '#000000' }}>
              {metrics?.leads > 0 ? fmtCurrency(metrics.spend / metrics.leads) : 'R$ 0,00'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px', backgroundColor: '#FAFAFA' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Alcance</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#000000' }}>{fmt(metrics?.reach)}</p>
          </div>

          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px', backgroundColor: '#FAFAFA' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Impressões</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#000000' }}>{fmt(metrics?.impressions)}</p>
          </div>

          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px', backgroundColor: '#FAFAFA' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Cliques Totais</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '800', color: '#000000' }}>{fmt(metrics?.clicks)}</p>
          </div>
        </div>
      </div>

      {/* Campaign Breakdown Table */}
      {campaigns.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #E5E5E5', paddingBottom: '8px', marginBottom: '16px', color: '#000000', fontWeight: '800' }}>Detalhamento por Campanha</h2>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr style={{ backgroundColor: '#111', color: '#FFF' }}>
                <th style={{ padding: '10px 10px', textAlign: 'left', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Campanha</th>
                <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leads</th>
                <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Investimento</th>
                <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CPL</th>
                <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alcance</th>
                <th style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cliques</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((camp, i) => {
                const ci = camp.insights || {};
                return (
                  <tr key={camp.id} style={{ backgroundColor: i % 2 === 0 ? '#FAFAFA' : '#FFFFFF' }}>
                    <td style={cellBold}>{camp.name}</td>
                    <td style={cellRightBold}>{fmt(ci.leads)}</td>
                    <td style={cellRight}>{fmtCurrency(ci.spend)}</td>
                    <td style={cellRight}>{ci.leads > 0 ? fmtCurrency(ci.cpl) : '—'}</td>
                    <td style={cellRight}>{fmt(ci.reach)}</td>
                    <td style={cellRight}>{fmt(ci.clicks)}</td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr style={{ backgroundColor: '#111', color: '#FFF' }}>
                <td style={{ padding: '10px 10px', fontWeight: 800, fontSize: '11px' }}>TOTAL</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 800, fontSize: '11px' }}>{fmt(campaigns.reduce((s, c) => s + (c.insights?.leads || 0), 0))}</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '11px' }}>{fmtCurrency(campaigns.reduce((s, c) => s + (c.insights?.spend || 0), 0))}</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '11px' }}>
                  {(() => {
                    const totalLeads = campaigns.reduce((s, c) => s + (c.insights?.leads || 0), 0);
                    const totalSpend = campaigns.reduce((s, c) => s + (c.insights?.spend || 0), 0);
                    return totalLeads > 0 ? fmtCurrency(totalSpend / totalLeads) : '—';
                  })()}
                </td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '11px' }}>{fmt(campaigns.reduce((s, c) => s + (c.insights?.reach || 0), 0))}</td>
                <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, fontSize: '11px' }}>{fmt(campaigns.reduce((s, c) => s + (c.insights?.clicks || 0), 0))}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Insight Section */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #E5E5E5', paddingBottom: '8px', marginBottom: '20px', color: '#000000', fontWeight: '800' }}>Resumo Executivo & Insights</h2>
        <div style={{ 
          borderLeft: '4px solid #000', 
          padding: '20px 30px', 
          backgroundColor: '#FAFAFA',
          fontSize: '14px',
          lineHeight: '1.8',
          color: '#333'
        }}>
          {insightText ? (
            <div dangerouslySetInnerHTML={{ __html: insightText.replace(/\n/g, '<br/>') }} />
          ) : (
            <span style={{ fontStyle: 'italic', color: '#999' }}>Nenhum insight fornecido para este período.</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid #E5E5E5', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#999' }}>
        <div>Gerado via Z/MKT Report</div>
        <div>Confidencial • {new Date().toLocaleDateString('pt-BR')}</div>
      </div>
    </div>
  );
});

PrintableReport.displayName = 'PrintableReport';

export default PrintableReport;
