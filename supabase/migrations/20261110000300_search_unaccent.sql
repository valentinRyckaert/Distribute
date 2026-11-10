-- People type "ecran" for "écran": search ignores accents on both sides.
create extension if not exists unaccent with schema extensions;

/** Accent-free text; immutable so it can feed a generated column and an index. */
create function public.unaccent_fr(value text) returns text
language sql immutable strict parallel safe set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, value) $$;

drop index report_title_trgm_idx;
alter table "Report" drop column "REP_search";
alter table "Report" add column "REP_search" tsvector generated always as (
  setweight(to_tsvector('french', public.unaccent_fr(coalesce("REP_libelle", ''))), 'A') ||
  setweight(to_tsvector('french', public.unaccent_fr(coalesce("REP_content", ''))), 'B') ||
  setweight(to_tsvector('french', public.unaccent_fr(coalesce("REP_solution", ''))), 'C')
) stored;
create index report_search_idx on "Report" using gin ("REP_search");
create index report_title_trgm_idx on "Report"
  using gin (public.unaccent_fr("REP_libelle") extensions.gin_trgm_ops);

create or replace function public.search_reports(query text) returns setof public."Report"
language sql stable set search_path = ''
as $$
  select r.* from public."Report" r
  where r."REP_duplicate_of" is null
    and (r."REP_search" @@ websearch_to_tsquery('french', public.unaccent_fr(query))
         or extensions.similarity(public.unaccent_fr(r."REP_libelle"), public.unaccent_fr(query)) > 0.25)
  order by ts_rank(r."REP_search", websearch_to_tsquery('french', public.unaccent_fr(query)))
         + extensions.similarity(public.unaccent_fr(r."REP_libelle"), public.unaccent_fr(query)) desc
  limit 50
$$;
