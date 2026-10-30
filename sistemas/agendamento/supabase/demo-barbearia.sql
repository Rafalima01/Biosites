-- =============================================================================
-- STUDIO DE DEMONSTRAÇÃO DA BARBEARIA (maquete do Modelo 11 · Marcos Ferraz, fictício)
-- Cole TUDO no Supabase → SQL Editor → Run. Pode rodar de novo (não duplica nada).
-- Os nomes dos serviços são os mesmos do site (modelos/11-barbearia-agenda): é pelo nome que se ligam.
-- =============================================================================

insert into public.studios (id, slug, name, timezone, whatsapp, settings)
values (
  'a0000000-0000-4000-8000-000000000011', 'ferraz-barber', 'Ferraz Barber Club', 'America/Sao_Paulo', '',
  '{"step": 30, "minNotice": 60, "daysAhead": 30, "bufferMinutes": 0, "depositPercent": 30, "holdMinutes": 120,
    "pix": {"key": "+5500900000000", "keyLabel": "Celular", "keyDisplay": "(00) 90000-0000", "holder": "Ferraz Barber Club", "city": "Rio de Janeiro"}}'
)
on conflict (id) do nothing;

insert into public.services (id, studio_id, category, name, description, minutes, price, sort) values
  ('b0000000-0000-4000-8000-000000000101', 'a0000000-0000-4000-8000-000000000011', 'Cabelo', 'Corte masculino', 'Tesoura e máquina, lavagem e finalização.', 40, 45, 1),
  ('b0000000-0000-4000-8000-000000000102', 'a0000000-0000-4000-8000-000000000011', 'Cabelo', 'Degradê', 'Low, mid ou high fade, com navalha no acabamento.', 45, 50, 2),
  ('b0000000-0000-4000-8000-000000000103', 'a0000000-0000-4000-8000-000000000011', 'Cabelo', 'Corte infantil', 'Até 10 anos.', 30, 35, 3),
  ('b0000000-0000-4000-8000-000000000104', 'a0000000-0000-4000-8000-000000000011', 'Cabelo', 'Pezinho', 'Contorno e acabamento entre um corte e outro.', 15, 15, 4),
  ('b0000000-0000-4000-8000-000000000105', 'a0000000-0000-4000-8000-000000000011', 'Barba', 'Barba completa', 'Toalha quente, navalha e balm.', 30, 35, 5),
  ('b0000000-0000-4000-8000-000000000106', 'a0000000-0000-4000-8000-000000000011', 'Barba', 'Barboterapia', 'Esfoliação, toalha quente, navalha e hidratação.', 45, 50, 6),
  ('b0000000-0000-4000-8000-000000000107', 'a0000000-0000-4000-8000-000000000011', 'Barba', 'Sobrancelha na navalha', '', 10, 15, 7),
  ('b0000000-0000-4000-8000-000000000108', 'a0000000-0000-4000-8000-000000000011', 'Combos', 'Corte + barba', 'O clássico da casa, com toalha quente.', 70, 75, 8),
  ('b0000000-0000-4000-8000-000000000109', 'a0000000-0000-4000-8000-000000000011', 'Combos', 'Degradê + barba', '', 75, 80, 9),
  ('b0000000-0000-4000-8000-000000000110', 'a0000000-0000-4000-8000-000000000011', 'Combos', 'Corte + barba + sobrancelha', '', 80, 85, 10),
  ('b0000000-0000-4000-8000-000000000111', 'a0000000-0000-4000-8000-000000000011', 'Química e tratamento', 'Pigmentação de barba', 'Preenche falhas e uniformiza a cor.', 30, 30, 11),
  ('b0000000-0000-4000-8000-000000000112', 'a0000000-0000-4000-8000-000000000011', 'Química e tratamento', 'Pigmentação de cabelo', '', 30, 35, 12),
  ('b0000000-0000-4000-8000-000000000113', 'a0000000-0000-4000-8000-000000000011', 'Química e tratamento', 'Hidratação', '', 20, 25, 13),
  ('b0000000-0000-4000-8000-000000000114', 'a0000000-0000-4000-8000-000000000011', 'Química e tratamento', 'Platinado', 'Valor final depende do comprimento do cabelo.', 120, 150, 14)
on conflict (id) do nothing;

-- Terça a sexta 09:00–12:00 e 13:00–20:00; sábado 08:00–12:00 e 13:00–18:00 (weekday 0 = domingo).
insert into public.hours (studio_id, weekday, starts, ends)
select 'a0000000-0000-4000-8000-000000000011', f.d, f.s, f.e
from (values
  (2, '09:00'::time, '12:00'::time), (2, '13:00', '20:00'),
  (3, '09:00', '12:00'), (3, '13:00', '20:00'),
  (4, '09:00', '12:00'), (4, '13:00', '20:00'),
  (5, '09:00', '12:00'), (5, '13:00', '20:00'),
  (6, '08:00', '12:00'), (6, '13:00', '18:00')
) as f (d, s, e)
where not exists (select 1 from public.hours where studio_id = 'a0000000-0000-4000-8000-000000000011');

-- Link do site da maquete (botão "Meu site" do painel).
update public.studios set site_url = 'https://biosite-11-barbearia-agenda.vercel.app' where slug = 'ferraz-barber';

-- Conferência: devem aparecer 14 serviços e 10 faixas de horário.
select s.name, s.site_url,
  (select count(*) from public.services v where v.studio_id = s.id) as servicos,
  (select count(*) from public.hours h where h.studio_id = s.id) as horarios
from public.studios s
where s.slug = 'ferraz-barber';
