'use server';
// Ações do painel. Cada uma confere se quem chama é anfitrião; o banco confere de novo (RLS).
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdmin } from '@/lib/supabase/server';
import { withDefaults } from '@/lib/settings';
import { slugify } from '@/lib/format';

async function admin() {
  const ctx = await getAdmin();
  if (!ctx.isAdmin) throw new Error('Acesso negado.');
  return ctx.supabase;
}

const text = (fd, k) => String(fd.get(k) ?? '').trim();
// Aceita "1.290,50" (formato brasileiro) e "1290.5".
const num = (fd, k) => {
  const raw = text(fd, k).replace(/^R\$\s*/, '');
  if (raw === '') return null;
  const thousands = /^\d{1,3}(\.\d{3})+$/.test(raw); // 1.490 = mil quatrocentos e noventa
  const v = raw.includes(',') || thousands ? raw.replace(/\./g, '').replace(',', '.') : raw;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const done = (paths, message = 'Salvo!') => {
  for (const p of ['/', ...paths]) revalidatePath(p, p === '/admin' ? 'layout' : 'page');
  return { ok: true, message };
};
const fail = (error) => ({ ok: false, message: friendly(error) });

function friendly(error) {
  const m = String(error?.message || error || '');
  if (/duplicate key.*slug/.test(m)) return 'Já existe uma casa com esse endereço (slug). Escolha outro.';
  if (/violates check constraint/.test(m)) return 'Algum valor está fora do permitido. Confira datas e números.';
  if (/foreign key/.test(m)) return 'Este item está ligado a reservas e não pode ser apagado. Desative-o.';
  return m || 'Não foi possível salvar.';
}

export async function signOut() {
  const ctx = await getAdmin();
  await ctx.supabase.auth.signOut();
  redirect('/admin/login');
}

// ---------------- Reservas ----------------
export async function setBookingStatus(id, status) {
  try {
    const supabase = await admin();
    const { error } = await supabase.rpc('set_booking_status', { p_id: id, p_status: status });
    if (error) return fail(error);
    return done(['/admin', '/admin/reservas', '/admin/agenda'], status === 'confirmed' ? 'Reserva confirmada.' : status === 'cancelled' ? 'Reserva cancelada.' : 'Reserva reativada por 24h.');
  } catch (e) {
    return fail(e);
  }
}

export async function saveBookingNotes(id, notes) {
  try {
    const supabase = await admin();
    const { error } = await supabase.from('bookings').update({ admin_notes: String(notes).slice(0, 2000) }).eq('id', id);
    return error ? fail(error) : done(['/admin/reservas'], 'Anotação salva.');
  } catch (e) {
    return fail(e);
  }
}

// ---------------- Casas ----------------
export async function saveHouse(_prev, fd) {
  try {
    const supabase = await admin();
    const id = text(fd, 'id');
    const name = text(fd, 'name');
    const row = {
      name,
      slug: slugify(text(fd, 'slug') || name),
      location: text(fd, 'location'),
      tag: text(fd, 'tag'),
      summary: text(fd, 'summary'),
      description: text(fd, 'description'),
      guests: num(fd, 'guests'),
      bedrooms: num(fd, 'bedrooms') ?? 0,
      baths: num(fd, 'baths') ?? 0,
      price: num(fd, 'price'),
      weekend_price: num(fd, 'weekend_price'),
      cleaning_fee: num(fd, 'cleaning_fee') ?? 0,
      min_nights: num(fd, 'min_nights') ?? 1,
      amenities: text(fd, 'amenities').split('\n').map((s) => s.trim()).filter(Boolean),
      active: fd.get('active') === 'on',
      sort: num(fd, 'sort') ?? 0,
    };
    if (!row.name || !row.price || !row.guests) return { ok: false, message: 'Preencha nome, diária e capacidade.' };
    const q = id ? supabase.from('houses').update(row).eq('id', id).select('id').single() : supabase.from('houses').insert(row).select('id').single();
    const { data, error } = await q;
    if (error) return fail(error);
    if (!id) redirect(`/admin/casas/${data.id}?nova=1`);
    return done(['/admin/casas', `/admin/casas/${id}`], 'Casa salva.');
  } catch (e) {
    if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
    return fail(e);
  }
}

export async function deleteHouse(id) {
  try {
    const supabase = await admin();
    const { count } = await supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('house_id', id);
    if (count) {
      await supabase.from('houses').update({ active: false }).eq('id', id);
      return done(['/admin/casas'], 'A casa tem reservas no histórico, então foi apenas desativada.');
    }
    const { data: photos } = await supabase.from('house_photos').select('path').eq('house_id', id);
    const paths = (photos || []).map((p) => p.path).filter(Boolean);
    if (paths.length) await supabase.storage.from('fotos').remove(paths);
    const { error } = await supabase.from('houses').delete().eq('id', id);
    if (error) return fail(error);
  } catch (e) {
    return fail(e);
  }
  revalidatePath('/');
  redirect('/admin/casas');
}

export async function addPhotos(houseId, photos) {
  try {
    const supabase = await admin();
    const { data: last } = await supabase.from('house_photos').select('sort').eq('house_id', houseId).order('sort', { ascending: false }).limit(1);
    let sort = last?.[0]?.sort ?? 0;
    const rows = photos.map((p) => ({ house_id: houseId, url: p.url, path: p.path || null, alt: p.alt || '', sort: ++sort }));
    const { error } = await supabase.from('house_photos').insert(rows);
    return error ? fail(error) : done([`/admin/casas/${houseId}`], 'Fotos adicionadas.');
  } catch (e) {
    return fail(e);
  }
}

export async function updatePhoto(id, houseId, patch) {
  try {
    const supabase = await admin();
    const { error } = await supabase.from('house_photos').update({ alt: String(patch.alt ?? '').slice(0, 200) }).eq('id', id);
    return error ? fail(error) : done([`/admin/casas/${houseId}`], 'Descrição salva.');
  } catch (e) {
    return fail(e);
  }
}

export async function movePhoto(houseId, id, direction) {
  try {
    const supabase = await admin();
    const { data } = await supabase.from('house_photos').select('id, sort').eq('house_id', houseId).order('sort').order('created_at');
    const list = data || [];
    const i = list.findIndex((p) => p.id === id);
    const j = direction === 'up' ? i - 1 : direction === 'first' ? 0 : i + 1;
    if (i < 0 || j < 0 || j >= list.length || i === j) return { ok: true };
    const [item] = list.splice(i, 1);
    list.splice(j, 0, item);
    await Promise.all(list.map((p, k) => supabase.from('house_photos').update({ sort: k + 1 }).eq('id', p.id)));
    return done([`/admin/casas/${houseId}`], 'Ordem atualizada.');
  } catch (e) {
    return fail(e);
  }
}

export async function deletePhoto(id, houseId) {
  try {
    const supabase = await admin();
    const { data } = await supabase.from('house_photos').select('path').eq('id', id).single();
    if (data?.path) await supabase.storage.from('fotos').remove([data.path]);
    const { error } = await supabase.from('house_photos').delete().eq('id', id);
    return error ? fail(error) : done([`/admin/casas/${houseId}`], 'Foto removida.');
  } catch (e) {
    return fail(e);
  }
}

// ---------------- Bloqueios da agenda ----------------
export async function addBlock(_prev, fd) {
  try {
    const supabase = await admin();
    const row = { house_id: text(fd, 'house_id'), starts_on: text(fd, 'starts_on'), ends_on: text(fd, 'ends_on'), reason: text(fd, 'reason') };
    if (!row.house_id || !row.starts_on || !row.ends_on) return { ok: false, message: 'Escolha a casa e as datas.' };
    if (row.ends_on <= row.starts_on) return { ok: false, message: 'A saída precisa ser depois da entrada.' };
    const { error } = await supabase.from('blocks').insert(row);
    return error ? fail(error) : done(['/admin/agenda', '/admin'], 'Datas bloqueadas.');
  } catch (e) {
    return fail(e);
  }
}

export async function deleteBlock(id) {
  try {
    const supabase = await admin();
    const { error } = await supabase.from('blocks').delete().eq('id', id);
    return error ? fail(error) : done(['/admin/agenda', '/admin'], 'Bloqueio removido.');
  } catch (e) {
    return fail(e);
  }
}

// ---------------- Promoções ----------------
export async function savePromotion(_prev, fd) {
  try {
    const supabase = await admin();
    const kind = text(fd, 'kind');
    const value = num(fd, 'value');
    const row = {
      house_id: text(fd, 'house_id') || null,
      label: text(fd, 'label') || 'Promoção',
      starts_on: text(fd, 'starts_on'),
      ends_on: text(fd, 'ends_on'),
      percent_off: kind === 'percent' ? value : null,
      nightly_price: kind === 'price' ? value : null,
      active: true,
    };
    if (!row.starts_on || !row.ends_on || !value) return { ok: false, message: 'Preencha o período e o valor.' };
    if (row.ends_on < row.starts_on) return { ok: false, message: 'A data final precisa ser igual ou depois da inicial.' };
    if (kind === 'percent' && (value <= 0 || value >= 100)) return { ok: false, message: 'O desconto deve ficar entre 1% e 99%.' };
    const id = text(fd, 'id');
    const { error } = id ? await supabase.from('promotions').update(row).eq('id', id) : await supabase.from('promotions').insert(row);
    return error ? fail(error) : done(['/admin/promocoes', '/admin/agenda'], 'Promoção salva.');
  } catch (e) {
    return fail(e);
  }
}

export async function togglePromotion(id, active) {
  try {
    const supabase = await admin();
    const { error } = await supabase.from('promotions').update({ active }).eq('id', id);
    return error ? fail(error) : done(['/admin/promocoes'], active ? 'Promoção ativada.' : 'Promoção pausada.');
  } catch (e) {
    return fail(e);
  }
}

export async function deletePromotion(id) {
  try {
    const supabase = await admin();
    const { error } = await supabase.from('promotions').delete().eq('id', id);
    return error ? fail(error) : done(['/admin/promocoes'], 'Promoção apagada.');
  } catch (e) {
    return fail(e);
  }
}

// ---------------- Pacotes ----------------
export async function savePackage(_prev, fd) {
  try {
    const supabase = await admin();
    const row = {
      house_id: text(fd, 'house_id'),
      title: text(fd, 'title'),
      tag: text(fd, 'tag'),
      starts_on: text(fd, 'starts_on'),
      ends_on: text(fd, 'ends_on'),
      price: num(fd, 'price'),
      note: text(fd, 'note'),
      photo_url: text(fd, 'photo_url'),
      active: fd.get('active') === 'on',
    };
    if (!row.house_id || !row.title || !row.starts_on || !row.ends_on || !row.price) return { ok: false, message: 'Preencha casa, título, datas e valor.' };
    if (row.ends_on <= row.starts_on) return { ok: false, message: 'A saída precisa ser depois da entrada.' };
    const id = text(fd, 'id');
    const { error } = id ? await supabase.from('packages').update(row).eq('id', id) : await supabase.from('packages').insert(row);
    if (error) return fail(error);
    if (id) redirect('/admin/pacotes');
    return done(['/admin/pacotes', '/admin/agenda'], 'Pacote salvo.');
  } catch (e) {
    if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
    return fail(e);
  }
}

export async function deletePackage(id) {
  try {
    const supabase = await admin();
    const { error } = await supabase.from('packages').delete().eq('id', id);
    return error ? fail(error) : done(['/admin/pacotes'], 'Pacote apagado.');
  } catch (e) {
    return fail(e);
  }
}

// ---------------- Configurações ----------------
export async function saveSettings(_prev, fd) {
  try {
    const supabase = await admin();
    const json = (k) => {
      try {
        return JSON.parse(text(fd, k) || '[]');
      } catch {
        return [];
      }
    };
    const color = (k, fallback) => (/^#[0-9a-f]{6}$/i.test(text(fd, k)) ? text(fd, k) : fallback);
    const data = withDefaults({
      brand: { name: text(fd, 'brand.name'), tagline: text(fd, 'brand.tagline'), region: text(fd, 'brand.region') },
      hero: {
        eyebrow: text(fd, 'hero.eyebrow'),
        title: text(fd, 'hero.title'),
        text: text(fd, 'hero.text'),
        badge: text(fd, 'hero.badge'),
        photo: text(fd, 'hero.photo'),
        stats: json('hero.stats').filter((s) => s.value || s.label),
      },
      theme: { primary: color('theme.primary', '#0f4352'), accent: color('theme.accent', '#d9654c'), background: color('theme.background', '#f6f1e9') },
      contact: { whatsapp: text(fd, 'contact.whatsapp'), instagram: text(fd, 'contact.instagram'), airbnb: text(fd, 'contact.airbnb'), address: text(fd, 'contact.address') },
      booking: {
        depositPercent: Math.min(Math.max(num(fd, 'booking.depositPercent') ?? 30, 0), 100),
        holdHours: Math.min(Math.max(num(fd, 'booking.holdHours') ?? 24, 1), 168),
        platformFee: Math.min(Math.max(num(fd, 'booking.platformFee') ?? 0, 0), 50),
        checkInTime: text(fd, 'booking.checkInTime'),
        checkOutTime: text(fd, 'booking.checkOutTime'),
        pixKey: text(fd, 'booking.pixKey'),
        pixName: text(fd, 'booking.pixName'),
        pixCity: text(fd, 'booking.pixCity'),
        pixBank: text(fd, 'booking.pixBank'),
        terms: text(fd, 'booking.terms'),
      },
      perks: json('perks').filter((p) => p.title),
      testimonials: json('testimonials').filter((t) => t.quote),
      faq: json('faq').filter((f) => f.q && f.a),
      demo: fd.get('demo') === 'on',
    });
    if (!data.brand.name) return { ok: false, message: 'Informe o nome do negócio.' };
    const { error } = await supabase.from('settings').update({ data, updated_at: new Date().toISOString() }).eq('id', 1);
    return error ? fail(error) : done(['/admin/configuracoes'], 'Configurações salvas. O site já foi atualizado.');
  } catch (e) {
    return fail(e);
  }
}
