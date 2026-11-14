// Petites · Edge Function: envía push (Expo) cuando se inserta una fila en public.notifications.
// La invoca el trigger notifications_push (migración 0005) con el secreto compartido PUSH_WEBHOOK_SECRET.
import { createClient } from 'jsr:@supabase/supabase-js@2';

interface NotificationRecord {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
}

interface ExpoTicket {
  status: 'ok' | 'error';
  details?: { error?: string };
}

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

Deno.serve(async (req) => {
  const secret = Deno.env.get('PUSH_WEBHOOK_SECRET');
  if (!secret || req.headers.get('x-webhook-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { record } = (await req.json()) as { record?: NotificationRecord };
  if (!record?.user_id) return new Response('Bad request', { status: 400 });

  // La service role solo existe aquí (servidor). Nunca en la app.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: tokens, error } = await supabase.from('push_tokens').select('token').eq('user_id', record.user_id);
  if (error) return new Response(error.message, { status: 500 });
  if (!tokens?.length) return new Response(JSON.stringify({ sent: 0 }), { status: 200 });

  const messages = tokens.map(({ token }) => ({
    to: token,
    title: record.title,
    body: record.body,
    sound: 'default',
    data: { ...record.data, notification_id: record.id, type: record.type },
  }));

  const response = await fetch(EXPO_PUSH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(messages),
  });
  const result = (await response.json()) as { data?: ExpoTicket[] };

  // Limpia tokens de dispositivos que ya no existen.
  const stale = (result.data ?? [])
    .map((ticket, i) => (ticket.details?.error === 'DeviceNotRegistered' ? tokens[i]?.token : null))
    .filter((t): t is string => Boolean(t));
  if (stale.length) await supabase.from('push_tokens').delete().in('token', stale);

  return new Response(JSON.stringify({ sent: messages.length, removed: stale.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
