-- Petites · Ciclo de vida de una solicitud de adopción (pedido → entrega → seguimiento).
begin;
create extension if not exists pgtap with schema extensions;
select plan(12);

create temp table ctx as
select (select l.id from public.listings l join public.animals a on a.id = l.animal_id where a.name = 'Milo') as milo;
grant select on ctx to authenticated;

create or replace function pg_temp.act_as(p_user uuid) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
$$;

set local role authenticated;

-- Ana solicita con traslado a domicilio
select pg_temp.act_as('11111111-1111-1111-1111-111111111111');
select throws_ok(
  $$ select public.create_request((select milo from ctx), 'apartment', false, null, 'Tengo experiencia con gatos.',
     'Le daré un hogar seguro y tranquilo.', null, 'delivery', null, null, null, false) $$,
  'P0001', null, 'Sin aceptar el acuerdo no se puede enviar la solicitud');
create temp table req on commit drop as
select public.create_request((select milo from ctx), 'apartment', false, null, 'Tengo experiencia con gatos.',
  'Le daré un hogar seguro y tranquilo.', null, 'delivery', '2026-12-01', 'Sábado AM', 'Calle 1, Piantini', true) as id;
select is((select status from public.requests where id = (select id from req)), 'submitted'::public.request_status, 'La solicitud inicia como enviada');
select ok((select contract_snapshot is not null from public.requests where id = (select id from req)), 'Se guarda copia del acuerdo aceptado');

-- El refugio recibe la notificación y gestiona el recorrido
select pg_temp.act_as('22222222-2222-2222-2222-222222222222');
select ok((select count(*) from public.notifications where type = 'request_new') >= 1, 'El cuidador recibe aviso de nueva solicitud');
select throws_ok($$ select public.update_request_status((select id from req), 'in_transit') $$, '42501', null, 'No se puede saltar pasos del recorrido');
select lives_ok($$ select public.update_request_status((select id from req), 'approved') $$, 'Aprobar');
select ok((select conversation_id is not null from public.requests where id = (select id from req)), 'Al aprobar se activa el chat directo');
select lives_ok($$ select public.update_request_status((select id from req), 'preparing') $$, 'Preparando');
select lives_ok($$ select public.update_request_status((select id from req), 'in_transit') $$, 'En camino');
select lives_ok($$ select public.update_request_status((select id from req), 'delivered') $$, 'Entregado');
select is((select status from public.listings where id = (select milo from ctx)), 'adopted'::public.listing_status, 'Entregar marca la publicación como adoptada');

-- Ana tiene seguimiento a 7 y 30 días y la bitácora completa
select pg_temp.act_as('11111111-1111-1111-1111-111111111111');
select is((select count(*) from public.follow_ups where request_id = (select id from req)), 2::bigint, 'Se crean seguimientos a 7 y 30 días');

reset role;
select * from finish();
rollback;
