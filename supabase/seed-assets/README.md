# Fotos de ejemplo

Usadas solo en el seed local y en staging. Fuente: [Unsplash](https://unsplash.com/license) (licencia libre de uso, sin atribución obligatoria), recortadas a 4:5 · 900×1125 px · JPEG ~70 %.

| Archivo | Foto Unsplash |
|---|---|
| canela.jpg | photo-1543466835-00a7907e9de1 |
| milo.jpg | photo-1574158622682-e40e69881006 |
| luna.jpg | photo-1583337130417-3346a1be7dee |
| nala.jpg | photo-1596854407944-bf87f6fdd49e |
| coco.jpg | photo-1585110396000-c9ffd4e4b308 |
| kiwi.jpg | photo-1552728089-57bdde30beb3 |
| rocky.jpg | photo-1587300003388-59208cc962cb |

Se suben con `supabase db reset` (local) o `supabase seed buckets --linked` (staging), según `[storage.buckets.animal-photos]` en `config.toml`.
