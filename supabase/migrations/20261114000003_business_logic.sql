-- Petites · Reglas de negocio: triggers, RPCs, notificaciones, rate limiting y auditoría.

-- ─────────────────────────────────────────────────────────────
-- Privilegios por columna: el cliente no puede tocar campos de moderación/propiedad
-- ─────────────────────────────────────────────────────────────
revoke update on public.profiles from anon, authenticated;
grant update (full_name, avatar_path, bio, partner_type, province_id, city, onboarded_at)
  on public.profiles to authenticated;

revoke update on public.listings from anon, authenticated;
grant update (
  listing_type, price, currency, status, province_id, city, conditions, contract_terms,
  transfer_fee, allows_delivery, allows_pickup, delivery_window
) on public.listings to authenticated;

revoke update on public.animals from anon, authenticated;
grant update (
  category_id, breed_id, name, age_value, age_unit, sex, size, vaccinated, vaccination_complete,
  dewormed, sterilized, has_vet_documents, medical_notes, description, personality_tags, good_for_apartment
) on public.animals to authenticated;

revoke update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

revoke update on public.animal_images from anon, authenticated;
grant update (sort_order) on public.animal_images to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Alta de usuario: perfil + datos privados + roles base (comprador y adoptante)
-- ─────────────────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1))
  );
  insert into public.profile_private (user_id, phone)
  values (new.id, nullif(btrim(new.raw_user_meta_data ->> 'phone'), ''));
  insert into public.user_roles (user_id, role)
  values (new.id, 'buyer'), (new.id, 'adopter');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- Publicaciones: rol acumulable, published_at y límite anti-spam
-- ─────────────────────────────────────────────────────────────
create or replace function public.listings_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if (
      select count(*) from public.listings
      where owner_id = new.owner_id and created_at > now() - interval '1 day'
    ) >= 10 then
      raise exception 'Límite diario de publicaciones alcanzado' using errcode = 'P0001';
    end if;
    new.moderation_status := 'visible';
    new.moderation_reason := null;
  end if;

  if new.status = 'available' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger listings_before_write
  before insert or update on public.listings
  for each row execute function public.listings_before_write();

create or replace function public.grant_publisher_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.owner_id, case when new.listing_type = 'sale' then 'seller'::public.app_role
                             else 'adoption_publisher'::public.app_role end)
  on conflict do nothing;
  return new;
end;
$$;

create trigger listings_grant_role
  after insert or update of listing_type on public.listings
  for each row execute function public.grant_publisher_role();

-- ─────────────────────────────────────────────────────────────
-- Vista del catálogo (respeta RLS de las tablas base)
-- ─────────────────────────────────────────────────────────────
create or replace view public.listing_cards
with (security_invoker = true)
as
select
  l.id,
  l.owner_id,
  l.animal_id,
  l.listing_type,
  l.price,
  l.currency,
  l.status,
  l.moderation_status,
  l.province_id,
  pr.name as province_name,
  l.city,
  l.transfer_fee,
  l.published_at,
  l.created_at,
  a.name as animal_name,
  a.category_id,
  c.name as category_name,
  c.slug as category_slug,
  a.breed_id,
  b.name as breed_name,
  a.age_value,
  a.age_unit,
  a.age_months,
  a.sex,
  a.size,
  a.vaccinated,
  a.dewormed,
  a.good_for_apartment,
  a.personality_tags,
  a.description,
  p.full_name as owner_name,
  p.partner_type as owner_partner_type,
  (
    select ai.storage_path from public.animal_images ai
    where ai.animal_id = a.id
    order by ai.sort_order, ai.created_at
    limit 1
  ) as cover_path
from public.listings l
join public.animals a on a.id = l.animal_id
join public.categories c on c.id = a.category_id
left join public.breeds b on b.id = a.breed_id
join public.profiles p on p.id = l.owner_id
join public.provinces pr on pr.id = l.province_id;

-- ─────────────────────────────────────────────────────────────
-- Notificaciones (helper interno, no expuesto a clientes)
-- ─────────────────────────────────────────────────────────────
create or replace function public.notify(
  p_user uuid, p_type text, p_title text, p_body text, p_data jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.notifications (user_id, type, title, body, data)
  values (p_user, p_type, p_title, p_body, p_data);
$$;

revoke execute on function public.notify(uuid, text, text, text, jsonb) from public, anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Conversaciones: iniciar o recuperar la conversación de un anuncio
-- ─────────────────────────────────────────────────────────────
create or replace function public.start_conversation(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_owner uuid;
  v_conversation uuid;
begin
  if v_me is null then
    raise exception 'Necesitas iniciar sesión' using errcode = '42501';
  end if;
  if public.is_suspended(v_me) then
    raise exception 'Tu cuenta está suspendida' using errcode = '42501';
  end if;

  select owner_id into v_owner from public.listings where id = p_listing_id;
  if v_owner is null or not public.is_listing_public(p_listing_id) then
    raise exception 'Publicación no disponible' using errcode = 'P0002';
  end if;
  if v_owner = v_me then
    raise exception 'No puedes iniciar una conversación con tu propia publicación' using errcode = 'P0001';
  end if;
  if public.is_blocked_between(v_me, v_owner) then
    raise exception 'No es posible contactar a este usuario' using errcode = '42501';
  end if;

  select id into v_conversation
  from public.conversations
  where listing_id = p_listing_id and started_by = v_me;

  if v_conversation is null then
    insert into public.conversations (listing_id, started_by)
    values (p_listing_id, v_me)
    returning id into v_conversation;

    insert into public.conversation_participants (conversation_id, user_id)
    values (v_conversation, v_me), (v_conversation, v_owner);
  end if;

  return v_conversation;
end;
$$;

create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_conversation_participant(p_conversation_id) then
    raise exception 'Sin acceso a esta conversación' using errcode = '42501';
  end if;
  update public.conversation_participants
    set last_read_at = now()
    where conversation_id = p_conversation_id and user_id = auth.uid();
  update public.messages
    set read_at = now()
    where conversation_id = p_conversation_id and sender_id <> auth.uid() and read_at is null;
end;
$$;

-- Conteo de no leídos por conversación para la bandeja de mensajes.
create or replace function public.my_conversations()
returns table (
  id uuid,
  listing_id uuid,
  status public.conversation_status,
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz,
  other_user_id uuid,
  other_user_name text,
  other_user_avatar text,
  animal_name text,
  listing_type public.listing_type,
  cover_path text,
  unread_count bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    c.id, c.listing_id, c.status, c.last_message_at, c.last_message_preview, c.created_at,
    op.user_id, p.full_name, p.avatar_path,
    a.name, l.listing_type,
    (select ai.storage_path from public.animal_images ai
      where ai.animal_id = a.id order by ai.sort_order limit 1),
    (select count(*) from public.messages m
      where m.conversation_id = c.id and m.sender_id <> auth.uid()
        and (me.last_read_at is null or m.created_at > me.last_read_at))
  from public.conversation_participants me
  join public.conversations c on c.id = me.conversation_id
  join public.conversation_participants op on op.conversation_id = c.id and op.user_id <> me.user_id
  join public.profiles p on p.id = op.user_id
  join public.listings l on l.id = c.listing_id
  join public.animals a on a.id = l.animal_id
  where me.user_id = auth.uid()
  order by coalesce(c.last_message_at, c.created_at) desc;
$$;

-- Mensajes: anti-spam, última actividad y notificación al otro participante
create or replace function public.messages_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.sender_id := auth.uid();
  new.content := btrim(new.content);
  if (
    select count(*) from public.messages
    where sender_id = new.sender_id and created_at > now() - interval '1 minute'
  ) >= 20 then
    raise exception 'Estás enviando mensajes muy rápido. Espera un momento.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger messages_before_insert
  before insert on public.messages
  for each row execute function public.messages_before_insert();

create or replace function public.messages_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sender_name text;
  v_recipient uuid;
begin
  update public.conversations
    set last_message_at = new.created_at, last_message_preview = left(new.content, 120)
    where id = new.conversation_id;

  select full_name into v_sender_name from public.profiles where id = new.sender_id;

  for v_recipient in
    select user_id from public.conversation_participants
    where conversation_id = new.conversation_id and user_id <> new.sender_id
  loop
    perform public.notify(
      v_recipient, 'message', coalesce(v_sender_name, 'Nuevo mensaje'), left(new.content, 140),
      jsonb_build_object('conversation_id', new.conversation_id)
    );
  end loop;
  return new;
end;
$$;

create trigger messages_after_insert
  after insert on public.messages
  for each row execute function public.messages_after_insert();

-- ─────────────────────────────────────────────────────────────
-- Solicitudes: crear, transicionar estados y seguimiento
-- ─────────────────────────────────────────────────────────────
create or replace function public.create_request(
  p_listing_id uuid,
  p_housing_type public.housing_type,
  p_has_yard boolean,
  p_other_pets text,
  p_experience text,
  p_commitment text,
  p_household text,
  p_delivery_method public.delivery_method,
  p_preferred_date date,
  p_preferred_window text,
  p_delivery_address text,
  p_contract_accepted boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_listing public.listings%rowtype;
  v_request uuid;
begin
  if v_me is null then
    raise exception 'Necesitas iniciar sesión' using errcode = '42501';
  end if;
  if public.is_suspended(v_me) then
    raise exception 'Tu cuenta está suspendida' using errcode = '42501';
  end if;
  if not coalesce(p_contract_accepted, false) then
    raise exception 'Debes aceptar el acuerdo de tenencia responsable' using errcode = 'P0001';
  end if;

  select * into v_listing from public.listings where id = p_listing_id;
  if v_listing.id is null or not public.is_listing_public(p_listing_id) or v_listing.status <> 'available' then
    raise exception 'Esta publicación no está disponible' using errcode = 'P0002';
  end if;
  if v_listing.owner_id = v_me then
    raise exception 'No puedes solicitar tu propia publicación' using errcode = 'P0001';
  end if;
  if public.is_blocked_between(v_me, v_listing.owner_id) then
    raise exception 'No es posible contactar a este usuario' using errcode = '42501';
  end if;
  if p_delivery_method = 'delivery' and not v_listing.allows_delivery then
    raise exception 'Esta publicación no ofrece entrega a domicilio' using errcode = 'P0001';
  end if;
  if p_delivery_method = 'pickup' and not v_listing.allows_pickup then
    raise exception 'Esta publicación no ofrece recogida con cita' using errcode = 'P0001';
  end if;
  if (
    select count(*) from public.requests
    where requester_id = v_me and created_at > now() - interval '1 day'
  ) >= 5 then
    raise exception 'Límite diario de solicitudes alcanzado' using errcode = 'P0001';
  end if;

  insert into public.requests (
    listing_id, requester_id, owner_id, housing_type, has_yard, other_pets, experience, commitment,
    household, delivery_method, preferred_date, preferred_window, delivery_address,
    contract_snapshot, contract_accepted_at, transfer_fee, price_snapshot, currency_snapshot
  ) values (
    p_listing_id, v_me, v_listing.owner_id, p_housing_type, coalesce(p_has_yard, false),
    nullif(btrim(p_other_pets), ''), btrim(p_experience), btrim(p_commitment),
    nullif(btrim(p_household), ''), p_delivery_method, p_preferred_date,
    nullif(btrim(p_preferred_window), ''),
    case when p_delivery_method = 'delivery' then nullif(btrim(p_delivery_address), '') end,
    v_listing.contract_terms, now(), v_listing.transfer_fee, v_listing.price, v_listing.currency
  )
  returning id into v_request;

  return v_request;
end;
$$;

create or replace function public.update_request_status(
  p_request_id uuid,
  p_status public.request_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := auth.uid();
  v_req public.requests%rowtype;
  v_listing public.listings%rowtype;
  v_allowed boolean := false;
  v_conversation uuid;
begin
  select * into v_req from public.requests where id = p_request_id for update;
  if v_req.id is null then
    raise exception 'Solicitud no encontrada' using errcode = 'P0002';
  end if;
  select * into v_listing from public.listings where id = v_req.listing_id for update;

  if v_me = v_req.owner_id then
    v_allowed := case v_req.status
      when 'submitted' then p_status in ('in_review', 'videocall_requested', 'approved', 'rejected')
      when 'in_review' then p_status in ('videocall_requested', 'approved', 'rejected')
      when 'videocall_requested' then p_status in ('in_review', 'approved', 'rejected')
      when 'approved' then p_status in ('preparing', 'rejected')
      when 'preparing' then p_status = 'in_transit' and v_req.delivery_method = 'delivery'
                         or p_status = 'delivered' and v_req.delivery_method = 'pickup'
      when 'in_transit' then p_status in ('nearby', 'delivered')
      when 'nearby' then p_status = 'delivered'
      else false
    end;
  elsif v_me = v_req.requester_id then
    v_allowed := p_status = 'cancelled'
      and v_req.status in ('submitted', 'in_review', 'videocall_requested', 'approved', 'preparing');
  end if;

  if not v_allowed then
    raise exception 'Cambio de estado no permitido' using errcode = '42501';
  end if;

  if p_status = 'approved' then
    if v_listing.status <> 'available' then
      raise exception 'La publicación ya no está disponible' using errcode = 'P0001';
    end if;
    update public.listings set status = 'reserved' where id = v_listing.id;

    -- El chat directo se activa al aprobar (si no existía ya).
    select id into v_conversation from public.conversations
      where listing_id = v_req.listing_id and started_by = v_req.requester_id;
    if v_conversation is null then
      insert into public.conversations (listing_id, started_by)
        values (v_req.listing_id, v_req.requester_id) returning id into v_conversation;
      insert into public.conversation_participants (conversation_id, user_id)
        values (v_conversation, v_req.requester_id), (v_conversation, v_req.owner_id);
    end if;
    update public.requests set conversation_id = v_conversation where id = v_req.id;
  end if;

  if p_status = 'delivered' then
    update public.listings
      set status = case when v_listing.listing_type = 'sale' then 'sold'::public.listing_status
                        else 'adopted'::public.listing_status end
      where id = v_listing.id;
    -- Las demás solicitudes abiertas de este anuncio se cierran.
    update public.requests
      set status = 'rejected', owner_note = 'La mascota ya encontró hogar'
      where listing_id = v_listing.id and id <> v_req.id
        and status not in ('rejected', 'cancelled', 'delivered');
    insert into public.follow_ups (request_id, user_id, kind, due_at)
    values (v_req.id, v_req.requester_id, 'day_7', now() + interval '7 days'),
           (v_req.id, v_req.requester_id, 'day_30', now() + interval '30 days');
  end if;

  -- Si se cae una solicitud ya aprobada, el anuncio vuelve a estar disponible.
  if p_status in ('rejected', 'cancelled')
     and v_req.status in ('approved', 'preparing')
     and v_listing.status = 'reserved' then
    update public.listings set status = 'available' where id = v_listing.id;
  end if;

  update public.requests
    set status = p_status,
        owner_note = case when v_me = v_req.owner_id and p_note is not null then left(p_note, 500) else owner_note end
    where id = v_req.id;
end;
$$;

-- Bitácora de estados + notificaciones con el copy de marca
create or replace function public.requests_after_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_animal text;
  v_title text;
  v_body text;
begin
  if tg_op = 'UPDATE' and new.status = old.status then
    return new;
  end if;

  insert into public.request_events (request_id, status, actor_id, note)
  values (new.id, new.status, auth.uid(), case when tg_op = 'UPDATE' then new.owner_note end);

  select coalesce(a.name, 'tu nueva mascota') into v_animal
  from public.listings l join public.animals a on a.id = l.animal_id
  where l.id = new.listing_id;

  if tg_op = 'INSERT' then
    perform public.notify(
      new.owner_id, 'request_new', 'Nueva solicitud para ' || v_animal,
      'Alguien quiere darle un hogar. Revisa su ficha.', jsonb_build_object('request_id', new.id)
    );
    return new;
  end if;

  v_title := case new.status
    when 'in_review' then 'Solicitud en revisión'
    when 'videocall_requested' then 'Te proponen una videollamada'
    when 'approved' then '¡Luz verde!'
    when 'preparing' then 'Preparando su salida'
    when 'in_transit' then '¡En movimiento!'
    when 'nearby' then '¡Asómate!'
    when 'delivered' then '¡Llegó a casa!'
    when 'rejected' then 'Solicitud no aprobada'
    when 'cancelled' then 'Solicitud cancelada'
    else 'Actualización de tu solicitud'
  end;
  v_body := case new.status
    when 'in_review' then 'Revisando detalles para asegurar que sean el match perfecto.'
    when 'videocall_requested' then 'Su cuidador quiere conocerte en una breve videollamada.'
    when 'approved' then 'Prepara su espacio, sus patitas ya tienen destino.'
    when 'preparing' then 'Preparando sus patitas y sus cosas para salir hacia ti.'
    when 'in_transit' then 'Sus patitas van en camino hacia ti.'
    when 'nearby' then 'Sus patitas están a pocos minutos de tu puerta.'
    when 'delivered' then 'Hoy comienza su nueva historia juntos.'
    when 'rejected' then coalesce(new.owner_note, 'Esta vez no fue posible. Hay más patitas esperando por ti.')
    when 'cancelled' then 'La solicitud para ' || v_animal || ' fue cancelada.'
    else ''
  end;

  if new.status = 'cancelled' then
    perform public.notify(new.owner_id, 'request_status', v_title, v_body, jsonb_build_object('request_id', new.id));
  else
    perform public.notify(new.requester_id, 'request_status', v_title, v_body, jsonb_build_object('request_id', new.id));
  end if;
  return new;
end;
$$;

create trigger requests_after_write
  after insert or update of status on public.requests
  for each row execute function public.requests_after_write();

create or replace function public.answer_follow_up(
  p_follow_up_id uuid, p_response public.follow_up_response, p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.follow_ups
    set response = p_response, notes = nullif(btrim(p_notes), ''), answered_at = now()
    where id = p_follow_up_id and user_id = auth.uid() and answered_at is null and due_at <= now();
  if not found then
    raise exception 'Seguimiento no disponible' using errcode = 'P0002';
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Favoritos: avisar cambios de estado del anuncio
-- ─────────────────────────────────────────────────────────────
create or replace function public.listings_notify_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_animal text;
  v_label text;
  v_user uuid;
begin
  if new.status = old.status or new.status not in ('available', 'reserved', 'sold', 'adopted', 'withdrawn') then
    return new;
  end if;
  select coalesce(name, 'Una mascota de tu lista') into v_animal from public.animals where id = new.animal_id;
  v_label := case new.status
    when 'available' then 'vuelve a estar disponible'
    when 'reserved' then 'está reservada'
    when 'sold' then 'ya encontró hogar'
    when 'adopted' then 'ya fue adoptada'
    when 'withdrawn' then 'ya no está publicada'
  end;
  for v_user in
    select user_id from public.favorites where listing_id = new.id and user_id <> new.owner_id
  loop
    perform public.notify(
      v_user, 'favorite_status', v_animal || ' ' || v_label, 'Toca para ver los detalles.',
      jsonb_build_object('listing_id', new.id)
    );
  end loop;
  return new;
end;
$$;

create trigger listings_notify_status
  after update of status on public.listings
  for each row execute function public.listings_notify_status();

-- ─────────────────────────────────────────────────────────────
-- Reportes: límite anti-abuso
-- ─────────────────────────────────────────────────────────────
create or replace function public.reports_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.reporter_id := auth.uid();
  new.status := 'open';
  new.resolution_note := null;
  new.resolved_by := null;
  new.resolved_at := null;
  if (
    select count(*) from public.reports
    where reporter_id = new.reporter_id and created_at > now() - interval '1 day'
  ) >= 10 then
    raise exception 'Límite diario de reportes alcanzado' using errcode = 'P0001';
  end if;
  if new.target_type = 'conversation' and not public.is_conversation_participant(new.conversation_id) then
    raise exception 'Solo puedes reportar conversaciones en las que participas' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger reports_before_insert
  before insert on public.reports
  for each row execute function public.reports_before_insert();

-- ─────────────────────────────────────────────────────────────
-- Administración (todas las acciones quedan en admin_audit_log)
-- ─────────────────────────────────────────────────────────────
create or replace function public.audit(p_action text, p_table text, p_target text, p_details jsonb)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.admin_audit_log (admin_id, action, target_table, target_id, details)
  values (auth.uid(), p_action, p_table, p_target, coalesce(p_details, '{}'::jsonb));
$$;

revoke execute on function public.audit(text, text, text, jsonb) from public, anon, authenticated;

create or replace function public.assert_admin()
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Acción reservada a administradores' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.admin_set_listing_moderation(
  p_listing_id uuid, p_status public.moderation_status, p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  if p_status = 'hidden' and coalesce(btrim(p_reason), '') = '' then
    raise exception 'Indica el motivo de la moderación' using errcode = 'P0001';
  end if;
  update public.listings
    set moderation_status = p_status, moderation_reason = nullif(btrim(p_reason), '')
    where id = p_listing_id;
  if not found then
    raise exception 'Publicación no encontrada' using errcode = 'P0002';
  end if;
  perform public.audit('listing_moderation', 'listings', p_listing_id::text,
    jsonb_build_object('status', p_status, 'reason', p_reason));
  if p_status = 'hidden' then
    perform public.notify(
      (select owner_id from public.listings where id = p_listing_id), 'moderation',
      'Tu publicación fue ocultada', coalesce(p_reason, 'Incumple las normas de la comunidad.'),
      jsonb_build_object('listing_id', p_listing_id)
    );
  end if;
end;
$$;

create or replace function public.admin_set_user_suspension(p_user_id uuid, p_suspend boolean, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  if p_user_id = auth.uid() then
    raise exception 'No puedes suspender tu propia cuenta' using errcode = 'P0001';
  end if;
  if p_suspend and coalesce(btrim(p_reason), '') = '' then
    raise exception 'Indica el motivo de la suspensión' using errcode = 'P0001';
  end if;
  update public.profiles
    set suspended_at = case when p_suspend then now() end,
        suspension_reason = case when p_suspend then btrim(p_reason) end
    where id = p_user_id;
  if not found then
    raise exception 'Usuario no encontrado' using errcode = 'P0002';
  end if;
  perform public.audit(case when p_suspend then 'user_suspend' else 'user_unsuspend' end,
    'profiles', p_user_id::text, jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function public.admin_resolve_report(
  p_report_id uuid, p_status public.report_status, p_note text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  update public.reports
    set status = p_status,
        resolution_note = nullif(btrim(p_note), ''),
        resolved_by = case when p_status in ('resolved', 'dismissed') then auth.uid() end,
        resolved_at = case when p_status in ('resolved', 'dismissed') then now() end
    where id = p_report_id;
  if not found then
    raise exception 'Reporte no encontrado' using errcode = 'P0002';
  end if;
  perform public.audit('report_' || p_status::text, 'reports', p_report_id::text,
    jsonb_build_object('note', p_note));
end;
$$;

-- Acceso excepcional a una conversación: exige un reporte sobre ella y queda auditado.
create or replace function public.admin_read_reported_conversation(p_report_id uuid)
returns table (id uuid, sender_id uuid, sender_name text, content text, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conversation uuid;
begin
  perform public.assert_admin();
  select conversation_id into v_conversation from public.reports
    where reports.id = p_report_id and target_type = 'conversation';
  if v_conversation is null then
    raise exception 'El reporte no corresponde a una conversación' using errcode = 'P0002';
  end if;
  perform public.audit('conversation_read', 'conversations', v_conversation::text,
    jsonb_build_object('report_id', p_report_id));
  return query
    select m.id, m.sender_id, p.full_name, m.content, m.created_at
    from public.messages m join public.profiles p on p.id = m.sender_id
    where m.conversation_id = v_conversation
    order by m.created_at;
end;
$$;

create or replace function public.admin_close_conversation(p_conversation_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  update public.conversations set status = 'closed' where id = p_conversation_id;
  perform public.audit('conversation_close', 'conversations', p_conversation_id::text,
    jsonb_build_object('reason', p_reason));
end;
$$;

-- Usuarios para el panel admin (incluye estado de suspensión y conteo de reportes).
create or replace function public.admin_list_users(p_search text default null)
returns table (
  id uuid, full_name text, partner_type public.partner_type, created_at timestamptz,
  suspended_at timestamptz, suspension_reason text, listings_count bigint, reports_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  perform public.assert_admin();
  return query
    select p.id, p.full_name, p.partner_type, p.created_at, p.suspended_at, p.suspension_reason,
      (select count(*) from public.listings l where l.owner_id = p.id),
      (select count(*) from public.reports r where r.reported_user_id = p.id)
    from public.profiles p
    where p_search is null or p.full_name ilike '%' || p_search || '%'
    order by p.created_at desc
    limit 100;
end;
$$;

-- Altas/cambios de catálogo por admin quedan auditados.
create or replace function public.audit_catalog_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.audit(lower(tg_op), tg_table_name, new.id::text, to_jsonb(new));
  return new;
end;
$$;

create trigger categories_audit after insert or update on public.categories
  for each row execute function public.audit_catalog_change();
create trigger breeds_audit after insert or update on public.breeds
  for each row execute function public.audit_catalog_change();

-- Los RPCs públicos solo para usuarios autenticados
revoke execute on function public.start_conversation(uuid) from public, anon;
revoke execute on function public.mark_conversation_read(uuid) from public, anon;
revoke execute on function public.my_conversations() from public, anon;
revoke execute on function public.create_request(uuid, public.housing_type, boolean, text, text, text, text, public.delivery_method, date, text, text, boolean) from public, anon;
revoke execute on function public.update_request_status(uuid, public.request_status, text) from public, anon;
revoke execute on function public.answer_follow_up(uuid, public.follow_up_response, text) from public, anon;
revoke execute on function public.admin_set_listing_moderation(uuid, public.moderation_status, text) from public, anon;
revoke execute on function public.admin_set_user_suspension(uuid, boolean, text) from public, anon;
revoke execute on function public.admin_resolve_report(uuid, public.report_status, text) from public, anon;
revoke execute on function public.admin_read_reported_conversation(uuid) from public, anon;
revoke execute on function public.admin_close_conversation(uuid, text) from public, anon;
revoke execute on function public.admin_list_users(text) from public, anon;
grant execute on function public.start_conversation(uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.my_conversations() to authenticated;
grant execute on function public.create_request(uuid, public.housing_type, boolean, text, text, text, text, public.delivery_method, date, text, text, boolean) to authenticated;
grant execute on function public.update_request_status(uuid, public.request_status, text) to authenticated;
grant execute on function public.answer_follow_up(uuid, public.follow_up_response, text) to authenticated;
grant execute on function public.admin_set_listing_moderation(uuid, public.moderation_status, text) to authenticated;
grant execute on function public.admin_set_user_suspension(uuid, boolean, text) to authenticated;
grant execute on function public.admin_resolve_report(uuid, public.report_status, text) to authenticated;
grant execute on function public.admin_read_reported_conversation(uuid) to authenticated;
grant execute on function public.admin_close_conversation(uuid, text) to authenticated;
grant execute on function public.admin_list_users(text) to authenticated;
