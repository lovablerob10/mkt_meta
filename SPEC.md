# SPEC.md — Z/MKT Dashboard
> Versão: 1.0 | Data: 2026-04-09
> Método: Spec-Driven Development (SDD)

---

## 1. Visão do Produto

### Missão
Plataforma SaaS de gestão e transparência para a agência **Z/MKT Assessoria de Marketing Digital**, que gerencia múltiplas contas de anúncio no Meta Ads (Facebook/Instagram) para diversos clientes simultaneamente.

### Proposta de Valor
Substituir planilhas e prints manuais por um painel unificado, automatizado e white-label, onde:
- O **gestor** acompanha todas as contas em tempo real.
- O **cliente** recebe acesso autônomo a um dashboard isolado e elegante com seus próprios números.
- Relatórios profissionais em PDF são gerados com 2 cliques.

### Personas

| Persona | Role (RBAC) | Descrição | Acesso |
|---------|-------------|-----------|--------|
| Proprietário (Zara) | `MASTER` | Dono da agência. Controle total sobre o sistema, clientes, gestores e faturamento. | Todas as rotas e funcionalidades |
| Analista de Tráfego | `GESTOR` | Funcionário/freelancer da agência. Gerencia campanhas e leads dos clientes atribuídos. | Dashboard Admin, Campanhas, Leads, Clientes (atribuídos), Relatórios |
| Cliente Final | `CLIENTE` | Dono do negócio anunciante (ex: M Politano, MC Cortinas). Acessa apenas seus dados. | Dashboard Cliente (isolado), Central de Leads (se aplicável) |

---

## 2. Funcionalidades (Features)

### 2.1 Dashboard Administrativo (`/`)
- KPIs globais: Investimento Total, Leads Total, CPL Médio, Alcance
- Cards de conta de anúncio com status de saldo
- Gráficos demográficos (gênero, faixa etária)
- Tabela de campanhas ativas

### 2.2 Dashboard do Cliente (`/client`)
- Visão isolada por `client_id`
- Abas: "Visão Geral" e "Central de Leads" (condicional por `dashboardConfig.type`)
- Métricas personalizáveis pelo gestor

### 2.3 Central de Leads (`/leads`)
- Listagem de leads com busca, filtro por status e filtro por cliente
- Status: Novo, Contatado, Convertido
- Dados: Nome, E-mail, Telefone, Fonte, Campanha, Data

### 2.4 Gestão de Clientes (`/clients`)
- Cadastro via wizard (3 steps)
- Upload de logo do cliente
- Configuração de template do dashboard (branding | messages | real_estate)
- Seleção granular de métricas visíveis
- Botão "Ver Dash" para preview do dashboard do cliente
- Envio de credenciais via WhatsApp

### 2.5 Relatórios PDF (`/reports`)
- Seleção de cliente e período
- Upload de logos (agência + cliente) para white-label
- Preview 16:9 em tempo real (dark/light theme)
- Métricas: Alcance, Impressões, Cliques, Leads, CPC, CPR
- Tabela de subcampanhas (quando aplicável)
- Insight da agência (texto dinâmico)
- Exportação: PDF download + envio WhatsApp

### 2.6 IA de Atendimento (AIChatWidget)
- Widget flutuante no canto inferior direito
- Respostas automáticas baseadas em contexto
- Status: em construção

---

## 3. Arquitetura Técnica

### Stack
| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite |
| Estilo | CSS puro (Design System dark premium) |
| Roteamento | react-router-dom v6 |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS) |
| Deploy | Cloudflare Pages |
| API Externa | Meta Marketing API (OAuth 2.0) |
| Geração PDF | Futuro: html2canvas + jsPDF ou Supabase Edge Function |

### Autenticação & RBAC

```
┌─────────────┐
│   MASTER    │ ──→ Acesso total (todas as rotas + config global)
├─────────────┤
│   GESTOR    │ ──→ Dashboard, Campanhas, Leads, Clientes (atribuídos), Relatórios
├─────────────┤
│   CLIENTE   │ ──→ Apenas /client (dados isolados por RLS)
└─────────────┘
```

- **Auth Provider**: Supabase Auth (e-mail/senha)
- **Frontend Guard**: `<ProtectedRoute>` component com checagem de role
- **Backend Guard**: Row Level Security (RLS) no PostgreSQL
- **Tabela de usuários**: `profiles` com coluna `role` (enum: master, gestor, cliente)

### Isolamento de Dados
- RLS obrigatório em todas as tabelas de dados do cliente
- Gestor só vê clientes onde `gestor_id = auth.uid()`
- Cliente só vê registros onde `client_id = auth.uid()`
- Master bypassa RLS via role check

---

## 4. Regras de Negócio

1. **Isolamento total**: Cliente A nunca vê dados do Cliente B (enforcement via RLS + frontend guards)
2. **Gestores atribuídos**: Cada gestor só gerencia os clientes designados pelo master
3. **Dashboard configurable**: O gestor escolhe o template e métricas visíveis para cada cliente
4. **White-label**: Relatórios carregam logo da agência + logo do cliente
5. **Central de Leads condicional**: Só aparece para clientes com tipo `messages` ou `real_estate`
6. **Dados reais via API**: Quando conectado ao Meta, os dados mockados serão substituídos automaticamente

---

## 5. Critérios de Aceitação

| ID | Critério | Status |
|----|----------|--------|
| AC-01 | Login funcional com redirecionamento por role | 🔲 Pendente |
| AC-02 | Master vê sidebar completa, Gestor vê parcial, Cliente não vê sidebar | 🔲 Pendente |
| AC-03 | Cliente acessando `/clients` via URL é redirecionado para `/client` | 🔲 Pendente |
| AC-04 | Preview de relatório renderiza dados corretos por cliente | ✅ Feito |
| AC-05 | Subcampanhas aparecem na tabela quando existem | ✅ Feito |
| AC-06 | Filtro de leads por cliente funciona no admin | ✅ Feito |
| AC-07 | Aba "Central de Leads" condicional no dashboard do cliente | ✅ Feito |
| AC-08 | Upload de logos aparece no preview do PDF | ✅ Feito |
| AC-09 | Botão "Ver Dash" redireciona para dashboard do cliente específico | ✅ Feito |
| AC-10 | Build sem erros no Cloudflare Pages | ✅ Feito |

---

## 6. Roadmap

| Fase | Descrição | Status |
|------|-----------|--------|
| **Fase 1** | Frontend mockado com design premium | ✅ Concluída |
| **Fase 2** | RBAC frontend (Login + ProtectedRoute + AuthContext) | 🔄 Em progresso |
| **Fase 3** | Supabase (Auth real + DB + RLS) | 🔲 Aguardando credenciais |
| **Fase 4** | Meta Ads API (OAuth + dados reais) | 🔲 Planejado |
| **Fase 5** | Relatórios multi-página + geração PDF real | 🔲 Planejado |
| **Fase 6** | IA de atendimento (AIChatWidget) funcional | 🔲 Planejado |

---

## 7. Convenções de Código

- **Nomes de arquivo**: PascalCase para componentes (`MetricCard.jsx`), camelCase para utils (`mockData.js`)
- **CSS**: Vanilla CSS com variáveis CSS (design tokens em `index.css`)
- **Commits**: Convenção semântica (`feat:`, `fix:`, `docs:`, `refactor:`)
- **Estrutura de pastas**:
  ```
  src/
  ├── components/     # Componentes reutilizáveis
  ├── contexts/       # React Context (Auth, Theme)
  ├── data/           # Dados mockados
  ├── pages/          # Páginas/rotas
  └── styles/         # CSS adicional (se necessário)
  ```
