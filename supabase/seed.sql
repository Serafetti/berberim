-- Fictional local/demo-only organization and sample records. No real customer data.
begin;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'authenticated', 'authenticated', 'demo-owner@example.invalid', '', now(),
  '{"provider":"email","providers":["email"]}'::jsonb, '{"full_name":"Demo İşletme Sahibi"}'::jsonb, now(), now()
) on conflict (id) do nothing;

insert into public.organizations (id, owner_user_id, name, slug, business_type, custom_business_type, city, timezone, trial_started_at, trial_ends_at)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Örnek Salon', 'ornek-salon-demo', 'unisex_salon', null, 'İstanbul', 'Europe/Istanbul', now(), now() + interval '14 days')
on conflict (id) do nothing;

insert into public.organization_members (organization_id, user_id, role)
values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'owner')
on conflict (organization_id, user_id) do nothing;

insert into public.services (id, organization_id, name, description, duration_minutes, price)
values
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Saç Kesimi', 'Kişiye özel kesim ve şekillendirme.', 45, 500),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Fön', 'Yıkama sonrası fön ve şekillendirme.', 30, 350),
  ('cccccccc-cccc-4ccc-8ccc-ccccccccccc3', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Cilt Bakımı', 'Temel cilt bakım uygulaması.', 60, 900)
on conflict (id) do nothing;

insert into public.staff (id, organization_id, name, phone, role)
values
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Deniz Örnek', '+900000000001', 'Saç Uzmanı'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd2', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Ekin Örnek', '+900000000002', 'Güzellik Uzmanı')
on conflict (id) do nothing;

insert into public.staff_services (staff_id, service_id)
values
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd1', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc2'),
  ('dddddddd-dddd-4ddd-8ddd-ddddddddddd2', 'cccccccc-cccc-4ccc-8ccc-ccccccccccc3')
on conflict do nothing;

insert into public.working_hours (organization_id, staff_id, day_of_week, start_time, end_time, active)
select 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', null, d, '09:00', '18:00', true
from generate_series(1, 6) as d
on conflict do nothing;

insert into public.working_hours (organization_id, staff_id, day_of_week, start_time, end_time, active)
select 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', s.id, d, '09:00', '18:00', true
from public.staff s cross join generate_series(1, 6) as d
where s.organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
on conflict do nothing;

insert into public.breaks (organization_id, staff_id, day_of_week, start_time, end_time)
select 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', s.id, d, '13:00', '14:00'
from public.staff s cross join generate_series(1, 6) as d
where s.organization_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  and not exists (select 1 from public.breaks b where b.organization_id = s.organization_id and b.staff_id = s.id and b.day_of_week = d and b.start_time = '13:00' and b.end_time = '14:00');

commit;
