# Petites · Marca aplicada al producto

**Nombre:** Petites (de *petites pattes*, "patitas"). **Eslogan:** *Sus patitas en camino hacia ti*.
**Tono:** cercano, optimista, empático, ágil y transparente; como una amiga que acompaña. Nada clínico ni lastimero.

Todo el copy reutilizable vive en `src/constants/brand.ts`, `src/constants/labels.ts` y `src/constants/requestStatus.ts`.

## Paleta (tokens)

| Token | Hex | Uso |
|---|---|---|
| `primary` | `#F47B35` | CTA principal, precio, estados activos |
| `secondary` | `#243B32` | Adopción, títulos, acciones secundarias |
| `ivory` | `#F8F5EF` | Fondo |
| `surface` | `#FFFFFF` | Tarjetas |
| `ink` | `#252525` | Texto |

## Botones (CTA)

| En vez de | Petites usa | Dónde |
|---|---|---|
| Comprar / Añadir al carrito | **Pedir adopción** / **Solicitar llegada** | Ficha (adopción / venta) |
| Ver producto | **Conocer sus patitas** / Ver perfil | — |
| Confirmar orden | **Confirmar mi hogar** | Último paso de la solicitud |
| Rastrear envío | **Seguir sus patitas** | Banner en Inicio y pantalla de recorrido |
| Guardar en favoritos | **Guardar en mi lista** / **Flechazo** | Corazón en tarjetas y ficha |

## Avisos de seguimiento

| Estado | Mensaje |
|---|---|
| Solicitud enviada | ¡Solicitud recibida! Estamos presentando tu hogar a su cuidador. |
| En revisión | Revisando detalles para asegurar que sean el match perfecto. |
| Aprobada | ¡Luz verde! Prepara su espacio, sus patitas ya tienen destino. |
| Preparando traslado | Preparando sus patitas y sus cosas para salir hacia ti. |
| En camino | ¡En movimiento! Sus patitas van en camino hacia ti. |
| Muy cerca | ¡Asómate! Sus patitas están a pocos minutos de tu puerta. |
| Entregada | ¡Llegó a casa! Hoy comienza su nueva historia juntos. |

Los mismos textos se usan en la línea de tiempo de la app y en las notificaciones que genera la base de datos.

## Mecanismos de confianza del manual → funcionalidad

| Mecanismo | Implementación |
|---|---|
| Derecho de aprobación previa | Ficha de hogar (vivienda, patio, otras mascotas, convivientes, experiencia, compromiso) y botones Aprobar / Pedir videollamada / No aprobar. |
| Protocolo de transporte pet-friendly | Opciones "Traslado pet-friendly" y "Recogida con cita"; avisos explícitos de que no se usa paquetería común; sección en *Bienestar animal y normas*. |
| Depósito o tarifa transparente | Campo `transfer_fee` visible en ficha y resumen; Petites no procesa pagos. |
| Contrato digital | `contract_terms` por publicación; la solicitante lo acepta (firma con un toque) y se guarda una copia en la solicitud. |
| Ventana de horarios | `delivery_window` por publicación + fecha y franja preferidas en la solicitud. |
| Chat post-solicitud | Al aprobar se crea o recupera el chat directo entre las partes. |
| Seguimiento post-entrega | Seguimientos a 7 y 30 días con recordatorio local y respuesta en la app. |
| Educación sin sermones | Micro-consejos en el último paso de la solicitud. |
| Momentos compartibles | "Compartir la experiencia" al completar la entrega y compartir desde la ficha. |
