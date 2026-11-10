-- Local test users (password123): test@distribute.local (classic), admin@distribute.local (admin via app_metadata.role)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'test@distribute.local', crypt('password123', gen_salt('bf')), now(),
  now(), now(), '{"provider":"email","providers":["email"]}', '{}', '', '', '', ''),
 ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated', 'admin@distribute.local', crypt('password123', gen_salt('bf')), now(),
  now(), now(), '{"provider":"email","providers":["email"],"role":"admin"}', '{}', '', '', '', '');

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"test@distribute.local","email_verified":true}',
  'email', now(), now(), now()),
 ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
  '{"sub":"22222222-2222-2222-2222-222222222222","email":"admin@distribute.local","email_verified":true}',
  'email', now(), now(), now());

insert into "Base"      ("BAS_libelle") values ('Réseau'), ('Matériel'), ('Logiciel');
insert into "Asset"     ("AS_name")     values ('PC portable'), ('Imprimante');
insert into "AssetType" ("AT_libelle")  values ('Poste de travail'), ('Périphérique');
insert into "Tag"       ("TAG_libelle") values ('wifi'), ('lenteur'), ('mot de passe');
