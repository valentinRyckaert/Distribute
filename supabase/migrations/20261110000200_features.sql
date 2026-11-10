-- Features of the redesign: categories with icons, guided report, feedback, comments, favorites,
-- call-back requests, notifications, proposed solutions, duplicates, full-text search, photos.

-- Categories ---------------------------------------------------------------------------------
alter table "Base"
  add column "BAS_icon" text not null default 'help-circle-outline'
    check ("BAS_icon" ~ '^[a-z0-9-]{1,40}$'),
  add column "BAS_description" text not null default ''
    check (char_length("BAS_description") <= 80);

-- Reports ------------------------------------------------------------------------------------
alter table "Report"
  add column "REP_since" text check ("REP_since" in ('today', 'week', 'longer')),
  add column "REP_photo_path" text check (char_length("REP_photo_path") <= 200),
  add column "REP_notify" boolean not null default true,
  add column "REP_solution_by" uuid references auth.users(id) on delete set null,
  add column "REP_duplicate_of" integer references "Report"("REP_id") on delete set null
    check ("REP_duplicate_of" <> "REP_id"),
  add column "REP_helped_count" integer not null default 0,
  add column "REP_search" tsvector generated always as (
    setweight(to_tsvector('french', coalesce("REP_libelle", '')), 'A') ||
    setweight(to_tsvector('french', coalesce("REP_content", '')), 'B') ||
    setweight(to_tsvector('french', coalesce("REP_solution", '')), 'C')
  ) stored;

create index report_search_idx on "Report" using gin ("REP_search");
create extension if not exists pg_trgm with schema extensions;
create index report_title_trgm_idx on "Report" using gin ("REP_libelle" extensions.gin_trgm_ops);

-- The protection trigger now also guards the new columns. Requests from the app run as the
-- "authenticated" role; trusted server code (seed, security definer functions) runs as owner.
create or replace function public.protect_report_columns() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if current_user <> 'authenticated' then return new; end if;
  if tg_op = 'INSERT' then
    new."user_id" := auth.uid();
    new."REP_created_at" := now();
    new."REP_helped_count" := 0;
    new."REP_duplicate_of" := null;
    new."REP_solution_by" := case when new."REP_solution" is not null then auth.uid() end;
    if not public.is_admin() then new."REP_is_solution_validated" := false; end if;
  else
    new."REP_id" := old."REP_id";
    new."user_id" := old."user_id";
    new."REP_created_at" := old."REP_created_at";
    new."REP_helped_count" := old."REP_helped_count";
    if new."REP_solution" is distinct from old."REP_solution" then
      new."REP_solution_by" := case when new."REP_solution" is not null then auth.uid() end;
    else
      new."REP_solution_by" := old."REP_solution_by";
    end if;
    if not public.is_admin() then
      new."REP_duplicate_of" := old."REP_duplicate_of";
      new."REP_is_solution_validated" := old."REP_is_solution_validated"
        and new."REP_solution" is not distinct from old."REP_solution";
    end if;
  end if;
  return new;
end $$;

/** Lets any signed-in user propose a solution for a report that has none yet. */
create function public.propose_solution(report_id integer, solution text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  if char_length(btrim(solution)) not between 1 and 5000 then
    raise exception 'solution must be 1 to 5000 characters';
  end if;
  update public."Report"
     set "REP_solution" = btrim(solution), "REP_solution_by" = auth.uid(),
         "REP_is_solution_validated" = false
   where "REP_id" = report_id and ("REP_solution" is null or btrim("REP_solution") = '');
  if not found then raise exception 'this report already has a solution'; end if;
end $$;
revoke execute on function public.propose_solution from public, anon;
grant execute on function public.propose_solution to authenticated;

/** Full-text search in French, tolerant to typos in the title, best matches first. */
create function public.search_reports(query text) returns setof public."Report"
language sql stable set search_path = ''
as $$
  select r.* from public."Report" r
  where r."REP_duplicate_of" is null
    and (r."REP_search" @@ websearch_to_tsquery('french', query)
         or extensions.similarity(r."REP_libelle", query) > 0.25)
  order by ts_rank(r."REP_search", websearch_to_tsquery('french', query))
         + extensions.similarity(r."REP_libelle", query) desc
  limit 50
$$;
revoke execute on function public.search_reports from public, anon;
grant execute on function public.search_reports to authenticated;

-- "Did it work?" feedback ------------------------------------------------------------------
create table "ReportFeedback" (
  "REP_id" integer references "Report"("REP_id") on delete cascade,
  "user_id" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "FB_worked" boolean not null,
  "FB_created_at" timestamptz not null default now(),
  primary key ("REP_id", "user_id")
);
alter table "ReportFeedback" enable row level security;
create policy "own feedback" on "ReportFeedback" for all to authenticated
  using ("user_id" = auth.uid()) with check ("user_id" = auth.uid());

/** Keeps Report.REP_helped_count equal to the number of "yes, it worked" answers. */
create function public.count_helped() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare rep integer := coalesce(new."REP_id", old."REP_id");
begin
  update public."Report" set "REP_helped_count" =
    (select count(*) from public."ReportFeedback" f where f."REP_id" = rep and f."FB_worked")
  where "REP_id" = rep;
  return null;
end $$;
create trigger count_helped after insert or update or delete on "ReportFeedback"
for each row execute function public.count_helped();

-- Comments ------------------------------------------------------------------------------------
create table "Comment" (
  "COM_id" integer generated by default as identity primary key,
  "REP_id" integer not null references "Report"("REP_id") on delete cascade,
  "user_id" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "COM_content" text not null check (char_length(btrim("COM_content")) between 1 and 2000),
  "COM_created_at" timestamptz not null default now()
);
create index comment_report_idx on "Comment" ("REP_id");
alter table "Comment" enable row level security;
create policy "read" on "Comment" for select to authenticated using (true);
create policy "write own" on "Comment" for insert to authenticated with check ("user_id" = auth.uid());
create policy "delete own or admin" on "Comment" for delete to authenticated
  using ("user_id" = auth.uid() or public.is_admin());

-- Favorites (kept reports, also cached for offline reading) -----------------------------------
create table "Favorite" (
  "REP_id" integer references "Report"("REP_id") on delete cascade,
  "user_id" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  primary key ("REP_id", "user_id")
);
alter table "Favorite" enable row level security;
create policy "own favorites" on "Favorite" for all to authenticated
  using ("user_id" = auth.uid()) with check ("user_id" = auth.uid());

-- Call-back requests ------------------------------------------------------------------------
create table "CallbackRequest" (
  "CB_id" integer generated by default as identity primary key,
  "user_id" uuid not null default auth.uid() references auth.users(id) on delete cascade,
  "REP_id" integer references "Report"("REP_id") on delete set null,
  "CB_phone" text not null check ("CB_phone" ~ '^\+?[0-9 .-]{6,20}$'),
  "CB_message" text not null default '' check (char_length("CB_message") <= 500),
  "CB_done" boolean not null default false,
  "CB_created_at" timestamptz not null default now()
);
alter table "CallbackRequest" enable row level security;
create policy "ask for yourself" on "CallbackRequest" for insert to authenticated
  with check ("user_id" = auth.uid() and not "CB_done");
create policy "see own or admin" on "CallbackRequest" for select to authenticated
  using ("user_id" = auth.uid() or public.is_admin());
create policy "admin closes" on "CallbackRequest" for update to authenticated
  using (public.is_admin());

-- Notifications -----------------------------------------------------------------------------
create table "Notification" (
  "NOT_id" integer generated by default as identity primary key,
  "user_id" uuid not null references auth.users(id) on delete cascade,
  "REP_id" integer references "Report"("REP_id") on delete cascade,
  "NOT_message" text not null,
  "NOT_read" boolean not null default false,
  "NOT_created_at" timestamptz not null default now()
);
create index notification_user_idx on "Notification" ("user_id", "NOT_read");
alter table "Notification" enable row level security;
-- Only triggers create notifications; users read theirs and mark them as read.
create policy "read own" on "Notification" for select to authenticated using ("user_id" = auth.uid());
create policy "mark own" on "Notification" for update to authenticated
  using ("user_id" = auth.uid()) with check ("user_id" = auth.uid());
revoke insert, delete on "Notification" from authenticated;
revoke update on "Notification" from authenticated;
grant update ("NOT_read") on "Notification" to authenticated;

/** Notifies the author when a solution is proposed, and both people when it is validated. */
create function public.notify_report_change() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new."REP_notify" and new."user_id" is not null
     and old."REP_solution" is null and new."REP_solution" is not null
     and new."REP_solution_by" is distinct from new."user_id" then
    insert into public."Notification" ("user_id", "REP_id", "NOT_message")
    values (new."user_id", new."REP_id", 'Une solution a été proposée pour « ' || new."REP_libelle" || ' ».');
  end if;
  if new."REP_is_solution_validated" and not old."REP_is_solution_validated" then
    insert into public."Notification" ("user_id", "REP_id", "NOT_message")
    select distinct u, new."REP_id", 'Le support a validé la solution de « ' || new."REP_libelle" || ' ».'
    from unnest(array[new."user_id", new."REP_solution_by"]) as u where u is not null;
  end if;
  return null;
end $$;
create trigger notify_report_change after update on "Report"
for each row execute function public.notify_report_change();

/** Notifies the author of a report when a colleague comments on it. */
create function public.notify_comment() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public."Notification" ("user_id", "REP_id", "NOT_message")
  select r."user_id", r."REP_id", 'Nouveau commentaire sur « ' || r."REP_libelle" || ' ».'
  from public."Report" r
  where r."REP_id" = new."REP_id" and r."user_id" is not null and r."user_id" <> new."user_id";
  return null;
end $$;
create trigger notify_comment after insert on "Comment"
for each row execute function public.notify_comment();

-- Trigger functions must not be callable through the API.
revoke execute on function public.count_helped, public.notify_report_change, public.notify_comment,
  public.protect_report_columns from public, anon, authenticated;

-- Photos: private bucket, 5 MB images, each user writes in their own folder -----------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('report-photos', 'report-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

create policy "upload own photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'report-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "read photos" on storage.objects for select to authenticated
  using (bucket_id = 'report-photos');
create policy "delete own photos" on storage.objects for delete to authenticated
  using (bucket_id = 'report-photos'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

revoke all on "ReportFeedback", "Comment", "Favorite", "CallbackRequest", "Notification" from anon;
