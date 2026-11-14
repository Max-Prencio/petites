-- Petites · Funciones de autorización y políticas RLS
-- Toda autorización vive aquí: la app solo usa la clave anon.

-- ─────────────────────────────────────────────────────────────
-- Helpers (security definer para evitar recursión de políticas)
-- ─────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_suspended(p_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select suspended_at is not null from public.profiles where id = p_user), false);
$$;

create or replace function public.is_conversation_participant(p_conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = p_conversation and user_id = auth.uid()
  );
$$;

create or replace function public.is_blocked_between(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_blocks
    where (blocker_id = p_a and blocked_id = p_b) or (blocker_id = p_b and blocked_id = p_a)
  );
$$;

-- Un anuncio es público si no está moderado, está en un estado visible y su dueño no está suspendido.
create or replace function public.is_listing_public(p_listing uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.listings l
    join public.profiles p on p.id = l.owner_id
    where l.id = p_listing
      and l.moderation_status = 'visible'
      and l.status in ('available', 'reserved', 'sold', 'adopted')
      and p.suspended_at is null
  );
$$;

create or replace function public.is_animal_public(p_animal uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.listings l
    where l.animal_id = p_animal and public.is_listing_public(l.id)
  );
$$;

create or replace function public.owns_animal(p_animal uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.animals where id = p_animal and owner_id = auth.uid());
$$;

-- "Contacto verificado" del perfil público: correo confirmado en Supabase Auth.
create or replace function public.is_contact_verified(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select email_confirmed_at is not null from auth.users where id = p_user), false);
$$;

-- ─────────────────────────────────────────────────────────────
-- Activar RLS en TODAS las tablas
-- ─────────────────────────────────────────────────────────────
alter table public.provinces enable row level security;
alter table public.profiles enable row level security;
alter table public.profile_private enable row level security;
alter table public.user_roles enable row level security;
alter table public.categories enable row level security;
alter table public.breeds enable row level security;
alter table public.animals enable row level security;
alter table public.animal_images enable row level security;
alter table public.animal_documents enable row level security;
alter table public.listings enable row level security;
alter table public.favorites enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.user_blocks enable row level security;
alter table public.requests enable row level security;
alter table public.request_events enable row level security;
alter table public.follow_ups enable row level security;
alter table public.reports enable row level security;
alter table public.notifications enable row level security;
alter table public.push_tokens enable row level security;
alter table public.admin_audit_log enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Catálogo de referencia: lectura pública, escritura admin
-- ─────────────────────────────────────────────────────────────
create policy "provinces: lectura pública" on public.provinces for select using (true);

create policy "categories: lectura pública de activas" on public.categories
  for select using (active or public.is_admin());
create policy "categories: admin inserta" on public.categories
  for insert to authenticated with check (public.is_admin());
create policy "categories: admin actualiza" on public.categories
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "breeds: lectura pública de activas" on public.breeds
  for select using (active or public.is_admin());
create policy "breeds: admin inserta" on public.breeds
  for insert to authenticated with check (public.is_admin());
create policy "breeds: admin actualiza" on public.breeds
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Perfiles
-- ─────────────────────────────────────────────────────────────
create policy "profiles: lectura pública" on public.profiles for select using (true);
create policy "profiles: el dueño actualiza" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- INSERT lo hace el trigger handle_new_user; no hay política de insert para clientes.

create policy "profile_private: solo el dueño lee" on public.profile_private
  for select to authenticated using (user_id = auth.uid());
create policy "profile_private: solo el dueño actualiza" on public.profile_private
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Roles: lectura propia (o admin). Sin INSERT/UPDATE/DELETE para clientes:
-- nadie puede autoasignarse 'admin'. Los roles de publicador los concede un trigger.
create policy "user_roles: lectura propia o admin" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Animales, imágenes y documentos
-- ─────────────────────────────────────────────────────────────
create policy "animals: lectura si es público, propio o admin" on public.animals
  for select using (owner_id = auth.uid() or public.is_animal_public(id) or public.is_admin());
create policy "animals: crear propios" on public.animals
  for insert to authenticated with check (owner_id = auth.uid() and not public.is_suspended());
create policy "animals: editar propios" on public.animals
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "animals: borrar propios" on public.animals
  for delete to authenticated using (owner_id = auth.uid());

create policy "animal_images: lectura según animal" on public.animal_images
  for select using (public.owns_animal(animal_id) or public.is_animal_public(animal_id) or public.is_admin());
create policy "animal_images: el dueño agrega en su carpeta" on public.animal_images
  for insert to authenticated with check (
    public.owns_animal(animal_id) and split_part(storage_path, '/', 1) = auth.uid()::text
  );
create policy "animal_images: el dueño reordena" on public.animal_images
  for update to authenticated using (public.owns_animal(animal_id)) with check (public.owns_animal(animal_id));
create policy "animal_images: el dueño borra" on public.animal_images
  for delete to authenticated using (public.owns_animal(animal_id));

create policy "animal_documents: solo dueño o admin" on public.animal_documents
  for select to authenticated using (public.owns_animal(animal_id) or public.is_admin());
create policy "animal_documents: el dueño agrega" on public.animal_documents
  for insert to authenticated with check (
    public.owns_animal(animal_id) and split_part(storage_path, '/', 1) = auth.uid()::text
  );
create policy "animal_documents: el dueño borra" on public.animal_documents
  for delete to authenticated using (public.owns_animal(animal_id));

-- ─────────────────────────────────────────────────────────────
-- Publicaciones
-- ─────────────────────────────────────────────────────────────
create policy "listings: lectura pública de visibles, propias o admin" on public.listings
  for select using (owner_id = auth.uid() or public.is_listing_public(id) or public.is_admin());
create policy "listings: crear con animal propio" on public.listings
  for insert to authenticated with check (
    owner_id = auth.uid() and public.owns_animal(animal_id) and not public.is_suspended()
  );
create policy "listings: el dueño o admin actualiza" on public.listings
  for update to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());
create policy "listings: el dueño borra" on public.listings
  for delete to authenticated using (owner_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Favoritos: todo limitado a auth.uid()
-- ─────────────────────────────────────────────────────────────
create policy "favorites: leer propios" on public.favorites
  for select to authenticated using (user_id = auth.uid());
create policy "favorites: crear propios" on public.favorites
  for insert to authenticated with check (user_id = auth.uid() and public.is_listing_public(listing_id));
create policy "favorites: borrar propios" on public.favorites
  for delete to authenticated using (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Mensajería: solo participantes. Las conversaciones se crean vía start_conversation().
-- ─────────────────────────────────────────────────────────────
create policy "conversations: solo participantes" on public.conversations
  for select to authenticated using (public.is_conversation_participant(id));

create policy "participants: ver los de mis conversaciones" on public.conversation_participants
  for select to authenticated using (public.is_conversation_participant(conversation_id));

create policy "messages: participantes leen" on public.messages
  for select to authenticated using (public.is_conversation_participant(conversation_id));
create policy "messages: participantes envían como sí mismos" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and public.is_conversation_participant(conversation_id)
    and not public.is_suspended()
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.status = 'open'
    )
    and not exists (
      select 1 from public.conversation_participants cp
      where cp.conversation_id = messages.conversation_id
        and cp.user_id <> auth.uid()
        and public.is_blocked_between(auth.uid(), cp.user_id)
    )
  );

create policy "user_blocks: gestionar los propios" on public.user_blocks
  for all to authenticated using (blocker_id = auth.uid()) with check (blocker_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Solicitudes: lectura de las partes; escritura solo mediante RPC
-- ─────────────────────────────────────────────────────────────
create policy "requests: solicitante, dueño o admin leen" on public.requests
  for select to authenticated using (
    requester_id = auth.uid() or owner_id = auth.uid() or public.is_admin()
  );

create policy "request_events: partes de la solicitud" on public.request_events
  for select to authenticated using (
    exists (
      select 1 from public.requests r
      where r.id = request_id
        and (r.requester_id = auth.uid() or r.owner_id = auth.uid() or public.is_admin())
    )
  );

create policy "follow_ups: leer propios" on public.follow_ups
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- ─────────────────────────────────────────────────────────────
-- Reportes
-- ─────────────────────────────────────────────────────────────
create policy "reports: usuario autenticado crea" on public.reports
  for insert to authenticated with check (reporter_id = auth.uid() and not public.is_suspended());
create policy "reports: leer propios o admin" on public.reports
  for select to authenticated using (reporter_id = auth.uid() or public.is_admin());
-- La resolución se hace con admin_resolve_report() (auditada).

-- ─────────────────────────────────────────────────────────────
-- Notificaciones y push tokens
-- ─────────────────────────────────────────────────────────────
create policy "notifications: leer propias" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "notifications: marcar propias" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "notifications: borrar propias" on public.notifications
  for delete to authenticated using (user_id = auth.uid());

create policy "push_tokens: gestionar propios" on public.push_tokens
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- Auditoría: solo lectura admin; escritura solo desde funciones definer
-- ─────────────────────────────────────────────────────────────
create policy "audit: admin lee" on public.admin_audit_log
  for select to authenticated using (public.is_admin());
