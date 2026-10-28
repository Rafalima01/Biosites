-- Dados de exemplo (marca fictícia Maré Mansa). Opcional: rode depois de schema.sql.
-- Para começar do zero com um cliente real, não rode este arquivo e cadastre tudo pelo painel.

update public.settings set data = $json$
{
  "brand": { "name": "Maré Mansa", "tagline": "Casas de temporada", "region": "Litoral Norte da Bahia" },
  "hero": {
    "eyebrow": "Imbassaí · Praia do Forte · Bahia",
    "title": "Seu refúgio **pé na areia**",
    "text": "Casas com piscina a poucos passos do mar. Escolha a casa, veja a agenda e reserve direto com a gente.",
    "badge": "Reserva direta · sem taxa de plataforma",
    "photo": "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=78",
    "stats": [ { "value": "3", "label": "casas" }, { "value": "4,9", "label": "avaliação média" }, { "value": "+600", "label": "hóspedes" } ]
  },
  "theme": { "primary": "#0f4352", "accent": "#d9654c", "background": "#f6f1e9" },
  "contact": { "whatsapp": "", "instagram": "", "airbnb": "", "address": "" },
  "booking": {
    "depositPercent": 30,
    "holdHours": 24,
    "platformFee": 14,
    "checkInTime": "14h",
    "checkOutTime": "11h",
    "pixKey": "",
    "pixName": "",
    "pixCity": "",
    "pixBank": "",
    "terms": "Sinal de 30% via Pix para garantir a reserva e saldo até o check-in. Cancelamento com até 30 dias de antecedência: devolução integral do sinal."
  },
  "perks": [
    { "icon": "tag", "title": "Sem taxa de plataforma", "text": "Você paga só a diária e a limpeza, sem taxa de serviço." },
    { "icon": "chat", "title": "Fala direto com o anfitrião", "text": "Resposta pelo WhatsApp em até 10 minutos." },
    { "icon": "gift", "title": "Kit boas-vindas", "text": "Água de coco, frutas da estação e cafés regionais na chegada." },
    { "icon": "shield", "title": "Reserva garantida", "text": "Datas bloqueadas na hora, sinal de 30% e saldo no check-in." }
  ],
  "testimonials": [
    { "quote": "Casa linda, impecável e com tudo que precisávamos. Reservar direto foi rápido e saiu mais barato.", "name": "Marina e Caio", "origin": "São Paulo · Casa Coqueiros" },
    { "quote": "O anfitrião respondeu na hora e deixou um kit de boas-vindas maravilhoso. Já marcamos a volta.", "name": "Família Andrade", "origin": "Belo Horizonte · Casa Areia" },
    { "quote": "O bangalô é um sonho. O ofurô à noite com o barulho do mar não tem preço.", "name": "Juliana R.", "origin": "Salvador · Bangalô Brisa" }
  ],
  "faq": [
    { "q": "Como funciona a reserva direta?", "a": "Escolha a casa e as datas, preencha seus dados e as datas ficam reservadas para você. Para confirmar, pague o sinal via Pix em até 24 horas." },
    { "q": "Qual é o horário de check-in e check-out?", "a": "Check-in a partir das 14h e check-out até as 11h. Late checkout sob consulta." },
    { "q": "As casas aceitam animais de estimação?", "a": "A Casa Areia é pet friendly. Nas demais, consulte antes de reservar." },
    { "q": "A casa fornece roupa de cama e banho?", "a": "Sim, todas as casas entregam roupa de cama e toalhas de banho." },
    { "q": "É permitido realizar festas ou eventos?", "a": "Não são permitidas festas com som alto ou pessoas além do número de hóspedes da reserva." }
  ],
  "demo": true
}
$json$::jsonb, updated_at = now()
where id = 1;

insert into public.houses (id, slug, name, location, tag, summary, description, guests, bedrooms, baths, price, weekend_price, cleaning_fee, min_nights, amenities, sort)
values
  ('11111111-1111-4111-8111-111111111111', 'casa-coqueiros', 'Casa Coqueiros', 'Imbassaí, Bahia', 'Mais reservada',
   'Casa térrea com piscina, deck e área gourmet, a 300 m da praia.',
   'Ideal para famílias grandes e grupos de amigos. Cinco suítes com ar-condicionado, sala integrada à área gourmet e um quintal gramado com piscina e espreguiçadeiras. A praia fica a cinco minutos de caminhada.',
   14, 5, 6, 1290, 1590, 280, 2, array['Piscina','Wi-Fi','Ar-condicionado','Churrasqueira','Estacionamento (4 carros)','Roupa de cama e banho'], 1),
  ('22222222-2222-4222-8222-222222222222', 'casa-areia', 'Casa Areia', 'Praia do Forte, Bahia', 'Novo',
   'Arquitetura moderna, piscina aquecida e varanda com rede.',
   'Casa nova, decorada em tons claros, com quatro suítes, cozinha completa e varanda com rede de frente para a piscina aquecida. A dez minutos de carro da vila de Praia do Forte.',
   10, 4, 5, 980, 1190, 220, 2, array['Piscina aquecida','Wi-Fi','Ar-condicionado','Cozinha completa','Pet friendly','Estacionamento (3 carros)'], 2),
  ('33333333-3333-4333-8333-333333333333', 'bangalo-brisa', 'Bangalô Brisa', 'Imbassaí, Bahia', 'Para casais',
   'Bangalô romântico com ofurô, cercado de mata e a 150 m do rio.',
   'Um refúgio para dois: suíte ampla com ofurô privativo, cozinha compacta e varanda cercada de mata, a poucos passos do encontro do rio com o mar.',
   3, 1, 1, 420, 520, 90, 2, array['Ofurô privativo','Wi-Fi','Ar-condicionado','Café da manhã opcional','Estacionamento'], 3)
on conflict (id) do nothing;

insert into public.house_photos (house_id, url, alt, sort)
select h, 'https://images.unsplash.com/' || p || '?auto=format&fit=crop&w=1200&h=900&q=78', a, s
from (values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'photo-1564013799919-ab600027ffc6', 'Piscina da Casa Coqueiros cercada de coqueiros', 1),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'photo-1600210492486-724fe5c67fb0', 'Sala de estar integrada e iluminada', 2),
  ('11111111-1111-4111-8111-111111111111'::uuid, 'photo-1616594039964-ae9021a400a0', 'Suíte com cama de casal', 3),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'photo-1580587771525-78b9dba3b914', 'Fachada moderna da Casa Areia com piscina', 1),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'photo-1600607687939-ce8a6c25118c', 'Sala com sofá claro e portas de vidro', 2),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'photo-1505693416388-ac5ce068fe85', 'Quarto com cama de casal estofada', 3),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'photo-1615880484746-a134be9a6ecf', 'Varanda de madeira com vista para a mata', 1),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'photo-1631049307264-da0ec9d70304', 'Suíte do bangalô com cama de casal', 2),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'photo-1506953823976-52e1fdc0149a', 'Coqueiro sobre a areia de frente para o mar', 3)
) v(h, p, a, s)
where not exists (select 1 from public.house_photos);

insert into public.packages (house_id, title, tag, starts_on, ends_on, price, note, photo_url, sort)
select * from (values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Virada pé na areia', 'Réveillon', date '2026-12-29', date '2027-01-02', 12900::numeric,
   'Inclui ceia para 14 pessoas e decoração da área da piscina.', 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?auto=format&fit=crop&w=1000&h=625&q=78', 1),
  ('22222222-2222-4222-8222-222222222222'::uuid, 'Carnaval longe da muvuca', 'Carnaval', date '2027-02-05', date '2027-02-10', 8900::numeric,
   'Cinco diárias com kit boas-vindas e late checkout.', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&h=625&q=78', 2),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Escapada a dois', 'Dia dos Namorados', date '2027-06-11', date '2027-06-13', 1490::numeric,
   'Duas noites com café da manhã, espumante e ofurô decorado.', 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1000&h=625&q=78', 3)
) v
where not exists (select 1 from public.packages);

insert into public.promotions (house_id, label, starts_on, ends_on, percent_off, nightly_price)
select * from (values
  ('11111111-1111-4111-8111-111111111111'::uuid, 'Alta temporada', date '2027-01-03', date '2027-01-31', null::numeric, 1490::numeric),
  ('33333333-3333-4333-8333-333333333333'::uuid, 'Promoção meio de semana', current_date + 5, current_date + 12, 20::numeric, null::numeric)
) v
where not exists (select 1 from public.promotions);
