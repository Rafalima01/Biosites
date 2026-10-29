'use server';
// Cadastro pelo link de convite: cria o login, liga ao studio e já entra no painel.
import { redirect } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { supabaseServer } from '@/lib/supabase/server';

const txt = (fd, k) => String(fd.get(k) ?? '').trim();

export async function aceitarConvite(_antes, fd) {
  const token = txt(fd, 'token');
  const email = txt(fd, 'email').toLowerCase();
  const senha = String(fd.get('senha') ?? '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: 'Confira o e-mail.' };
  if (senha.length < 8) return { erro: 'A senha precisa ter pelo menos 8 caracteres.' };
  if (senha !== String(fd.get('confirmar') ?? '')) return { erro: 'As duas senhas não são iguais.' };

  const admin = supabaseAdmin();
  if (!admin) return { erro: 'Cadastro indisponível no momento. Fale com a Vertex Labs.' };

  // Reserva o convite antes de criar o login: dois envios ao mesmo tempo não usam o mesmo link.
  const { data: reservado } = await admin
    .from('invites')
    .update({ used_at: new Date().toISOString(), used_email: email })
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .select('studio_id');
  const convite = reservado?.[0];
  if (!convite) return { erro: 'Este link já foi usado ou expirou. Peça um novo para a Vertex Labs.' };

  const { error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true });
  if (error) {
    await admin.from('invites').update({ used_at: null, used_email: null }).eq('token', token);
    return {
      erro: /already|registered|exists/i.test(error.message)
        ? 'Esse e-mail já tem cadastro. Use outro ou fale com a Vertex Labs.'
        : 'Não foi possível criar o cadastro agora. Tente de novo.',
    };
  }
  await admin.from('studio_members').upsert({ studio_id: convite.studio_id, email }, { onConflict: 'studio_id,email', ignoreDuplicates: true });

  const supabase = await supabaseServer();
  await supabase.auth.signInWithPassword({ email, password: senha });
  redirect('/');
}
