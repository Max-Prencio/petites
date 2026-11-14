# Decisiones, supuestos y pendientes

La documentación deja varias decisiones abiertas. Para poder construir el MVP se tomaron las opciones más conservadoras y **reversibles**. Todas requieren confirmación del equipo.

## Conflictos entre documentos y cómo se resolvieron

| Tema | Documentos | Resolución en el MVP |
|---|---|---|
| Concepto | Spec: marketplace de compra/venta/adopción con chat. Branding Petites: adopción tipo *delivery* (pedido, aprobación, seguimiento, contrato). | Se implementan **ambos**: venta y adopción conviven; las dos usan el flujo Petites de **solicitud → aprobación → seguimiento**. El chat "Preguntar" está disponible siempre (spec) y además se activa al aprobar (branding). |
| Modelo de datos | Instrucciones: `listings` todo en uno, estados `activo/pausado/cerrado`, `buyer_id/seller_id`. Arquitectura/PDF: `animals` + `listings`, `user_roles`, `conversation_participants`, estados detallados. | Se usa el modelo de **arquitectura/PDF**, más completo y alineado con la matriz de permisos. |
| Pestañas | Instrucciones: Explorar · Favoritos · Publicar · Mensajes · Perfil. PDF: Inicio · Explorar · Publicar · Mensajes · Mi perfil. | Se usa la del **PDF**; "Mi lista" (favoritos) se abre desde el corazón en Inicio y desde Mi perfil. |
| Evaluar y calificar | Diagrama de flujo: opcional. Spec e instrucciones: reseñas fuera del MVP. | **No se implementa**. Sí se implementa "Compartir la experiencia" (hoja de compartir nativa). |
| Depósito / tarifa de traslado | Branding: depósito de compromiso o tarifa. Spec: sin pagos. | Se muestra una **tarifa de traslado/aporte informativa**; la app **no procesa pagos**. |
| Ubicación de rutas | `AGENTS.md` de Expo sugiere `src/app/`. Instrucciones exigen `app/` en la raíz. | `app/` en la raíz, configurado con `["expo-router", { "root": "./app" }]`. |

## Supuestos tomados (confirmar)

1. **Moderación posterior**: las publicaciones salen al catálogo de inmediato; el admin oculta o retira lo reportado.
2. **Contacto solo por chat interno**: el teléfono es privado y nunca se muestra en el perfil público.
3. **Ubicación pública** = provincia + ciudad/sector; la dirección exacta es privada y solo se comparte con el cuidador en una solicitud de traslado.
4. **Sin aprobación previa de vendedores/refugios**: cualquier cuenta verificada publica; el tipo (particular, refugio, tienda, veterinaria, criador) es autodeclarado y se muestra como tal.
5. **Documentos veterinarios privados**: solo dueño y admin; se comparten por chat a criterio del dueño.
6. **Mensajes**: no se editan ni borran; el usuario puede bloquear y reportar; el admin puede cerrar una conversación reportada.
7. **Acceso admin a chats**: solo vía reporte sobre esa conversación, y queda auditado.
8. **Categorías iniciales**: Perros, Gatos, Aves, Peces, Conejos, Hámsters, Otros, con razas de ejemplo. **Deben validarse contra la normativa dominicana** antes de producción (no se inventan requisitos legales).
9. **Requiere sesión para usar la app** (como el diagrama de flujo). Las políticas RLS sí permiten lectura anónima del catálogo por si se habilita el modo visitante.
10. Moneda por defecto **RD$**; también US$.
11. Seguimiento post-entrega a **7 y 30 días** (manual de marca) con recordatorio local en el dispositivo.

## Pendientes antes del piloto

- [ ] Confirmar los supuestos anteriores con el equipo.
- [ ] Revisión legal: especies permitidas, comercio de animales, contrato de tenencia, política de privacidad y términos.
- [ ] Crear el proyecto Supabase de producción (región, backups, plan) y configurar SMTP propio.
- [ ] Configurar EAS (`projectId`) para push y los secretos de Vault `push_function_url` / `push_webhook_secret`.
- [ ] Diseño final en Figma (ícono, splash, ilustraciones) — el MVP usa los assets por defecto de Expo.
- [ ] Monitoreo (Sentry, reservado para fase 2).
