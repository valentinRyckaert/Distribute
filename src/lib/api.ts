import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type {
  Base,
  ReferenceData,
  ReportDetail,
  ReportInput,
  ReportWithTags,
  SearchFilters,
} from './types'

/** Report columns plus embedded tags. */
const REPORT_WITH_TAGS = '*, Tag(*)'

/**
 * Throws the Supabase error if there is one, otherwise returns the data.
 * @throws {Error} the PostgREST or Auth error
 */
function unwrap<T>(response: PostgrestSingleResponse<T>): T {
  if (response.error) throw response.error
  return response.data as T
}

/**
 * Like `unwrap`, for queries that must return a row (`.single()` after a write).
 * @throws {Error} when no row came back, e.g. the write was refused by RLS
 */
function unwrapRow<T>(response: PostgrestSingleResponse<T>): NonNullable<T> {
  const data = unwrap(response)
  if (data == null) throw new Error('Not found or not allowed')
  return data
}

/** Fetches the most recent reports, newest first. */
export async function fetchLatestReports(limit = 5): Promise<ReportWithTags[]> {
  return unwrap(
    await supabase
      .from('Report')
      .select(REPORT_WITH_TAGS)
      .order('REP_created_at', { ascending: false })
      .limit(limit),
  )
}

/** Fetches every category. */
export async function fetchBases(): Promise<Base[]> {
  return unwrap(await supabase.from('Base').select('*'))
}

/** Fetches the four lists used by the pickers, in parallel. */
export async function fetchReferenceData(): Promise<ReferenceData> {
  const [bases, assets, assetTypes, tags] = await Promise.all([
    supabase.from('Base').select('*'),
    supabase.from('Asset').select('*'),
    supabase.from('AssetType').select('*'),
    supabase.from('Tag').select('*'),
  ])
  return {
    bases: unwrap(bases),
    assets: unwrap(assets),
    assetTypes: unwrap(assetTypes),
    tags: unwrap(tags),
  }
}

/** Fetches one report with its category, asset, type and tags, or null if it does not exist. */
export async function fetchReport(id: number): Promise<ReportDetail | null> {
  return unwrap(
    await supabase
      .from('Report')
      .select('*, Tag(*), Base(*), Asset(*), AssetType(*)')
      .eq('REP_id', id)
      .maybeSingle(),
  )
}

/** Fetches the reports matching every filter that is set. */
export async function searchReports(filters: SearchFilters): Promise<ReportWithTags[]> {
  let query = supabase.from('Report').select(REPORT_WITH_TAGS)
  if (filters.text) query = query.ilike('REP_libelle', `%${filters.text}%`)
  if (filters.baseId) query = query.eq('BAS_id', filters.baseId)
  if (filters.assetId) query = query.eq('AS_id', filters.assetId)
  if (filters.assetTypeId) query = query.eq('AT_id', filters.assetTypeId)
  if (filters.tagIds.length > 0) {
    const links = unwrap(
      await supabase.from('ReportHasTag').select('REP_id').in('TAG_id', filters.tagIds),
    )
    query = query.in(
      'REP_id',
      links.map((link) => link.REP_id),
    )
  }
  return unwrap(await query)
}

/** Fetches the reports created by a user. */
export async function fetchUserReports(userId: string): Promise<ReportWithTags[]> {
  return unwrap(await supabase.from('Report').select(REPORT_WITH_TAGS).eq('user_id', userId))
}

/**
 * Creates a report, or updates it when `id` is given, then replaces its tags.
 * The author, creation date and validation are set by the database, never sent from here.
 * @returns the report id
 */
export async function saveReport(input: ReportInput, id?: number): Promise<number> {
  const { tagIds, ...fields } = input
  let reportId: number
  if (id) {
    // .single() turns "0 rows changed" (not allowed by RLS) into an error.
    unwrap(await supabase.from('Report').update(fields).eq('REP_id', id).select('REP_id').single())
    reportId = id
  } else {
    reportId = unwrapRow(
      await supabase.from('Report').insert(fields).select('REP_id').single(),
    ).REP_id
  }

  unwrap(await supabase.from('ReportHasTag').delete().eq('REP_id', reportId))
  if (tagIds.length > 0) {
    unwrap(
      await supabase
        .from('ReportHasTag')
        .insert(tagIds.map((TAG_id) => ({ REP_id: reportId, TAG_id }))),
    )
  }
  return reportId
}

/** Id and label columns of each reference table. */
const REFERENCE_COLUMNS = {
  Base: ['BAS_id', 'BAS_libelle'],
  Asset: ['AS_id', 'AS_name'],
  AssetType: ['AT_id', 'AT_libelle'],
  Tag: ['TAG_id', 'TAG_libelle'],
} as const

/** A table holding a list of labels: categories, assets, asset types or tags. */
export type ReferenceTable = keyof typeof REFERENCE_COLUMNS

/**
 * Returns the id of the item with this label (case-insensitive), creating it if needed.
 * @returns the item id
 */
export async function findOrCreateReferenceItem(
  table: ReferenceTable,
  label: string,
): Promise<number> {
  const [idColumn, labelColumn] = REFERENCE_COLUMNS[table]
  const clean = label.trim()
  const escaped = clean.replace(/[\\%_]/g, '\\$&')
  const existing = unwrap(
    await supabase.from(table).select(idColumn).ilike(labelColumn, escaped).maybeSingle(),
  )
  if (existing) return (existing as unknown as Record<string, number>)[idColumn]
  const created = unwrapRow(
    await supabase
      .from(table)
      .insert({ [labelColumn]: clean } as never) // the row matches `table`, TS cannot narrow the union
      .select(idColumn)
      .single(),
  )
  return (created as unknown as Record<string, number>)[idColumn]
}

/** Deletes a report; its tag links are removed by the database cascade. */
export async function deleteReport(id: number): Promise<void> {
  unwrap(await supabase.from('Report').delete().eq('REP_id', id).select('REP_id').single())
}

/** Marks a report's solution as validated or not (admin only). */
export async function setSolutionValidated(id: number, validated: boolean): Promise<void> {
  unwrap(
    await supabase
      .from('Report')
      .update({ REP_is_solution_validated: validated })
      .eq('REP_id', id)
      .select('REP_id')
      .single(),
  )
}

/** Tells whether the signed-in user has the admin role, set server-side in `app_metadata`. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.app_metadata.role === 'admin'
}
