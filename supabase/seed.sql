-- Petites · Datos iniciales (catálogo de referencia + usuarios de prueba solo para desarrollo local).

-- Provincias de República Dominicana
insert into public.provinces (name) values
  ('Distrito Nacional'), ('Azua'), ('Bahoruco'), ('Barahona'), ('Dajabón'), ('Duarte'),
  ('Elías Piña'), ('El Seibo'), ('Espaillat'), ('Hato Mayor'), ('Hermanas Mirabal'),
  ('Independencia'), ('La Altagracia'), ('La Romana'), ('La Vega'), ('María Trinidad Sánchez'),
  ('Monseñor Nouel'), ('Monte Cristi'), ('Monte Plata'), ('Pedernales'), ('Peravia'),
  ('Puerto Plata'), ('Samaná'), ('San Cristóbal'), ('San José de Ocoa'), ('San Juan'),
  ('San Pedro de Macorís'), ('Sánchez Ramírez'), ('Santiago'), ('Santiago Rodríguez'),
  ('Santo Domingo'), ('Valverde')
on conflict do nothing;

-- Categorías iniciales (administrables desde el panel; no codificadas en la app)
insert into public.categories (name, slug, icon, sort_order) values
  ('Perros', 'perros', 'dog', 1),
  ('Gatos', 'gatos', 'cat', 2),
  ('Aves', 'aves', 'bird', 3),
  ('Peces', 'peces', 'fish', 4),
  ('Conejos', 'conejos', 'rabbit', 5),
  ('Hámsters', 'hamsters', 'squirrel', 6),
  ('Otros', 'otros', 'paw-print', 7)
on conflict (slug) do nothing;

insert into public.breeds (category_id, name)
select c.id, b.name
from public.categories c
join (values
  ('perros', 'Mestizo'), ('perros', 'Labrador Retriever'), ('perros', 'Golden Retriever'),
  ('perros', 'Pastor Alemán'), ('perros', 'Poodle'), ('perros', 'Chihuahua'), ('perros', 'Shih Tzu'),
  ('perros', 'Yorkshire Terrier'), ('perros', 'Bulldog Francés'), ('perros', 'Beagle'),
  ('perros', 'Pomerania'), ('perros', 'Husky Siberiano'),
  ('gatos', 'Mestizo'), ('gatos', 'Siamés'), ('gatos', 'Persa'), ('gatos', 'Maine Coon'),
  ('gatos', 'Angora'), ('gatos', 'Bengalí'),
  ('aves', 'Periquito'), ('aves', 'Canario'), ('aves', 'Cacatúa ninfa'), ('aves', 'Agapornis'),
  ('peces', 'Betta'), ('peces', 'Goldfish'), ('peces', 'Guppy'),
  ('conejos', 'Mini Lop'), ('conejos', 'Cabeza de León'), ('conejos', 'Holland Lop'),
  ('hamsters', 'Sirio'), ('hamsters', 'Ruso'), ('hamsters', 'Roborovski'),
  ('otros', 'Cobayo / Cuy'), ('otros', 'Hurón')
) as b(slug, name) on b.slug = c.slug
on conflict do nothing;

-- ─────────────────────────────────────────────────────────────
-- Usuarios de prueba (SOLO local: contraseña "Petites123")
-- ─────────────────────────────────────────────────────────────
do $$
declare
  v_ana uuid := '11111111-1111-1111-1111-111111111111';
  v_refugio uuid := '22222222-2222-2222-2222-222222222222';
  v_admin uuid := '33333333-3333-3333-3333-333333333333';
  v_animal uuid;
  v_dn smallint := (select id from public.provinces where name = 'Distrito Nacional');
  v_stgo smallint := (select id from public.provinces where name = 'Santiago');
  v_perros smallint := (select id from public.categories where slug = 'perros');
  v_gatos smallint := (select id from public.categories where slug = 'gatos');
begin
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change_token_new, email_change
  )
  select '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email,
    extensions.crypt('Petites123', extensions.gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', u.name, 'phone', '+1 809 555 0000'), now(), now(), '', '', '', ''
  from (values
    (v_ana, 'ana@petites.test', 'Ana Martínez'),
    (v_refugio, 'refugio@petites.test', 'Refugio Huellitas RD'),
    (v_admin, 'admin@petites.test', 'Equipo Petites')
  ) as u(id, email, name)
  on conflict (id) do nothing;

  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), u.id, u.id::text,
    jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), 'email', now(), now(), now()
  from auth.users u where u.id in (v_ana, v_refugio, v_admin)
  on conflict do nothing;

  update public.profiles set province_id = v_dn, city = 'Piantini', onboarded_at = now() where id = v_ana;
  update public.profiles set province_id = v_stgo, city = 'Santiago de los Caballeros', partner_type = 'shelter',
    bio = 'Rescatamos, cuidamos y buscamos hogares responsables en el Cibao.', onboarded_at = now()
    where id = v_refugio;
  update public.profiles set province_id = v_dn, city = 'Santo Domingo', onboarded_at = now() where id = v_admin;

  -- La asignación de admin solo ocurre fuera del cliente (aquí o por SQL auditado).
  insert into public.user_roles (user_id, role) values (v_admin, 'admin') on conflict do nothing;

  -- Publicaciones de ejemplo
  insert into public.animals (owner_id, category_id, breed_id, name, age_value, age_unit, sex, size,
    vaccinated, vaccination_complete, dewormed, sterilized, description, personality_tags, good_for_apartment)
  values (v_refugio, v_perros, (select id from public.breeds where name = 'Mestizo' and category_id = v_perros),
    'Canela', 8, 'months', 'female', 'medium', 'yes', 'yes', 'yes', 'yes',
    'Canela es dulce, juguetona y se lleva de maravilla con niños. Lista para su primer hogar.',
    array['Juguetona', 'Cariñosa', 'Sociable'], true)
  returning id into v_animal;
  insert into public.listings (owner_id, animal_id, listing_type, province_id, city, conditions, contract_terms,
    transfer_fee, delivery_window)
  values (v_refugio, v_animal, 'adoption', v_stgo, 'Santiago de los Caballeros',
    'Mayor de edad. Visita o videollamada previa. Compromiso de esterilización y vacunas al día.',
    'Me comprometo a brindarle alimento, atención veterinaria, un espacio seguro y a no venderla ni abandonarla. Si no puedo cuidarla, la devolveré al refugio.',
    1500, 'Lun–Sáb · 10:00 AM – 5:00 PM');

  insert into public.animals (owner_id, category_id, breed_id, name, age_value, age_unit, sex, size,
    vaccinated, vaccination_complete, dewormed, sterilized, description, personality_tags, good_for_apartment)
  values (v_refugio, v_gatos, (select id from public.breeds where name = 'Mestizo' and category_id = v_gatos),
    'Milo', 2, 'years', 'male', 'small', 'yes', 'unknown', 'yes', 'yes',
    'Milo es un atigrado tranquilo e independiente que ama las ventanas soleadas. Ideal para apartamento.',
    array['Tranquilo', 'Independiente'], true)
  returning id into v_animal;
  insert into public.listings (owner_id, animal_id, listing_type, province_id, city, conditions, contract_terms, delivery_window)
  values (v_refugio, v_animal, 'adoption', v_stgo, 'Santiago de los Caballeros',
    'Hogar con ventanas protegidas. Seguimiento a los 7 y 30 días.',
    'Me comprometo a mantenerlo dentro de casa, con ventanas protegidas, y a llevarlo al veterinario al menos una vez al año.',
    'Mar–Dom · 9:00 AM – 4:00 PM');

  insert into public.animals (owner_id, category_id, breed_id, name, age_value, age_unit, sex, size,
    vaccinated, vaccination_complete, dewormed, description, personality_tags, good_for_apartment)
  values (v_ana, v_perros, (select id from public.breeds where name = 'Bulldog Francés'),
    'Luna', 3, 'months', 'female', 'small', 'yes', 'no', 'yes',
    'Luna es una bulldog francés juguetona, con primeras vacunas y desparasitada. Criada en casa con amor.',
    array['Activa', 'Cariñosa'], true)
  returning id into v_animal;
  insert into public.listings (owner_id, animal_id, listing_type, price, currency, province_id, city, conditions,
    contract_terms, allows_delivery, allows_pickup, delivery_window)
  values (v_ana, v_animal, 'sale', 35000, 'DOP', v_dn, 'Piantini',
    'Se entrega con carnet de vacunas y kit de bienvenida.',
    'Me comprometo a completar su esquema de vacunación y brindarle cuidados responsables.',
    false, true, 'Sáb–Dom · 10:00 AM – 2:00 PM');

  -- Más publicaciones de ejemplo para un catálogo con variedad
  insert into public.animals (owner_id, category_id, breed_id, name, age_value, age_unit, sex, size,
    vaccinated, vaccination_complete, dewormed, sterilized, description, personality_tags, good_for_apartment)
  values (v_refugio, v_gatos, (select id from public.breeds where name = 'Mestizo' and category_id = v_gatos),
    'Nala', 1, 'years', 'female', 'small', 'yes', 'yes', 'yes', 'yes',
    'Nala es una gata naranja curiosa y conversadora. Le encantan las cajas y dormir al sol.',
    array['Curiosa', 'Cariñosa'], true)
  returning id into v_animal;
  insert into public.listings (owner_id, animal_id, listing_type, province_id, city, conditions, contract_terms, delivery_window)
  values (v_refugio, v_animal, 'adoption', v_stgo, 'Santiago de los Caballeros',
    'Hogar con ventanas protegidas. Seguimiento a los 7 y 30 días.',
    'Me comprometo a mantenerla dentro de casa, con ventanas protegidas, y a llevarla al veterinario al menos una vez al año.',
    'Mar–Dom · 9:00 AM – 4:00 PM');

  insert into public.animals (owner_id, category_id, name, age_value, age_unit, sex, size,
    vaccinated, dewormed, description, personality_tags, good_for_apartment)
  values (v_refugio, (select id from public.categories where slug = 'conejos'),
    'Coco', 6, 'months', 'male', 'small', 'unknown', 'yes',
    'Coco es un conejo blanco dócil, acostumbrado a que lo carguen. Come heno, verduras y mucho cariño.',
    array['Dócil', 'Tranquilo'], true)
  returning id into v_animal;
  insert into public.listings (owner_id, animal_id, listing_type, province_id, city, conditions, contract_terms, delivery_window)
  values (v_refugio, v_animal, 'adoption', v_stgo, 'Santiago de los Caballeros',
    'Espacio amplio para moverse fuera de la jaula al menos 3 horas al día.',
    'Me comprometo a darle espacio, alimentación adecuada y atención veterinaria cuando la necesite.',
    'Lun–Sáb · 10:00 AM – 5:00 PM');

  insert into public.animals (owner_id, category_id, breed_id, name, age_value, age_unit, sex, size,
    vaccinated, dewormed, description, personality_tags, good_for_apartment)
  values (v_refugio, (select id from public.categories where slug = 'aves'),
    (select id from public.breeds where name = 'Periquito'),
    'Kiwi', 8, 'months', 'male', 'small', 'unknown', 'yes',
    'Kiwi es un periquito verde muy sociable que ya silba algunas melodías. Se entrega con su jaula.',
    array['Sociable', 'Cantor'], true)
  returning id into v_animal;
  insert into public.listings (owner_id, animal_id, listing_type, price, currency, province_id, city, conditions,
    contract_terms, allows_delivery, allows_pickup, delivery_window)
  values (v_refugio, v_animal, 'sale', 2500, 'DOP', v_stgo, 'Santiago de los Caballeros',
    'Incluye jaula, comedero y una bolsa de alimento.',
    'Me comprometo a mantenerlo en un espacio limpio, ventilado y lejos de corrientes de aire.',
    true, true, 'Lun–Sáb · 10:00 AM – 5:00 PM');

  insert into public.animals (owner_id, category_id, breed_id, name, age_value, age_unit, sex, size,
    vaccinated, vaccination_complete, dewormed, sterilized, description, personality_tags, good_for_apartment)
  values (v_refugio, v_perros, (select id from public.breeds where name = 'Mestizo' and category_id = v_perros),
    'Rocky', 3, 'years', 'male', 'large', 'yes', 'yes', 'yes', 'yes',
    'Rocky es alegre, enérgico y ama correr en la playa. Ideal para una familia activa con patio.',
    array['Enérgico', 'Leal', 'Juguetón'], false)
  returning id into v_animal;
  insert into public.listings (owner_id, animal_id, listing_type, province_id, city, conditions, contract_terms,
    transfer_fee, delivery_window)
  values (v_refugio, v_animal, 'adoption', v_stgo, 'Santiago de los Caballeros',
    'Casa con patio. Paseos diarios. Visita previa obligatoria.',
    'Me comprometo a darle ejercicio diario, alimento, atención veterinaria y a no venderlo ni abandonarlo.',
    1500, 'Lun–Sáb · 10:00 AM – 5:00 PM');

  -- Fotos (archivos en supabase/seed-assets/animal-photos/<dueño>/<nombre>.jpg, subidos por `supabase seed buckets`)
  insert into public.animal_images (animal_id, storage_path, sort_order)
  select a.id, a.owner_id || '/' || lower(a.name) || '.jpg', 0
  from public.animals a
  where a.name in ('Canela', 'Milo', 'Luna', 'Nala', 'Coco', 'Kiwi', 'Rocky')
  on conflict do nothing;
end $$;
