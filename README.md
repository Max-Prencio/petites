# Petites 🐾

> *Sus patitas en camino hacia ti.*

App móvil (Android/iOS) para **adoptar, encontrar y publicar** animales domésticos en República Dominicana: catálogo visual con filtros, fichas completas, chat en tiempo real y un flujo de solicitud con seguimiento hasta la puerta de tu hogar.

## Funcionalidades del MVP

- **Cuenta**: registro con verificación de correo por código, inicio y cierre de sesión, recuperación de contraseña, perfil con datos públicos y privados, roles acumulables.
- **Catálogo**: categorías y razas administrables, búsqueda por nombre/raza/características, filtros combinables (modalidad, tipo, raza, edad, sexo, tamaño, precio, ubicación, vacunación, desparasitación, apto para apartamento) que se conservan al volver de una ficha, y ordenamiento.
- **Publicaciones**: formulario por pasos que se adapta a venta o adopción, hasta 8 fotos, salud declarada, requisitos, entrega pet-friendly o recogida con cita, horario, tarifa de traslado informativa y acuerdo de tenencia responsable. Borradores, edición, pausa, cambio de estado y documentos veterinarios privados.
- **Ficha**: galería, datos, salud (con aviso de que es información declarada), requisitos o precio, ubicación aproximada, publicador, favoritos, compartir y reportar.
- **Solicitudes Petites**: ficha de hogar, preferencia de llegada, firma digital del acuerdo; el cuidador aprueba, pide videollamada o rechaza; seguimiento en vivo *Seguir sus patitas*; seguimiento a 7 y 30 días; compartir la experiencia.
- **Mensajería**: conversaciones vinculadas a cada publicación, en tiempo real, con no leídos, bloqueo y reporte.
- **Mi lista** (favoritos) con aviso cuando una mascota cambia de estado.
- **Notificaciones**: bandeja en la app, push con Expo y recordatorios locales.
- **Administración**: reportes, moderación de publicaciones, suspensión de cuentas, categorías y razas, auditoría.

## Inicio rápido

Requisitos: Node 24+, pnpm 11, Docker Desktop y Supabase CLI.

```bash
pnpm install
supabase start                   # levanta Supabase local y aplica migraciones + seed
cp .env.example .env             # con los valores locales de `supabase status`
pnpm start                       # abre en un development build (recomendado) o Expo Go
```

Más detalle en [`docs/SETUP.md`](docs/SETUP.md). Arquitectura en [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Calidad

| Comando | Qué valida |
|---|---|
| `npx expo lint` | ESLint (incluye la regla de capas) |
| `npx tsc --noEmit` | TypeScript estricto |
| `pnpm test` | Jest + React Native Testing Library |
| `supabase test db` | pgTAP: RLS, RPC y ciclo de solicitudes |
| `pnpm e2e` | Maestro: registro, login, publicar, chatear, pedir adopción |
| `pnpm secrets` | Gitleaks |
