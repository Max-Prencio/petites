-- Petites · Pruebas de autorización (RLS + RPC). Ejecutar con: supabase test db
-- Usa los usuarios del seed: Ana (particular), Refugio Huellitas y Equipo Petites (admin).
begin;
create extension if not exists pgtap with schema extensions;

select plan(33);

-- Contexto de prueba (como postgres)
create temp table ctx as
select
  '11111111-1111-1111-1111-111111111111'::uuid as ana,
  '22222222-2222-2222-2222-222222222222'::uuid as refugio,
  '33333333-3333-3333-3333-333333333333'::uuid as admin,
  (select l.id from public.listings l join public.animals a on a.id = l.animal_id where a.name = 'Canela') as canela,
  (select l.id from public.listings l join public.animals a on a.id = l.animal_id where a.name = 'Luna') as luna,
  (select id from public.animals where name = 'Luna') as luna_animal;
grant select on ctx to authenticated, anon;

-- Documento veterinario privado del refugio
insert into storage.objects (bucket_id, name, owner)
values ('vet-docs', '22222222-2222-2222-2222-222222222222/x/carnet.pdf', '22222222-2222-2222-2222-222222222222');

create or replace function pg_temp.act_as(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
$$;

-- ───────────── Visitante (anon) ─────────────
set local role anon;
select ok((select count(*) from public.listing_cards) >= 3, 'Visitante ve el catálogo público');
select is((select count(*) from public.profile_private), 0::bigint, 'Visitante no ve datos privados de perfiles');
select throws_ok($$ select public.start_conversation((select canela from ctx)) $$, '42501', null, 'Visitante no puede iniciar conversaciones');
reset role;

-- ───────────── Ana (usuaria autenticada) ─────────────
select pg_temp.act_as('11111111-1111-1111-1111-111111111111');
set local role authenticated;

-- 1. No edita ni borra anuncios ajenos
with u as (update public.listings set city = 'Hackeado' where id = (select canela from ctx) returning 1)
select is(count(*), 0::bigint, '1. Usuario A no puede editar el anuncio de B') from u;
with d as (delete from public.listings where id = (select canela from ctx) returning 1)
select is(count(*), 0::bigint, '1b. Usuario A no puede borrar el anuncio de B') from d;

-- 8. No cambia el estado de un anuncio ajeno
with u as (update public.listings set status = 'adopted' where id = (select canela from ctx) returning 1)
select is(count(*), 0::bigint, '8. Usuario no puede cambiar el estado de un anuncio ajeno') from u;

-- Sí gestiona el suyo
with u as (update public.listings set status = 'paused' where id = (select luna from ctx) returning 1)
select is(count(*), 1::bigint, 'El dueño puede pausar su propio anuncio') from u;
update public.listings set status = 'available' where id = (select luna from ctx);

-- No puede tocar columnas de moderación
select throws_ok(
  $$ update public.listings set moderation_status = 'visible' where id = (select luna from ctx) $$,
  '42501', null, 'El dueño no puede modificar campos de moderación');

-- 4. No puede asignarse admin
select throws_ok(
  $$ insert into public.user_roles (user_id, role) values ('11111111-1111-1111-1111-111111111111', 'admin') $$,
  '42501', null, '4. Usuario no puede asignarse el rol admin');
select throws_ok(
  $$ update public.profiles set suspended_at = null where id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null, 'Usuario no puede alterar su estado de suspensión');

-- 7. Reglas de precio por modalidad
select throws_ok(
  $$ insert into public.listings (owner_id, animal_id, listing_type, price, currency, province_id, city)
     values ('11111111-1111-1111-1111-111111111111', (select luna_animal from ctx), 'adoption', 500, 'DOP', 1, 'Piantini') $$,
  '23514', null, '7. Adopción no admite precio');
select throws_ok(
  $$ insert into public.listings (owner_id, animal_id, listing_type, price, currency, province_id, city)
     values ('11111111-1111-1111-1111-111111111111', (select luna_animal from ctx), 'sale', null, 'DOP', 1, 'Piantini') $$,
  '23514', null, '7b. Venta exige precio positivo');

-- 6. Favoritos de otro usuario
select throws_ok(
  $$ insert into public.favorites (user_id, listing_id) values ('22222222-2222-2222-2222-222222222222', (select canela from ctx)) $$,
  '42501', null, '6. Usuario no puede crear favoritos de otro usuario');
insert into public.favorites (listing_id) values ((select canela from ctx));
select is((select count(*) from public.favorites), 1::bigint, 'Usuario gestiona sus propios favoritos');

-- 5. Documentos veterinarios privados ajenos
select is(
  (select count(*) from storage.objects where bucket_id = 'vet-docs'),
  0::bigint, '5. Usuario no puede leer documentos veterinarios privados ajenos');

-- Conversación y mensajes
create temp table conv on commit drop as select public.start_conversation((select canela from ctx)) as id;
select is(
  public.start_conversation((select canela from ctx)), (select id from conv),
  'Contactar recupera la misma conversación del anuncio');
select throws_ok(
  $$ select public.start_conversation((select luna from ctx)) $$,
  'P0001', null, 'No se puede abrir conversación con la propia publicación');

-- 3. sender_id siempre es auth.uid()
insert into public.messages (conversation_id, sender_id, content)
values ((select id from conv), '22222222-2222-2222-2222-222222222222', 'Hola, ¿Canela está disponible?');
select is(
  (select sender_id from public.messages where conversation_id = (select id from conv) limit 1),
  '11111111-1111-1111-1111-111111111111'::uuid,
  '3. No se puede enviar un mensaje con el sender_id de otra persona');

-- Solicitud de adopción
create temp table req on commit drop as
select public.create_request((select canela from ctx), 'apartment', false, null, 'Crecí con perros toda mi vida.',
  'Quiero darle un hogar tranquilo y lleno de amor.', null, 'pickup', null, null, null, true) as id;
select throws_ok(
  $$ select public.update_request_status((select id from req), 'approved') $$,
  '42501', null, 'El solicitante no puede aprobar su propia solicitud');
select throws_ok(
  $$ select public.create_request((select canela from ctx), 'apartment', false, null, 'Crecí con perros toda mi vida.',
     'Quiero darle un hogar tranquilo.', null, 'pickup', null, null, null, true) $$,
  '23505', null, 'No se duplica una solicitud activa para el mismo anuncio');

-- Admin: RPC protegidos
select throws_ok(
  $$ select public.admin_set_listing_moderation((select canela from ctx), 'hidden', 'prueba') $$,
  '42501', null, 'Usuario sin rol admin no puede moderar');

-- ───────────── Equipo Petites (admin, no participante del chat) ─────────────
select pg_temp.act_as('33333333-3333-3333-3333-333333333333');

-- 2. No participante no lee ni escribe en la conversación
select is(
  (select count(*) from public.messages where conversation_id = (select id from conv)),
  0::bigint, '2. Un no participante no puede leer los mensajes');
select throws_ok(
  $$ insert into public.messages (conversation_id, content) values ((select id from conv), 'intruso') $$,
  '42501', null, '2b. Un no participante no puede enviar mensajes');

select lives_ok(
  $$ select public.admin_set_listing_moderation((select luna from ctx), 'hidden', 'Prueba de moderación') $$,
  'Admin puede ocultar una publicación');
select ok(
  (select count(*) from public.admin_audit_log where action = 'listing_moderation') >= 1,
  'La moderación queda registrada en auditoría');

-- ───────────── Refugio (dueño de Canela) ─────────────
select pg_temp.act_as('22222222-2222-2222-2222-222222222222');
select lives_ok($$ select public.update_request_status((select id from req), 'approved') $$, 'El dueño aprueba la solicitud');
select is(
  (select status from public.listings where id = (select canela from ctx)),
  'reserved'::public.listing_status, 'Aprobar reserva la publicación');
select is(
  (select count(*) from storage.objects where bucket_id = 'vet-docs'),
  1::bigint, 'El dueño sí lee sus documentos veterinarios');

-- Fotos: el dueño inserta y reordena, pero no puede reescribir la ruta (regresión del upsert)
select lives_ok($$
  insert into public.animal_images (animal_id, storage_path, sort_order)
  values ((select animal_id from public.listings where id = (select canela from ctx)),
          '22222222-2222-2222-2222-222222222222/test/nueva.jpg', 1) $$,
  'El dueño agrega fotos a su animal');
select lives_ok($$
  update public.animal_images set sort_order = 2
  where storage_path = '22222222-2222-2222-2222-222222222222/test/nueva.jpg' $$,
  'El dueño reordena sus fotos');
select throws_ok($$
  update public.animal_images set storage_path = 'otra/ruta.jpg'
  where storage_path = '22222222-2222-2222-2222-222222222222/test/nueva.jpg' $$,
  '42501', null, 'Nadie reescribe la ruta de una foto');

-- Ana ya no ve la publicación moderada; su dueña sí
select pg_temp.act_as('11111111-1111-1111-1111-111111111111');
select is((select count(*) from public.listings where id = (select luna from ctx)), 1::bigint, 'La dueña ve su publicación oculta');
select pg_temp.act_as('22222222-2222-2222-2222-222222222222');
select is((select count(*) from public.listings where id = (select luna from ctx)), 0::bigint, 'Otros no ven publicaciones ocultas por moderación');

reset role;
select * from finish();
rollback;
