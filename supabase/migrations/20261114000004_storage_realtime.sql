-- Petites · Buckets de Storage, políticas de archivos y publicación Realtime.
-- Rutas: <bucket>/<auth.uid()>/<archivo>. El primer segmento siempre es el dueño.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('animal-photos', 'animal-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('vet-docs', 'vet-docs', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Extensión coherente con el MIME (defensa adicional al límite del bucket).
create or replace function public.storage_extension_ok(p_bucket text, p_name text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case p_bucket
    when 'vet-docs' then lower(p_name) ~ '\.(pdf|jpe?g|png)$'
    else lower(p_name) ~ '\.(jpe?g|png|webp)$'
  end;
$$;

-- Fotos de animales (lectura pública por URL; escritura solo en la carpeta propia)
create policy "animal-photos: subir a carpeta propia" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'animal-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.storage_extension_ok(bucket_id, name)
    and not public.is_suspended()
  );
create policy "animal-photos: actualizar propias" on storage.objects
  for update to authenticated using (
    bucket_id = 'animal-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "animal-photos: borrar propias" on storage.objects
  for delete to authenticated using (
    bucket_id = 'animal-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Avatares
create policy "avatars: subir a carpeta propia" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.storage_extension_ok(bucket_id, name)
  );
create policy "avatars: actualizar propio" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "avatars: borrar propio" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Documentos veterinarios: privados (dueño o admin)
create policy "vet-docs: leer propios o admin" on storage.objects
  for select to authenticated using (
    bucket_id = 'vet-docs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );
create policy "vet-docs: subir a carpeta propia" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'vet-docs'
    and (storage.foldername(name))[1] = auth.uid()::text
    and public.storage_extension_ok(bucket_id, name)
  );
create policy "vet-docs: borrar propios" on storage.objects
  for delete to authenticated using (
    bucket_id = 'vet-docs' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Realtime (postgres_changes respeta RLS: solo participantes reciben eventos)
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
alter publication supabase_realtime add table public.requests;
alter publication supabase_realtime add table public.request_events;
alter publication supabase_realtime add table public.notifications;
