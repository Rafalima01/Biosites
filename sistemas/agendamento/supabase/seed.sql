-- Studio de demonstração (fictício): o mesmo da maquete do Modelo 09 · Delicado.
-- Rode depois do schema.sql se quiser dados de exemplo. Pode rodar de novo.
insert into public.studios (id, slug, name, timezone, whatsapp, settings)
values (
  'a0000000-0000-4000-8000-000000000001', 'studio-livia', 'Studio Lívia Beauty', 'America/Sao_Paulo', '',
  '{"step": 30, "minNotice": 120, "daysAhead": 30, "bufferMinutes": 0, "depositPercent": 30, "holdMinutes": 120,
    "pix": {"key": "+5500900000000", "keyLabel": "Celular", "keyDisplay": "(00) 90000-0000", "holder": "Studio Livia Beauty", "city": "Salvador"}}'
)
on conflict (id) do nothing;

insert into public.services (id, studio_id, category, name, description, minutes, price, sort) values
  ('b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'Unhas', 'Alongamento em gel', 'Aplicação com molde ou tip, cutilagem e esmaltação inclusas.', 120, 150, 1),
  ('b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'Unhas', 'Manutenção em gel', '', 90, 110, 2),
  ('b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'Unhas', 'Esmaltação em gel', '', 45, 55, 3),
  ('b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'Sobrancelhas', 'Design personalizado', 'Modelagem sob medida para valorizar o formato do rosto.', 40, 35, 4),
  ('b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000001', 'Sobrancelhas', 'Design com henna', '', 60, 45, 5),
  ('b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000001', 'Cílios', 'Extensão em tufos', '', 60, 80, 6),
  ('b0000000-0000-4000-8000-000000000007', 'a0000000-0000-4000-8000-000000000001', 'Cílios', 'Lash lifting', 'Curvatura e alongamento dos cílios naturais, sem extensão.', 60, 90, 7)
on conflict (id) do nothing;

-- Segunda a sábado, 09:00–12:00 e 13:00–19:00.
insert into public.hours (studio_id, weekday, starts, ends)
select 'a0000000-0000-4000-8000-000000000001', d, f.s, f.e
from generate_series(1, 6) d
cross join (values ('09:00'::time, '12:00'::time), ('13:00'::time, '19:00'::time)) as f (s, e)
where not exists (select 1 from public.hours where studio_id = 'a0000000-0000-4000-8000-000000000001');
