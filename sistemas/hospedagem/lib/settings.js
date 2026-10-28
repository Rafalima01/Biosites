// Configurações do site com valores padrão (o anfitrião edita em /admin/configuracoes).
export const DEFAULT_SETTINGS = {
  brand: { name: 'Minhas Casas', tagline: 'Casas de temporada', region: '' },
  hero: { eyebrow: '', title: 'Sua casa de temporada **com reserva direta**', text: '', badge: 'Reserva direta · sem taxa de plataforma', photo: '', stats: [] },
  theme: { primary: '#0f4352', accent: '#d9654c', background: '#f6f1e9' },
  contact: { whatsapp: '', instagram: '', airbnb: '', address: '' },
  booking: { depositPercent: 30, holdHours: 24, platformFee: 14, checkInTime: '14h', checkOutTime: '11h', pixKey: '', pixName: '', pixCity: '', pixBank: '', terms: '' },
  perks: [],
  testimonials: [],
  faq: [],
  demo: false,
};

export function withDefaults(data = {}) {
  const out = { ...DEFAULT_SETTINGS, ...data };
  for (const key of ['brand', 'hero', 'theme', 'contact', 'booking']) out[key] = { ...DEFAULT_SETTINGS[key], ...(data[key] || {}) };
  return out;
}

export async function loadSettings(supabase) {
  const { data } = await supabase.from('settings').select('data').eq('id', 1).maybeSingle();
  return withDefaults(data?.data || {});
}
