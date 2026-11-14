# Puesta en marcha

## 1. Herramientas

| Herramienta | Verificar | Instalar (macOS) |
|---|---|---|
| Node 24+ y pnpm 11 | `node -v`, `pnpm -v` | `corepack enable` |
| Docker Desktop | `docker info` | docker.com |
| Supabase CLI | `supabase --version` | `brew install supabase/tap/supabase` |
| GitHub CLI | `gh --version` | `brew install gh` |
| Gitleaks | `gitleaks version` | `brew install gitleaks` |
| Maestro (E2E) | `maestro --version` | `brew install mobile-dev-inc/tap/maestro` (requiere Java 17+) |

Autenticación: `gh auth login`, `supabase login`, y `EXPO_TOKEN` (o `npx eas-cli login`) para builds.

> El proyecto usa `nodeLinker: hoisted` (`pnpm-workspace.yaml`), necesario para que Metro resuelva NativeWind y los módulos nativos.

## 2. Backend local

```bash
supabase start           # primera vez descarga imágenes (unos minutos)
supabase status          # URL de la API, anon key, Studio (http://127.0.0.1:54323) y Mailpit
```

- Los correos (códigos OTP) se ven en **Mailpit**: http://127.0.0.1:54324
- `supabase db reset` reaplica las migraciones y `seed.sql` (provincias, categorías, razas, 3 usuarios y 3 publicaciones de ejemplo).
- Usuarios de prueba: `ana@petites.test`, `refugio@petites.test`, `admin@petites.test` — contraseña `Petites123`.

`.env`:
```
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY de supabase status>
```
En un dispositivo físico, reemplaza `127.0.0.1` por la IP de tu computadora en la red local.

## 3. App

```bash
pnpm start
```

- La app usa módulos nativos (Reanimated 4, notificaciones, image picker): lo recomendable es un **development build**: `npx expo run:ios` / `npx expo run:android`, o `npx eas-cli build --profile development`.
- Push remoto requiere un `projectId` de EAS (`npx eas-cli init`) y un dispositivo físico. Las notificaciones in-app y los recordatorios locales funcionan sin push.

## 4. Pruebas

```bash
npx expo lint && npx tsc --noEmit
pnpm test               # unitarias
supabase test db        # RLS / RPC
pnpm e2e                # Maestro con la app instalada en simulador/emulador y Supabase local con seed
```

## 5. Producción (Supabase Cloud)

1. Crea el proyecto (región cercana: `us-east-1`), y vincúlalo: `supabase link --project-ref <ref>`.
2. `supabase db push` para aplicar las migraciones (el seed de usuarios de prueba **no** se aplica en remoto).
3. Carga solo el catálogo de referencia (provincias, categorías, razas) desde `seed.sql`, revisado según normativa.
4. Auth → habilita confirmación de correo y pega las plantillas de `supabase/templates/` (usan `{{ .Token }}`); configura SMTP propio.
5. Push:
   ```bash
   supabase functions deploy push --no-verify-jwt
   supabase secrets set PUSH_WEBHOOK_SECRET=<valor-aleatorio-largo>
   ```
   y en el SQL editor:
   ```sql
   select vault.create_secret('https://<ref>.supabase.co/functions/v1/push', 'push_function_url');
   select vault.create_secret('<mismo PUSH_WEBHOOK_SECRET>', 'push_webhook_secret');
   ```
6. Asigna administradores **solo por SQL** (queda fuera del cliente):
   ```sql
   insert into public.user_roles (user_id, role) values ('<uuid>', 'admin');
   ```
7. `.env` de producción con la URL y la anon key del proyecto. Nunca uses la service role en la app.
