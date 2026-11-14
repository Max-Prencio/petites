---
name: supabase-rls
description: Procedimiento para crear o modificar tablas, políticas RLS, funciones RPC, Storage y Realtime en Supabase para Petites. Úsalo siempre que cambie el esquema de base de datos.
---
# Supabase en Petites

## Migraciones
1. `supabase migration new <nombre_descriptivo>` — nunca edites una migración ya aplicada en un entorno compartido.
2. Escribe SQL idempotente cuando sea posible y nombra todo en `public.` explícitamente.
3. `supabase migration up` (local) → `supabase test db` → `pnpm db:types`.

## RLS (obligatorio en toda tabla)
```sql
alter table public.mi_tabla enable row level security;
create policy "mi_tabla: leer propias" on public.mi_tabla
  for select to authenticated using (user_id = auth.uid());
```
- Usa helpers existentes: `public.is_admin()`, `public.is_suspended()`, `public.is_conversation_participant(id)`, `public.is_listing_public(id)`, `public.owns_animal(id)`.
- Para evitar recursión entre políticas, encapsula subconsultas en funciones `security definer stable set search_path = ''`.
- Protege columnas con `revoke update on t from authenticated; grant update (col1, col2) on t to authenticated;`.
- Nunca confíes en valores del cliente para identidad: fuerza `auth.uid()` en triggers `before insert`.

## RPC
- `security definer`, `set search_path = ''`, validar actor y estado, `raise exception ... using errcode` ('42501' permiso, 'P0001' regla, 'P0002' no encontrado).
- `revoke execute ... from public, anon; grant execute ... to authenticated;`

## Storage
- Rutas `<auth.uid()>/<carpeta>/<archivo>`; políticas con `(storage.foldername(name))[1] = auth.uid()::text`.
- Límites en `storage.buckets.file_size_limit` y `allowed_mime_types`.

## Realtime
- `alter publication supabase_realtime add table public.<tabla>;` — los eventos respetan RLS.

## Pruebas
Agrega casos en `supabase/tests/*.sql` (pgTAP) para acceso permitido y denegado.
