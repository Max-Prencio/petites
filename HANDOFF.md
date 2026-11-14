# Petites · Bitácora del proyecto (handoff)

> *Sus patitas en camino hacia ti.*
> Documento vivo: resume todo lo trabajado hasta el **14 nov 2026** y reserva espacio para las **recomendaciones de QA**. Actualízalo cada vez que se cierre una ronda de cambios.

---

## 1. Estado actual (resumen)

| Área | Estado |
|---|---|
| Código | MVP completo en `main` de https://github.com/Max-Prencio/petites (PR #1 fusionado, merge `c9f46c9`) |
| CI | GitHub Actions: Gitleaks · Lint + Typecheck + Jest · Migraciones + pgTAP — **verde** |
| Pruebas | Jest **31/31** · pgTAP **45/45** · 5 flujos Maestro (sintaxis válida, sin ejecutar en dispositivo) |
| Backend de prueba | Supabase Cloud `petites-staging` (ref `dsjcnjltkewfkgddnomq`, us-east-1) |
| App de prueba | APK de EAS (perfil `preview`) conectado a staging |
| QA | **En curso**: prueba en paralelo cliente (QA) ↔ vendedor. Ver sección 9 |

---

## 2. Producto

App Android/iOS para **adoptar, comprar y publicar** animales domésticos en República Dominicana, con la marca **Petites**.

- **Cuenta**: registro, verificación por código de 6 dígitos (desactivada en staging, ver §6), recuperación de contraseña, onboarding, perfil público/privado, roles acumulables (comprador, adoptante, vendedor, publicador de adopciones, admin).
- **Catálogo**: Inicio, Explorar con búsqueda, filtros combinables que se conservan y ordenamiento; ficha completa del animal.
- **Publicar**: formulario de 4 pasos (venta exige precio; adopción, requisitos), hasta 8 fotos, salud declarada, entrega pet‑friendly o recogida con cita, horario, tarifa de traslado informativa, acuerdo de tenencia, borradores y documentos veterinarios privados.
- **Solicitud Petites**: "Pedir adopción" / "Solicitar llegada" → ficha del hogar → firma del acuerdo → el cuidador aprueba, pide videollamada o rechaza → seguimiento **"Seguir sus patitas"** (Preparando → En camino → Muy cerca → Entregada) → seguimientos a 7 y 30 días → compartir la experiencia.
- **Chat en tiempo real** por publicación, con no leídos, bloqueo y reportes. **Mi lista** (favoritos). **Notificaciones** en la app y push (Expo).
- **Administración**: reportes, moderación de publicaciones, suspensiones, categorías y razas, auditoría.

Decisiones de producto tomadas sin confirmar (pendientes de validar): `docs/DECISIONS.md`.

---

## 3. Stack y arquitectura

- **App**: Expo SDK 58 · Expo Router (rutas en `app/`) · TypeScript estricto · NativeWind 4.2.7 · lucide · Reanimated 4 · Zustand · TanStack Query · React Hook Form + Zod · expo-image · FlashList · expo-notifications · expo-glass-effect · expo-haptics · expo-image-manipulator.
- **Backend**: Supabase (Auth, Postgres con **RLS en todas las tablas**, RPC `security definer`, Storage, Realtime, Edge Function `push`).
- **Reglas clave**: nada de Supabase en `app/` ni `src/components/` (ESLint lo bloquea); toda regla sensible en Postgres; nunca la service role en la app; cambios de BD solo con migraciones.

Estructura y matrices de permisos: `docs/ARCHITECTURE.md`. Reglas para agentes: `CLAUDE.md`.

### Migraciones
| Archivo | Contenido |
|---|---|
| `000001_schema` | Tipos, tablas, índices, triggers |
| `000002_rls` | Funciones auxiliares y todas las políticas RLS |
| `000003_business_logic` | Grants por columna, triggers, vistas, RPC de chat, solicitudes y admin |
| `000004_storage_realtime` | Buckets (`animal-photos`, `avatars`, `vet-docs`) y Realtime |
| `000005_push_dispatch` | Envío de push vía pg_net + Vault |
| `000006_breeds_catalog` | **628 razas** (perros y gatos de es.wikipedia; resto curado, sin especies nativas protegidas de RD) |

---

## 4. Diseño (marca aplicada)

- Paleta: primario `#F47B35`, secundario `#243B32`, marfil `#F8F5EF`. Copy de marca en `src/constants/brand.ts` y `requestStatus.ts`.
- **Estilo iOS + Liquid Glass**: `src/components/ui/Glass.tsx` — nativo en iOS 26+, translúcido sin blur en Android/iOS antiguos (rendimiento). Barra de pestañas flotante, botones y etiquetas de vidrio sobre fotos, panel de acciones flotante en la ficha.
- **Movimiento**: `src/constants/motion.ts` — fade‑up sin rebotes; opciones de menús escalonadas.
- **Fotos**: 7 animales de ejemplo con fotos de Unsplash (`supabase/seed-assets/`); las fotos de usuarios se comprimen en el teléfono (1280 px / avatar 512 px).
- Detalle: `docs/BRANDING.md`.

---

## 5. Cómo correrlo

```bash
pnpm install
supabase start            # local (Docker) + migraciones + seed + fotos
pnpm start                # con development build: npx expo run:android | run:ios
```
Usuarios locales (contraseña `Petites123`): `ana@`, `refugio@`, `admin@petites.test`.
Calidad: `npx expo lint && npx tsc --noEmit && pnpm test && supabase test db`. Más en `docs/SETUP.md`.

---

## 6. Entorno de QA (staging)

- **Supabase**: `petites-staging`. Contraseña de BD, contraseña de cuentas QA y API key de Resend **solo en `supabase/.temp/`** (excluido de git); nunca en el repo.
- **Cuentas QA** (misma contraseña, pedirla por privado): `cliente@`, `vendedor@`, `admin@`, `nuevo.cliente@`, `nuevo.vendedor@petites.test` (las dos últimas sin onboarding).
- **Correo**: SMTP de Resend en modo prueba (sin dominio) ⇒ en staging el **registro no pide código** (`enable_confirmations=false`); recuperar contraseña solo llega al correo dueño de Resend.
- **EAS**: proyecto `@maxwel.prencio/petites`; variables `EXPO_PUBLIC_SUPABASE_*` en el entorno `preview`.
- **APK vigente**: https://expo.dev/accounts/maxwel.prencio/projects/petites/builds/e3c0baff-f02f-4e6e-91cc-71d6a4a090d6
- Plan de pruebas: `docs/QA_PLAN.md` (casos A–G, ~50).

---

## 7. Historial de trabajo

| Commit | Qué |
|---|---|
| `8f7e1a8` | MVP completo (app, 5 migraciones, pruebas, CI, docs, agentes) |
| `41d3271` | CI: builds de pnpm 11 y comparación de tipos |
| `de41ca8` | Errores hallados al correr la app en Android (ver §8) |
| `7373e8a` | Staging (Supabase Cloud + EAS) y plan de QA |
| `3b2ae71` | Correo con Resend |
| `8c64a6e` | Rediseño iOS + Liquid Glass, fotos reales, subida comprimida |
| `e3166a9` | Error de permisos al publicar fotos; catálogo de razas |
| `f61122b` | Animaciones fade‑up sin rebote; registro sin código en staging |
| `c9f46c9` | Merge del PR #1 a `main` |

---

## 8. Errores encontrados y corregidos

| # | Problema | Causa | Solución |
|---|---|---|---|
| 1 | Android no compilaba | `do.petites.app`: `do` es palabra reservada de Java | Identificador `com.petites.app` |
| 2 | La ficha de cualquier animal fallaba | Embed ambiguo `listings → profiles` (dueño vs. favoritos) | `profiles!listings_owner_id_fkey` |
| 3 | El teclado tapaba los campos en Android | Edge‑to‑edge de SDK 58 ya no redimensiona | `KeyboardAvoidingView` con `padding` en ambas plataformas |
| 4 | Estado vacío del chat al revés | `ListEmptyComponent` dentro de lista invertida | Se pinta fuera de la lista |
| 5 | Textos largos solo respondían en la 1.ª línea | El `TextInput` no ocupaba la caja | Ocupa toda la caja |
| 6 | Errores en negro/grandes | NativeWind resuelve conflictos por orden CSS | `Text` fusiona clases (gana `className`) |
| 7 | "Permission denied" al publicar fotos | `upsert` exigía UPDATE en todas las columnas (grant solo `sort_order`) | Insertar nuevas / actualizar solo orden + 3 pruebas pgTAP |
| 8 | Registro fallaba con correos reales | Resend sin dominio solo envía al dueño | Staging sin confirmación; la app soporta ambos modos; mensajes en español |
| 9 | CI rojo al abrir el PR | pnpm 11 con builds sin aprobar; tipos comparados con Prettier | `allowBuilds` y comparación cruda |

---

## 9. Recomendaciones de QA  ✍️ *(completar durante las pruebas)*

Cómo reportar: ID del caso de `docs/QA_PLAN.md`, dispositivo/Android, pasos, esperado vs. obtenido y captura.
Prioridad: **P1** bloquea el flujo · **P2** funciona con dificultad · **P3** visual/mejora.

| ID QA | Caso | Prioridad | Dispositivo | Descripción / pasos | Esperado | Obtenido | Estado | Commit |
|---|---|---|---|---|---|---|---|---|
| QA-001 | | | | | | | Abierto | |
| QA-002 | | | | | | | Abierto | |
| QA-003 | | | | | | | Abierto | |

### Sugerencias de producto / UX (no son errores)
- _Pendiente de QA._

### Ronda de cambios aplicada
| Fecha | IDs QA resueltos | APK | Notas |
|---|---|---|---|
| | | | |

---

## 10. Pendientes conocidos

- [ ] **Dominio de correo** verificado en Resend (SPF/DKIM) → remitente `no-reply@<dominio>` y reactivar código en staging.
- [ ] **Credenciales FCM** en EAS para push con la app cerrada (las notificaciones en la app ya funcionan).
- [ ] **Ícono y splash** finales de Petites (hoy son los de Expo).
- [ ] Validar en un **iPhone con iOS 26** el Liquid Glass nativo (no hay simulador iOS en esta Mac).
- [ ] Ejecutar los flujos **Maestro** en un development build.
- [ ] Confirmar supuestos de `docs/DECISIONS.md` y revisión legal; validar catálogo de especies/razas con la normativa dominicana.
- [ ] Proyecto de **producción** en Supabase Cloud cuando se apruebe el MVP.
