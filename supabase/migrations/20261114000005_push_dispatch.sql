-- Petites · Despacho de push: cada notificación nueva llama a la Edge Function "push".
-- URL y secreto viven en Supabase Vault (por entorno), nunca en el repositorio:
--   select vault.create_secret('https://<ref>.supabase.co/functions/v1/push', 'push_function_url');
--   select vault.create_secret('<mismo valor que PUSH_WEBHOOK_SECRET>', 'push_webhook_secret');
-- Si los secretos no existen (p. ej. desarrollo local sin push), el trigger no hace nada.

create extension if not exists pg_net with schema extensions;

create or replace function public.dispatch_push()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url text;
  v_secret text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'push_function_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_webhook_secret';
  if v_url is null or v_secret is null then
    return new;
  end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', v_secret),
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
exception when others then
  -- Un fallo de push nunca debe bloquear la notificación in-app.
  return new;
end;
$$;

revoke execute on function public.dispatch_push() from public, anon, authenticated;

create trigger notifications_push
  after insert on public.notifications
  for each row execute function public.dispatch_push();
