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
function unwrap<T>({ data, error }: { data: T | null; error: Error | null }): T {
  if (error) throw error
  return data as T
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

/** Computes the next free report id from the highest existing one. */
async function nextReportId(): Promise<number> {
  const last = unwrap(
    await supabase.from('Report').select('REP_id').order('REP_id', { ascending: false }).limit(1),
  )
  return (last[0]?.REP_id ?? 0) + 1
}

/**
 * Creates a report, or updates it when `id` is given, then replaces its tags.
 * @returns the report id
 */
export async function saveReport(input: ReportInput, id?: number): Promise<number> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { tagIds, ...fields } = input
  const row = {
    ...fields,
    REP_created_at: new Date().toISOString(),
    REP_is_solution_validated: false,
    user_id: user?.id,
  }

  const reportId = id ?? (await nextReportId())
  if (id) unwrap(await supabase.from('Report').update(row).eq('REP_id', id))
  else unwrap(await supabase.from('Report').insert({ ...row, REP_id: reportId }))

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

/** Deletes a report; its tag links are removed by the database cascade. */
export async function deleteReport(id: number): Promise<void> {
  unwrap(await supabase.from('Report').delete().eq('REP_id', id))
}

/** Marks a report's solution as validated or not (admin only). */
export async function setSolutionValidated(id: number, validated: boolean): Promise<void> {
  unwrap(
    await supabase.from('Report').update({ REP_is_solution_validated: validated }).eq('REP_id', id),
  )
}

/** Tells whether the signed-in user has the admin role, set server-side in `app_metadata`. */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.app_metadata.role === 'admin'
}
