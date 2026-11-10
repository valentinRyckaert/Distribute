-- Schema inferred from app/lib/types.ts and the app's queries.
-- shortcut: RLS policies are guessed, replace with `supabase db pull` from the real project when linked.

create table "Base"      ("BAS_id" serial primary key, "BAS_libelle" text not null);
create table "Asset"     ("AS_id"  serial primary key, "AS_name"     text not null);
create table "AssetType" ("AT_id"  serial primary key, "AT_libelle"  text not null);
create table "Tag"       ("TAG_id" serial primary key, "TAG_libelle" text not null);

create table "Report" (
  "REP_id" integer primary key, -- the app computes the next id itself (ReportForm.tsx)
  "REP_created_at" timestamptz not null default now(),
  "REP_libelle" text not null,
  "REP_content" text not null,
  "REP_solution" text,
  "REP_is_solution_validated" boolean not null default false,
  "AS_id"  integer references "Asset"("AS_id")      on delete set null,
  "BAS_id" integer references "Base"("BAS_id")      on delete set null,
  "AT_id"  integer references "AssetType"("AT_id")  on delete set null,
  "user_id" uuid references auth.users(id) on delete set null
);

create table "ReportHasTag" (
  "REP_id" integer references "Report"("REP_id") on delete cascade,
  "TAG_id" integer references "Tag"("TAG_id")    on delete cascade,
  primary key ("REP_id", "TAG_id")
);

alter table "Base"         enable row level security;
alter table "Asset"        enable row level security;
alter table "AssetType"    enable row level security;
alter table "Tag"          enable row level security;
alter table "Report"       enable row level security;
alter table "ReportHasTag" enable row level security;

create policy "read"  on "Base"         for select to authenticated using (true);
create policy "read"  on "Asset"        for select to authenticated using (true);
create policy "read"  on "AssetType"    for select to authenticated using (true);
create policy "read"  on "Tag"          for select to authenticated using (true);
create policy "all"   on "Report"       for all    to authenticated using (true) with check (true);
create policy "all"   on "ReportHasTag" for all    to authenticated using (true) with check (true);
