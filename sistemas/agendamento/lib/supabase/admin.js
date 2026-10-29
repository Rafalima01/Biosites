import { createClient } from '@supabase/supabase-js';

/**
 * Cliente com a chave service_role: passa por cima do RLS. Usado só no servidor, no cadastro
 * pelo link de convite (criar o login e ligar ao studio). Nunca importe em componente do navegador.
 */
export function supabaseAdmin() {
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!chave) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, chave, { auth: { persistSession: false, autoRefreshToken: false } });
}
