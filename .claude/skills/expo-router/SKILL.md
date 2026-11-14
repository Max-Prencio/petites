---
name: expo-router
description: Convenciones de navegación y pantallas de Petites con Expo Router (SDK 58). Úsalo al crear o mover pantallas, layouts o rutas.
---
# Expo Router en Petites (SDK 58)

- Las rutas viven en `app/` en la raíz (configurado con `["expo-router", { "root": "./app" }]`). El código no-ruta va en `src/`.
- Layout raíz `app/_layout.tsx` usa `Stack.Protected` con guardas: sin sesión → `(auth)`, sesión sin onboarding → `onboarding`, sesión completa → app. Registra cada pantalla nueva en el grupo protegido correcto.
- Pestañas en `app/(tabs)/_layout.tsx` con `TabBar` propio (`src/components/TabBar.tsx`, API `emitter` + `navigateToTab`). En SDK 58 solo se muestran las pantallas declaradas.
- Navega con `const router = useRouter()`; evita el `router` global antes del primer render.
- Parámetros: `const { id } = useLocalSearchParams<{ id: string }>()`; usa defaults en vez de `initialParams`.
- `Redirect` se renderiza como componente (los `Screen` ya no aceptan `redirect`).
- Las pantallas usan `headerShown: false` y el `Header` propio de `src/components/ui`.
- Cada pantalla: estados de carga (`LoadingState`), error (`ErrorState`), vacío (`EmptyState`) y confirmación (toast / `ConfirmDialog`).
