# CLAUDE.md — Petites (Marketplace de Animales)

App móvil Android/iOS para **compra, venta y adopción** de animales domésticos, con foco inicial en República Dominicana. Marca: **Petites**, *"Sus patitas en camino hacia ti"*.

Lee primero: `docs/ARCHITECTURE.md` (modelo, RLS, flujos), `docs/DECISIONS.md` (supuestos y pendientes), `docs/BRANDING.md` (copy y tokens).

## Stack (no cambiar sin aprobación)
Expo SDK 58 · Expo Router (rutas en `app/`) · TypeScript estricto · NativeWind 4.2.7 + sistema de diseño propio · lucide-react-native · Reanimated 4 · Zustand · TanStack Query · React Hook Form + Zod · Supabase (Auth, Postgres + RLS, Storage, Realtime, Edge Functions) · expo-image · FlashList · date-fns · expo-notifications. Prohibido Flutter, React Native Paper u otras librerías de UI.

## Estructura
- `app/` rutas · `src/components/` UI (`ui/` primitivas, `form/` campos RHF) · `src/features/<módulo>/{api,hooks}.ts` lógica y datos · `src/services/` cliente Supabase y storage · `src/stores/` Zustand · `src/schemas/` Zod · `src/types/database.types.ts` (generado) · `src/constants/` tokens y copy · `src/utils/` funciones puras.
- `supabase/migrations/` SQL versionado · `supabase/seed.sql` · `supabase/tests/` pgTAP · `supabase/functions/push` Edge Function.
- `.maestro/flows/` E2E · `.claude/agents/` subagentes · `.claude/skills/` procedimientos (supabase-rls, expo-router).

## Reglas inquebrantables
1. Sin `any`. Todo tipado; tipos de BD regenerados con `pnpm db:types` tras cada migración.
2. Nada de Supabase en `app/` ni `src/components/` (ESLint lo bloquea). Usa hooks de `src/features`.
3. Módulos desacoplados: un feature no importa la `api.ts` de otro.
4. Toda regla sensible se impone en PostgreSQL (RLS, constraints, RPC `security definer`). Ocultar botones no es seguridad.
5. Nunca `SUPABASE_SERVICE_ROLE_KEY` ni secretos en la app, `EXPO_PUBLIC_*` o el repo. Contraseñas solo vía Supabase Auth.
6. Cambios de BD solo con migraciones nuevas (`supabase migration new`).
7. Alcance MVP estricto: sin pagos, reseñas ni logística propia (ver `docs/DECISIONS.md`).
8. Dependencias solo con `npx expo install`, verificando compatibilidad con SDK 58.
9. Copy de marca desde `src/constants/brand.ts` / `requestStatus.ts`; evita "comprar" en adopción.
10. Toda pantalla con estados de carga, vacío, error y confirmación.

## Comandos
```bash
supabase start                 # Postgres, Auth, Storage, Realtime locales (requiere Docker)
supabase db reset              # reaplica migraciones + seed
pnpm start                     # Expo dev server (development build recomendado)
npx expo lint && npx tsc --noEmit && pnpm test   # antes de cualquier commit (hook lo exige)
supabase test db               # pruebas RLS/RPC (pgTAP)
pnpm db:types                  # regenerar src/types/database.types.ts
pnpm e2e                       # Maestro (simulador + development build)
pnpm secrets                   # gitleaks
```

Usuarios de prueba (solo local, contraseña `Petites123`): `ana@petites.test` (particular), `refugio@petites.test` (refugio), `admin@petites.test` (admin).

## Flujo de trabajo
Haz commit y confirma con el usuario antes de hacer push. Delega en subagentes de `.claude/agents/` cuando el cambio lo amerite (p. ej. `database-auditor` tras tocar RLS).
