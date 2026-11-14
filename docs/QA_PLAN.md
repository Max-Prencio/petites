# Plan de QA · Prueba en paralelo (cliente ↔ vendedor)

Entorno: **staging** (Supabase Cloud `petites-staging` + APK de EAS, perfil `preview`).
Dos dispositivos Android al mismo tiempo; cada caso indica quién actúa: **[C]** cliente (QA) · **[V]** vendedor.

## Preparación

1. Instala el APK desde el enlace/QR de EAS (Ajustes → permitir instalar apps de esta fuente).
2. Cuentas (ya verificadas, contraseña compartida por privado):
   - **[C]** `cliente@petites.test` — Distrito Nacional
   - **[V]** `vendedor@petites.test` — refugio en Santiago
   - `admin@petites.test` — panel de administración (opcional)
   - `nuevo.cliente@petites.test` y `nuevo.vendedor@petites.test` — verificadas pero **sin onboarding**: al entrar muestran la pantalla de bienvenida (caso A6). Después de completarlo ya no vuelve a salir; pide a Claude que las restablezca si hace falta repetirlo.
3. **Registro y recuperación (A1, A3)**: los correos salen por Resend en modo de prueba, así que **solo llegan al correo dueño de la cuenta Resend**. Hasta verificar un dominio en Resend, esos casos los prueba esa persona; el resto usa las cuentas preparadas.

Registra cada fallo con: ID del caso, dispositivo/Android, pasos, resultado esperado vs. obtenido y captura.

## A. Cuenta

| ID | Quién | Pasos | Esperado |
|---|---|---|---|
| A1 | C | Crear cuenta con correo propio → código de 6 dígitos → onboarding | Llega el correo con código; entra a Inicio tras completar perfil |
| A2 | C | Login con contraseña incorrecta | Mensaje claro, sin entrar |
| A3 | C | ¿Olvidaste tu contraseña? con correo propio | Llega código y permite cambiarla |
| A4 | V | Editar perfil (nombre, ciudad, foto) | Se guarda y se ve en el perfil público |
| A5 | C/V | Cerrar sesión y volver a entrar | Vuelve a Bienvenida; la sesión se recupera al reabrir la app |
| A6 | C/V | Entrar con `nuevo.cliente@` / `nuevo.vendedor@` → completar onboarding (provincia, ciudad, tipo de perfil) | Llega a Inicio; al volver a entrar no repite el onboarding |
| B8 | V | Publicar con 3+ fotos tomadas con el teléfono | Se publica sin error de permisos; las fotos cargan rápido (se comprimen antes de subir) |
| B9 | V | Raza: escribir "pastor aleman" (sin tilde) en el buscador de razas | Encuentra "Pastor Alemán"; el catálogo trae 500+ razas de perro |

## B. Publicar (vendedor)

| ID | Quién | Pasos | Esperado |
|---|---|---|---|
| B1 | V | Publicar → **Adopción**: 3 fotos, salud, requisitos, horario, tarifa de traslado, acuerdo | Aparece en Mis publicaciones y en el catálogo |
| B2 | V | Publicar → **Venta** sin precio | No deja continuar (precio obligatorio) |
| B3 | V | Publicar → Venta con precio | Se ve el precio en RD$ |
| B4 | V | Guardar como borrador | No aparece en el catálogo del cliente |
| B5 | V | Editar una publicación (cambiar descripción/foto) | [C] ve el cambio al refrescar |
| B6 | V | Pausar una publicación | Desaparece del catálogo de [C] |
| B7 | V | Subir documento veterinario | Solo lo ve el vendedor (y el adoptante aprobado) |

## C. Catálogo (cliente)

| ID | Quién | Pasos | Esperado |
|---|---|---|---|
| C1 | C | Inicio → tarjetas de "Recién llegados" | Aparecen las publicaciones de [V] |
| C2 | C | Explorar → buscar por nombre o raza | Resultados correctos |
| C3 | C | Filtros combinados (adopción + perro + Santiago + vacunado) → abrir ficha → volver | Los filtros se conservan |
| C4 | C | Ordenar por precio / fecha | Orden correcto |
| C5 | C | Corazón "Guardar en mi lista" → Mi lista | Aparece; al quitarlo desaparece |
| C6 | C+V | [V] cambia estado de una mascota guardada por [C] | [C] recibe aviso en Notificaciones |
| C7 | C | Compartir ficha | Abre el menú de compartir del sistema |

## D. Chat en tiempo real (los dos a la vez)

| ID | Quién | Pasos | Esperado |
|---|---|---|---|
| D1 | C | Ficha → **Preguntar** → enviar mensaje | [V] lo ve sin refrescar, con contador de no leídos |
| D2 | V | Responder | [C] lo recibe en tiempo real |
| D3 | C | Enviar más de 20 mensajes en un minuto | Se bloquea con aviso de límite |
| D4 | V | Menú ⋮ → Bloquear a [C] | [C] ya no puede escribirle |
| D5 | C | Menú ⋮ → Reportar conversación | Confirmación; aparece en el panel admin |

## E. Solicitud Petites (flujo principal)

| ID | Quién | Pasos | Esperado |
|---|---|---|---|
| E1 | C | Ficha de adopción → **Pedir adopción** → 4 pasos → aceptar acuerdo → **Confirmar mi hogar** | "¡Solicitud recibida!…" y línea de tiempo |
| E2 | C | Intentar continuar con campos vacíos | Errores en rojo bajo cada campo |
| E3 | V | Perfil → Solicitudes recibidas → abrir | Ve la ficha del hogar, dirección y acuerdo firmado |
| E4 | V | **Pedir videollamada** | [C] ve "Videollamada propuesta" y se habilita el chat |
| E5 | V | **Aprobar** | [C] ve "¡Luz verde!…" y el banner *Seguir sus patitas* en Inicio |
| E6 | V | Avanzar: Preparando → En camino → Muy cerca → Entregada | [C] ve cada aviso con el texto de marca en la línea de tiempo |
| E7 | C | Tras "Entregada": **Compartir la experiencia** | Abre compartir |
| E8 | C | Seguimiento de 7 días (aparece en Inicio cuando vence) | Puede responderlo |
| E9 | V | En otra solicitud: **No aprobar** | [C] ve "Esta vez no fue posible…" |
| E10 | C | Cancelar una solicitud pendiente | [V] la ve como Cancelada |
| E11 | C | Pedir dos veces la misma mascota | No permite duplicar |
| E12 | C | Venta → **Solicitar llegada** | Mismo flujo, sin hablar de "adopción" |

## F. Seguridad (negativas)

| ID | Quién | Pasos | Esperado |
|---|---|---|---|
| F1 | C | Ver el perfil público de [V] | No muestra teléfono ni dirección |
| F2 | C | Intentar abrir Solicitudes recibidas de [V] (no es suyo) | Lista vacía |
| F3 | C | Reportar una publicación | Confirmación; aparece en admin |
| F4 | admin | Panel → ocultar la publicación reportada | Desaparece para [C]; queda en auditoría |
| F5 | admin | Suspender a [C] | [C] no puede publicar ni escribir |

## G. Calidad general

- Teclado: ningún campo queda tapado al escribir (chat, formularios, modales).
- Estados: cada pantalla muestra carga, vacío y error (prueba en modo avión).
- Textos: tono Petites, sin "comprar" en adopción, sin errores técnicos en inglés.
- Rendimiento: el catálogo con 10+ publicaciones se desplaza fluido.
