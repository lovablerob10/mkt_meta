import React, { forwardRef } from 'react';

const fmt = (n) => n ? n.toLocaleString('pt-BR') : '0';
const fmtCurrency = (n) => n ? `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00';

const PrintableReport = forwardRef(({ client, period, metrics, insightText, agencyLogo, clientLogo }, ref) => {
  return (
    <div 
      ref={ref} 
      style={{
        width: '794px', // A4 width at 96 PPI
        height: '1123px', // A4 height at 96 PPI
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
        <div style={{ width: '150px', height: '50px', display: 'flex', alignItems: 'center' }}>
          {agencyLogo ? (
            <img src={agencyLogo} alt="Agência" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>Z/MKT</div>
          )}
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Relatório de Performance</h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>{period}</p>
        </div>

        <div style={{ width: '150px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          {clientLogo ? (
            <img src={clientLogo} alt="Cliente" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
          ) : (
            <div style={{ fontSize: '16px', fontWeight: '600' }}>{client?.name || 'Cliente'}</div>
          )}
        </div>
      </div>

      {/* Main KPIs */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #E5E5E5', paddingBottom: '8px', marginBottom: '20px' }}>Visão Geral de Resultados</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {/* Card 1 */}
          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px', backgroundColor: '#FAFAFA' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Investimento Total</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '800' }}>{fmtCurrency(metrics?.spend)}</p>
          </div>
          
          {/* Card 2 */}
          <div style={{ border: '1px solid #000', borderRadius: '8px', padding: '20px', backgroundColor: '#000', color: '#FFF' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#CCC', fontWeight: '500' }}>Leads Gerados</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '800' }}>{fmt(metrics?.leads)}</p>
          </div>

          {/* Card 3 */}
          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px', backgroundColor: '#FAFAFA' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Custo por Lead (CPL)</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: '800' }}>
              {metrics?.leads > 0 ? fmtCurrency(metrics.spend / metrics.leads) : 'R$ 0,00'}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
          {/* Card 4 */}
          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Alcance</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700' }}>{fmt(metrics?.reach)}</p>
          </div>

          {/* Card 5 */}
          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Impressões</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700' }}>{fmt(metrics?.impressions)}</p>
          </div>

          {/* Card 6 */}
          <div style={{ border: '1px solid #E5E5E5', borderRadius: '8px', padding: '20px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>Cliques Totais</p>
            <p style={{ margin: '8px 0 0 0', fontSize: '20px', fontWeight: '700' }}>{fmt(metrics?.clicks)}</p>
          </div>
        </div>
      </div>

      {/* Insight Section */}
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #E5E5E5', paddingBottom: '8px', marginBottom: '20px' }}>Resumo Executivo & Insights</h2>
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
