-- Petites · Esquema base del MVP
-- Separa la ficha del animal (animals) de la oferta que se muestra en el marketplace (listings).

create extension if not exists pg_trgm with schema extensions;

-- ─────────────────────────────────────────────────────────────
-- Tipos
-- ─────────────────────────────────────────────────────────────
create type public.app_role as enum ('buyer', 'adopter', 'seller', 'adoption_publisher', 'admin');
create type public.partner_type as enum ('individual', 'shelter', 'store', 'vet', 'breeder');
create type public.tri_state as enum ('yes', 'no', 'unknown');
create type public.animal_sex as enum ('male', 'female', 'unknown');
create type public.animal_size as enum ('small', 'medium', 'large', 'giant');
create type public.age_unit as enum ('months', 'years');
create type public.listing_type as enum ('sale', 'adoption');
create type public.listing_status as enum ('draft', 'available', 'reserved', 'sold', 'adopted', 'paused', 'withdrawn');
create type public.moderation_status as enum ('visible', 'hidden');
create type public.currency_code as enum ('DOP', 'USD');
create type public.conversation_status as enum ('open', 'closed');
create type public.housing_type as enum ('house', 'apartment', 'farm', 'other');
create type public.delivery_method as enum ('delivery', 'pickup');
create type public.request_status as enum (
  'submitted', 'in_review', 'videocall_requested', 'approved',
  'preparing', 'in_transit', 'nearby', 'delivered', 'rejected', 'cancelled'
);
create type public.follow_up_kind as enum ('day_7', 'day_30');
create type public.follow_up_response as enum ('great', 'adapting', 'issues');
create type public.report_target as enum ('listing', 'user', 'conversation');
create type public.report_reason as enum ('fraud', 'abuse', 'illegal_species', 'animal_welfare', 'inappropriate', 'spam', 'other');
create type public.report_status as enum ('open', 'reviewing', 'resolved', 'dismissed');

-- ─────────────────────────────────────────────────────────────
-- Utilidades
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- Ubicación (República Dominicana como mercado inicial)
-- ─────────────────────────────────────────────────────────────
create table public.provinces (
  id smallint generated always as identity primary key,
  country_code char(2) not null default 'DO',
  name text not null,
  unique (country_code, name)
);

-- ─────────────────────────────────────────────────────────────
-- Identidad y perfiles
-- ─────────────────────────────────────────────────────────────
-- Datos PÚBLICOS del perfil. Lo privado vive en profile_private.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 80),
  avatar_path text,
  bio text check (char_length(bio) <= 500),
  partner_type public.partner_type not null default 'individual',
  province_id smallint references public.provinces (id),
  city text check (char_length(city) <= 80),
  onboarded_at timestamptz,
  suspended_at timestamptz,
  suspension_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profile_private (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  phone text check (phone ~ '^\+?[0-9 ()-]{7,20}$'),
  address_line text check (char_length(address_line) <= 200),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.app_role not null,
  granted_at timestamptz not null default now(),
  granted_by uuid references public.profiles (id),
  primary key (user_id, role)
);

-- ─────────────────────────────────────────────────────────────
-- Catálogo administrable
-- ─────────────────────────────────────────────────────────────
create table public.categories (
  id smallint generated always as identity primary key,
  parent_id smallint references public.categories (id),
  name text not null check (char_length(name) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  icon text,
  sort_order smallint not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.breeds (
  id integer generated always as identity primary key,
  category_id smallint not null references public.categories (id),
  name text not null check (char_length(name) between 2 and 80),
  active boolean not null default true,
  unique (category_id, name)
);

-- ─────────────────────────────────────────────────────────────
-- Animales y galerías
-- ─────────────────────────────────────────────────────────────
create table public.animals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category_id smallint not null references public.categories (id),
  breed_id integer references public.breeds (id),
  name text check (char_length(name) <= 60),
  age_value smallint not null check (age_value between 0 and 600),
  age_unit public.age_unit not null,
  age_months integer generated always as (
    case when age_unit = 'years' then age_value * 12 else age_value end
  ) stored,
  sex public.animal_sex not null default 'unknown',
  size public.animal_size not null,
  vaccinated public.tri_state not null default 'unknown',
  vaccination_complete public.tri_state not null default 'unknown',
  dewormed public.tri_state not null default 'unknown',
  sterilized public.tri_state not null default 'unknown',
  has_vet_documents boolean not null default false,
  medical_notes text check (char_length(medical_notes) <= 1000),
  description text not null check (char_length(description) between 20 and 2000),
  personality_tags text[] not null default '{}' check (cardinality(personality_tags) <= 8),
  good_for_apartment boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.animal_images (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals (id) on delete cascade,
  storage_path text not null,
  sort_order smallint not null default 0 check (sort_order between 0 and 9),
  created_at timestamptz not null default now(),
  unique (animal_id, storage_path)
);

-- Documentos veterinarios: privados por defecto (bucket vet-docs, no público).
create table public.animal_documents (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals (id) on delete cascade,
  storage_path text not null,
  label text check (char_length(label) <= 80),
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Publicaciones
-- ─────────────────────────────────────────────────────────────
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  animal_id uuid not null references public.animals (id) on delete cascade,
  listing_type public.listing_type not null,
  price numeric(12, 2),
  currency public.currency_code,
  status public.listing_status not null default 'available',
  moderation_status public.moderation_status not null default 'visible',
  moderation_reason text,
  province_id smallint not null references public.provinces (id),
  city text not null check (char_length(city) between 2 and 80),
  conditions text check (char_length(conditions) <= 1500),
  contract_terms text check (char_length(contract_terms) <= 4000),
  transfer_fee numeric(10, 2) check (transfer_fee >= 0),
  allows_delivery boolean not null default true,
  allows_pickup boolean not null default true,
  delivery_window text check (char_length(delivery_window) <= 120),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Venta exige precio positivo y moneda; adopción no admite precio.
  constraint listings_price_by_type check (
    (listing_type = 'sale' and price is not null and price > 0 and currency is not null)
    or (listing_type = 'adoption' and price is null)
  ),
  constraint listings_final_status_by_type check (
    not (status = 'sold' and listing_type <> 'sale')
    and not (status = 'adopted' and listing_type <> 'adoption')
  ),
  constraint listings_has_handover check (allows_delivery or allows_pickup)
);

create table public.favorites (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- ─────────────────────────────────────────────────────────────
-- Mensajería
-- ─────────────────────────────────────────────────────────────
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  started_by uuid not null references public.profiles (id) on delete cascade,
  status public.conversation_status not null default 'open',
  last_message_at timestamptz,
  last_message_preview text,
  created_at timestamptz not null default now(),
  unique (listing_id, started_by)
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (conversation_id, user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 2000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table public.user_blocks (
  blocker_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

-- ─────────────────────────────────────────────────────────────
-- Solicitudes (pedido de adopción / llegada) con seguimiento
-- ─────────────────────────────────────────────────────────────
create table public.requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  requester_id uuid not null references public.profiles (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  status public.request_status not null default 'submitted',
  housing_type public.housing_type not null,
  has_yard boolean not null default false,
  other_pets text check (char_length(other_pets) <= 300),
  experience text not null check (char_length(experience) between 10 and 1000),
  commitment text not null check (char_length(commitment) between 10 and 1000),
  household text check (char_length(household) <= 300),
  delivery_method public.delivery_method not null,
  preferred_date date,
  preferred_window text check (char_length(preferred_window) <= 120),
  delivery_address text check (char_length(delivery_address) <= 300),
  contract_snapshot text,
  contract_accepted_at timestamptz not null,
  transfer_fee numeric(10, 2),
  price_snapshot numeric(12, 2),
  currency_snapshot public.currency_code,
  owner_note text check (char_length(owner_note) <= 500),
  conversation_id uuid references public.conversations (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> owner_id),
  check (delivery_method = 'pickup' or delivery_address is not null)
);

create table public.request_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.requests (id) on delete cascade,
  status public.request_status not null,
  actor_id uuid references public.profiles (id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind public.follow_up_kind not null,
  due_at timestamptz not null,
  response public.follow_up_response,
  notes text check (char_length(notes) <= 1000),
  answered_at timestamptz,
  unique (request_id, kind)
);

-- ─────────────────────────────────────────────────────────────
-- Reportes, notificaciones y auditoría
-- ─────────────────────────────────────────────────────────────
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type public.report_target not null,
  listing_id uuid references public.listings (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete cascade,
  reason public.report_reason not null,
  details text check (char_length(details) <= 1000),
  status public.report_status not null default 'open',
  resolution_note text,
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (target_type = 'listing' and listing_id is not null)
    or (target_type = 'user' and reported_user_id is not null)
    or (target_type = 'conversation' and conversation_id is not null)
  )
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.push_tokens (
  token text primary key,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  platform text not null check (platform in ('ios', 'android', 'web')),
  updated_at timestamptz not null default now()
);

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────
-- Índices
-- ─────────────────────────────────────────────────────────────
create index listings_catalog_idx on public.listings (status, moderation_status, published_at desc);
create index listings_owner_idx on public.listings (owner_id);
create index listings_animal_idx on public.listings (animal_id);
create index listings_province_idx on public.listings (province_id);
create index listings_type_price_idx on public.listings (listing_type, price);
create index animals_owner_idx on public.animals (owner_id);
create index animals_category_breed_idx on public.animals (category_id, breed_id);
create index animals_age_idx on public.animals (age_months);
create index animals_name_trgm_idx on public.animals using gin (name extensions.gin_trgm_ops);
create index breeds_name_trgm_idx on public.breeds using gin (name extensions.gin_trgm_ops);
create index animal_images_animal_idx on public.animal_images (animal_id, sort_order);
create index animal_documents_animal_idx on public.animal_documents (animal_id);
create index favorites_listing_idx on public.favorites (listing_id);
create index conversations_listing_idx on public.conversations (listing_id);
create index participants_user_idx on public.conversation_participants (user_id);
create index messages_conversation_idx on public.messages (conversation_id, created_at desc);
create index messages_sender_recent_idx on public.messages (sender_id, created_at desc);
create index requests_listing_idx on public.requests (listing_id);
create index requests_requester_idx on public.requests (requester_id, created_at desc);
create index requests_owner_idx on public.requests (owner_id, created_at desc);
create unique index requests_one_active_per_user_idx on public.requests (listing_id, requester_id)
  where status not in ('rejected', 'cancelled', 'delivered');
create index request_events_request_idx on public.request_events (request_id, created_at);
create index follow_ups_user_idx on public.follow_ups (user_id, due_at);
create index reports_status_idx on public.reports (status, created_at desc);
create index reports_reporter_idx on public.reports (reporter_id, created_at desc);
create index notifications_user_idx on public.notifications (user_id, created_at desc);
create index push_tokens_user_idx on public.push_tokens (user_id);
create index breeds_category_idx on public.breeds (category_id);

-- updated_at
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger profile_private_updated_at before update on public.profile_private
  for each row execute function public.set_updated_at();
create trigger animals_updated_at before update on public.animals
  for each row execute function public.set_updated_at();
create trigger listings_updated_at before update on public.listings
  for each row execute function public.set_updated_at();
create trigger requests_updated_at before update on public.requests
  for each row execute function public.set_updated_at();
