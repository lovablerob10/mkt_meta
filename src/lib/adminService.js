import { supabase } from './supabase';

// ────────────────────────────────────────────────────────
// ZMKT Admin Service
// Camada de serviço para operações CRUD do painel Master
// ────────────────────────────────────────────────────────

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ========================
// PROFILES / USERS
// ========================

/**
 * Lista todos os perfis (Master vê todos via RLS)
 */
export async function listProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao listar perfis: ${error.message}`);
  return data;
}

/**
 * Cria novo usuário via Edge Function (requer service_role_key no backend)
 */
export async function createUser({ email, password, name, role, clientId }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Não autenticado');

  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ email, password, name, role, client_id: clientId }),
  });

  const result = await res.json();
  if (!res.ok) throw new Error(result.error || 'Erro ao criar usuário');
  return result;
}

/**
 * Atualiza perfil existente
 */
export async function updateProfile(id, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar perfil: ${error.message}`);
  return data;
}

/**
 * Deleta usuário (remove perfil — cascade deleta auth via FK)
 */
export async function deleteProfile(id) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Erro ao deletar perfil: ${error.message}`);
  return true;
}

// ========================
// CLIENTS
// ========================

/**
 * Lista todos os clientes
 */
export async function listClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Erro ao listar clientes: ${error.message}`);
  return data;
}

/**
 * Cria novo cliente
 */
export async function createClient({ name, email, phone, dashboardConfig }) {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('clients')
    .insert({
      name,
      email,
      phone,
      dashboard_config: dashboardConfig || {
        type: 'messages',
        showMetrics: ['spend', 'leads', 'reach', 'impressions'],
        dateRange: 'last_30d',
      },
      created_by: user?.id,
    })
    .select()
    .single();

  if (error) throw new Error(`Erro ao criar cliente: ${error.message}`);
  return data;
}

/**
 * Atualiza cliente
 */
export async function updateClient(id, updates) {
  const { data, error } = await supabase
    .from('clients')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`Erro ao atualizar cliente: ${error.message}`);
  return data;
}

/**
 * Deleta cliente
 */
export async function deleteClient(id) {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Erro ao deletar cliente: ${error.message}`);
  return true;
}

// ========================
// GESTOR ↔ CLIENT ASSIGNMENTS
// ========================

/**
 * Lista vínculos gestor-cliente
 */
export async function listGestorClients() {
  const { data, error } = await supabase
    .from('gestor_clients')
    .select(`
      gestor_id,
      client_id,
      assigned_at,
      profiles:gestor_id ( name, email ),
      clients:client_id ( name )
    `);

  if (error) throw new Error(`Erro ao listar vínculos: ${error.message}`);
  return data;
}

/**
 * Atribui gestor a um cliente
 */
export async function assignGestorToClient(gestorId, clientId) {
  const { data, error } = await supabase
    .from('gestor_clients')
    .insert({ gestor_id: gestorId, client_id: clientId })
    .select()
    .single();

  if (error) throw new Error(`Erro ao vincular gestor: ${error.message}`);
  return data;
}

/**
 * Remove vínculo gestor-cliente
 */
export async function removeGestorFromClient(gestorId, clientId) {
  const { error } = await supabase
    .from('gestor_clients')
    .delete()
    .eq('gestor_id', gestorId)
    .eq('client_id', clientId);

  if (error) throw new Error(`Erro ao remover vínculo: ${error.message}`);
  return true;
}
