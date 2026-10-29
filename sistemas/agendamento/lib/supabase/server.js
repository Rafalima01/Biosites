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
 */
export async function getPainel() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return { supabase, user: null, studios: [], studio: null };
  // A tabela de studios é pública (o site lê os ativos), então filtramos pelos vínculos da pessoa.
  const { data: studios } = await supabase.from('studios').select('id, slug, name, timezone, whatsapp, settings, active, site_url').order('name');
  const { data: vinculos } = await supabase.from('studio_members').select('studio_id').eq('email', data.user.email.toLowerCase());
  const { data: agencia } = await supabase.rpc('is_agency');
  const meus = new Set((vinculos || []).map((v) => v.studio_id));
  const permitidos = (studios || []).filter((s) => agencia || meus.has(s.id));
  const store = await cookies();
  const escolhido = store.get('studio')?.value;
  const studio = permitidos.find((s) => s.slug === escolhido) || permitidos[0] || null;
  return { supabase, user: data.user, studios: permitidos, studio, isAgency: Boolean(agencia) };
}
