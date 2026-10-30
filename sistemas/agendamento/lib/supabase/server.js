import { cache } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/** Cliente do Supabase para Server Components e Server Actions (usa a sessão do cookie). */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components não podem gravar cookies; o middleware renova a sessão.
        }
      },
    },
  });
}

/**
 * Quem está logado e quais studios pode gerenciar (o banco só devolve os permitidos).
 * O studio atual vem do cookie "studio" (quando a pessoa tem mais de um) ou é o primeiro.
 * `cache`: o layout e a página pedem isso na mesma visita; o banco é consultado uma vez só.
 * O login é conferido pela assinatura do token (getClaims), sem ida extra ao servidor de login.
 */
export const getPainel = cache(async () => {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.email) return { supabase, user: null, studios: [], studio: null };
  const user = { id: claims.sub, email: claims.email };
  // A tabela de studios é pública (o site lê os ativos), então filtramos pelos vínculos da pessoa.
  const [{ data: studios }, { data: vinculos }, { data: agencia }] = await Promise.all([
    supabase.from('studios').select('id, slug, name, timezone, whatsapp, settings, active, site_url').order('name'),
    supabase.from('studio_members').select('studio_id').eq('email', user.email.toLowerCase()),
    supabase.rpc('is_agency'),
  ]);
  const meus = new Set((vinculos || []).map((v) => v.studio_id));
  const permitidos = (studios || []).filter((s) => agencia || meus.has(s.id));
  const store = await cookies();
  const escolhido = store.get('studio')?.value;
  const studio = permitidos.find((s) => s.slug === escolhido) || permitidos[0] || null;
  return { supabase, user, studios: permitidos, studio, isAgency: Boolean(agencia) };
});
