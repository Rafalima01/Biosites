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

/** Anfitrião logado e cadastrado em `admins`, ou null. */
export async function getAdmin() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return { supabase, user: null, isAdmin: false };
  const { data: isAdmin } = await supabase.rpc('is_admin');
  return { supabase, user: data.user, isAdmin: Boolean(isAdmin) };
}
