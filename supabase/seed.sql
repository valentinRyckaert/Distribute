-- Local test users (password123): test@distribute.local (classic), admin@distribute.local (admin via app_metadata.role)
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change)
values ('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated', 'test@distribute.local', crypt('password123', gen_salt('bf')), now(),
  now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Marie Durand"}', '', '', '', ''),
 ('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
  'authenticated', 'authenticated', 'admin@distribute.local', crypt('password123', gen_salt('bf')), now(),
  now(), now(), '{"provider":"email","providers":["email"],"role":"admin"}', '{"full_name":"Julien Support"}', '', '', '', '');

insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111',
  '{"sub":"11111111-1111-1111-1111-111111111111","email":"test@distribute.local","email_verified":true}',
  'email', now(), now(), now()),
 ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222',
  '{"sub":"22222222-2222-2222-2222-222222222222","email":"admin@distribute.local","email_verified":true}',
  'email', now(), now(), now());

insert into "Base" ("BAS_libelle", "BAS_icon", "BAS_description") values
  ('Internet & Wi-Fi', 'wifi-outline', 'Réseau, connexion'),
  ('Imprimante', 'print-outline', 'Impression, scan'),
  ('Ordinateur', 'desktop-outline', 'Lent, bloqué, écran'),
  ('Mot de passe', 'key-outline', 'Compte, accès'),
  ('E-mails', 'mail-outline', 'Messagerie, agenda'),
  ('Logiciels', 'apps-outline', 'Programmes, applis');
insert into "Asset"     ("AS_name")     values ('PC portable'), ('Imprimante');
insert into "AssetType" ("AT_libelle")  values ('Poste de travail'), ('Périphérique');
insert into "Tag"       ("TAG_libelle") values ('wifi'), ('lenteur'), ('mot de passe');

-- Sample reports: one validated, one with a proposed solution, one still waiting.
insert into "Report" ("REP_libelle", "REP_content", "REP_solution", "REP_is_solution_validated",
  "BAS_id", "AS_id", "AT_id", "user_id", "REP_created_at", "REP_solution_by")
values
 ('Le wifi se coupe toutes les 5 minutes',
  'Depuis ce matin, mon ordinateur perd la connexion wifi régulièrement.',
  E'Cliquez sur l''icône wifi en bas à droite de l''écran.\nChoisissez « Oublier ce réseau ».\nReconnectez-vous en saisissant le mot de passe du wifi.',
  true, 1, 1, 1, '11111111-1111-1111-1111-111111111111', now() - interval '2 days', '22222222-2222-2222-2222-222222222222'),
 ('L''imprimante n''imprime plus',
  'Les documents restent bloqués dans la file d''attente.',
  E'Éteignez l''imprimante pendant 30 secondes.\nRallumez-la et attendez que le voyant soit vert.\nRelancez l''impression.',
  false, 2, 2, 2, '22222222-2222-2222-2222-222222222222', now() - interval '1 day', '22222222-2222-2222-2222-222222222222'),
 ('Mon ordinateur est très lent au démarrage',
  'Il faut plus de 10 minutes avant de pouvoir travailler.',
  null, false, 3, 1, 1, '11111111-1111-1111-1111-111111111111', now() - interval '3 hours', null);

insert into "ReportHasTag" ("REP_id", "TAG_id") values (1, 1), (2, 2), (3, 2);

insert into "ReportFeedback" ("REP_id", "user_id", "FB_worked")
values (1, '22222222-2222-2222-2222-222222222222', true);
