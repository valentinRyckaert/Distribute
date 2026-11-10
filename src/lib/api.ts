import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PostgrestSingleResponse } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type {
  CallbackRequest,
  CategoryWithCount,
  CurrentUser,
  NewReport,
  Notification,
  ReportCardData,
  ReportDetail,
  SupportStats,
} from './types'

/** Report columns plus its category, as shown on a card. */
const REPORT_CARD = '*, Base(*)'
const PHOTO_BUCKET = 'report-photos'
const FAVORITES_CACHE = 'distribute-favorites'

/**
 * Turns a Supabase error (a plain object at runtime) into a real Error.
 * "0 rows" on `.single()` means the row does not exist or RLS refused the change.
 */
function toError(error: { message: string; code?: string }): Error {
  if (error.code === 'PGRST116') return new Error('Not found or not allowed')
  return Object.assign(new Error(error.message), error)
}

/**
 * Throws the Supabase error if there is one, otherwise returns the data.
 * @throws {Error} the PostgREST error
 */
function unwrap<T>(response: PostgrestSingleResponse<T>): T {
  if (response.error) throw toError(response.error)
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

/** Throws the Auth or Storage error if there is one. */
function check(result: { error: { message: string } | null }): void {
  if (result.error) throw toError(result.error)
}

// Session and account -----------------------------------------------------------------------

/** Signs in with email and password. */
export async function signIn(email: string, password: string): Promise<void> {
  check(await supabase.auth.signInWithPassword({ email: email.trim(), password }))
}

/** Signs out on this device and forgets the offline copy of the favorites. */
export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(FAVORITES_CACHE)
  check(await supabase.auth.signOut())
}

/** Returns the signed-in user with a display name and the admin flag, or null. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const email = user.email ?? ''
  return {
    id: user.id,
    email,
    name: (user.user_metadata.full_name as string | undefined) ?? email.split('@')[0],
    // app_metadata is only writable by the server; the database enforces the role anyway.
    isAdmin: user.app_metadata.role === 'admin',
  }
}

/** Emails a 6-digit code to reset a forgotten password. */
export async function sendPasswordResetCode(email: string): Promise<void> {
  check(await supabase.auth.resetPasswordForEmail(email.trim()))
}

/** Checks the emailed code, which opens a session, then sets the new password. */
export async function resetPasswordWithCode(
  email: string,
  code: string,
  newPassword: string,
): Promise<void> {
  check(
    await supabase.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: 'recovery' }),
  )
  check(await supabase.auth.updateUser({ password: newPassword }))
}

/** Checks the current password by signing in again, then sets the new one. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not signed in')
  check(await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword }))
  check(await supabase.auth.updateUser({ password: newPassword }))
}

// Reports ----------------------------------------------------------------------------------

/** Fetches the categories with their number of reports. */
export async function fetchCategories(): Promise<CategoryWithCount[]> {
  const rows = unwrap(await supabase.from('Base').select('*, Report(count)').order('BAS_id'))
  return rows.map(({ Report, ...base }) => ({ ...base, reportCount: Report[0]?.count ?? 0 }))
}

/** Fetches the reports that helped the most people. */
export async function fetchPopularReports(limit = 5): Promise<ReportCardData[]> {
  return unwrap(
    await supabase
      .from('Report')
      .select(REPORT_CARD)
      .is('REP_duplicate_of', null)
      .order('REP_helped_count', { ascending: false })
      .order('REP_created_at', { ascending: false })
      .limit(limit),
  )
}

/**
 * Searches reports: full-text and typo-tolerant when `text` is given, newest first otherwise.
 * Duplicates are left out.
 */
export async function searchReports(
  text: string,
  baseId: number | null,
): Promise<ReportCardData[]> {
  const query = text.trim()
    ? supabase.rpc('search_reports', { query: text.trim() }).select(REPORT_CARD)
    : supabase
        .from('Report')
        .select(REPORT_CARD)
        .is('REP_duplicate_of', null)
        .order('REP_created_at', { ascending: false })
        .limit(50)
  return unwrap(await (baseId ? query.eq('BAS_id', baseId) : query))
}

/** Fetches up to 3 existing reports similar to a new problem's title. */
export async function fetchSimilarReports(title: string): Promise<ReportCardData[]> {
  if (title.trim().length < 3) return []
  return unwrap(
    await supabase.rpc('search_reports', { query: title.trim() }).select(REPORT_CARD).limit(3),
  )
}

/** Fetches one report with its category and comments, or null if it does not exist. */
export async function fetchReport(id: number): Promise<ReportDetail | null> {
  try {
    return unwrap(
      await supabase
        .from('Report')
        .select('*, Base(*), Comment(*)')
        .eq('REP_id', id)
        .order('COM_created_at', { referencedTable: 'Comment' })
        .maybeSingle(),
    )
  } catch (error) {
    // Offline: fall back to the copy kept with the favorites.
    const cached = (await readFavoritesCache()).find((report) => report.REP_id === id)
    if (cached) return { ...cached, Comment: [] }
    throw error
  }
}

/** Fetches the reports written by the signed-in user, newest first. */
export async function fetchMyReports(): Promise<ReportCardData[]> {
  const user = await getCurrentUser()
  if (!user) return []
  return unwrap(
    await supabase
      .from('Report')
      .select(REPORT_CARD)
      .eq('user_id', user.id)
      .order('REP_created_at', { ascending: false }),
  )
}

/**
 * Uploads a photo to the user's private folder (the storage policy refuses other folders).
 * @returns the storage path to save on the report
 */
export async function uploadPhoto(uri: string): Promise<string> {
  const user = await getCurrentUser()
  if (!user) throw new Error('Not signed in')
  const body = await (await fetch(uri)).arrayBuffer()
  const path = `${user.id}/${Date.now()}.jpg`
  check(await supabase.storage.from(PHOTO_BUCKET).upload(path, body, { contentType: 'image/jpeg' }))
  return path
}

/** Returns a temporary (1 hour) link to a report photo. */
export async function getPhotoUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 3600)
  if (error) throw toError(error)
  return data.signedUrl
}

/**
 * Creates a report; the author, date and validation are set by the database.
 * @returns the new report id
 */
export async function createReport(report: NewReport): Promise<number> {
  const { photoUri, ...fields } = report
  const REP_photo_path = photoUri ? await uploadPhoto(photoUri) : null
  return unwrapRow(
    await supabase
      .from('Report')
      .insert({ ...fields, REP_photo_path })
      .select('REP_id')
      .single(),
  ).REP_id
}

/** Updates the text, solution or category of a report (author or admin). */
export async function updateReport(
  id: number,
  fields: {
    REP_libelle: string
    REP_content: string
    REP_solution: string | null
    BAS_id: number | null
  },
): Promise<void> {
  // .single() turns "0 rows changed" (refused by RLS) into an error.
  unwrapRow(await supabase.from('Report').update(fields).eq('REP_id', id).select('REP_id').single())
}

/** Deletes a report (author or admin); feedback, comments and favorites follow by cascade. */
export async function deleteReport(id: number): Promise<void> {
  unwrapRow(await supabase.from('Report').delete().eq('REP_id', id).select('REP_id').single())
}

/** Proposes a solution for a report that has none yet. */
export async function proposeSolution(id: number, solution: string): Promise<void> {
  unwrap(await supabase.rpc('propose_solution', { report_id: id, solution }))
}

/** Records whether the solution worked for the user (one answer per person, can change). */
export async function sendFeedback(id: number, worked: boolean): Promise<void> {
  unwrap(await supabase.from('ReportFeedback').upsert({ REP_id: id, FB_worked: worked }))
}

/** Returns the user's previous answer to "did it work?", or null. */
export async function fetchMyFeedback(id: number): Promise<boolean | null> {
  const row = unwrap(
    await supabase.from('ReportFeedback').select('FB_worked').eq('REP_id', id).maybeSingle(),
  )
  return row?.FB_worked ?? null
}

/** Adds a comment to a report. */
export async function addComment(id: number, content: string): Promise<void> {
  unwrap(await supabase.from('Comment').insert({ REP_id: id, COM_content: content.trim() }))
}

// Favorites (with an offline copy) ---------------------------------------------------------

/** Reads the favorites kept on the device for offline reading. */
async function readFavoritesCache(): Promise<ReportCardData[]> {
  try {
    return JSON.parse((await AsyncStorage.getItem(FAVORITES_CACHE)) ?? '[]')
  } catch {
    return []
  }
}

/** Fetches the reports the user kept and refreshes the offline copy; offline, returns the copy. */
export async function fetchFavorites(): Promise<ReportCardData[]> {
  let reports: ReportCardData[]
  try {
    const rows = unwrap(await supabase.from('Favorite').select(`Report(${REPORT_CARD})`))
    reports = rows.flatMap((row) => (row.Report ? [row.Report] : []))
  } catch {
    return readFavoritesCache()
  }
  await AsyncStorage.setItem(FAVORITES_CACHE, JSON.stringify(reports))
  return reports
}

/** Keeps or forgets a report in the user's favorites. */
export async function setFavorite(id: number, keep: boolean): Promise<void> {
  unwrap(
    keep
      ? await supabase.from('Favorite').upsert({ REP_id: id })
      : await supabase.from('Favorite').delete().eq('REP_id', id),
  )
  await fetchFavorites()
}

// Call-back and notifications --------------------------------------------------------------

/** Asks the support to call the user back. */
export async function requestCallback(
  phone: string,
  message: string,
  reportId: number | null,
): Promise<void> {
  unwrap(
    await supabase
      .from('CallbackRequest')
      .insert({ CB_phone: phone.trim(), CB_message: message.trim(), REP_id: reportId }),
  )
}

/** Fetches the user's notifications, newest first. */
export async function fetchNotifications(): Promise<Notification[]> {
  return unwrap(
    await supabase
      .from('Notification')
      .select('*')
      .order('NOT_created_at', { ascending: false })
      .limit(50),
  )
}

/** Counts the user's unread notifications. */
export async function countUnreadNotifications(): Promise<number> {
  const { count, error } = await supabase
    .from('Notification')
    .select('*', { count: 'exact', head: true })
    .eq('NOT_read', false)
  if (error) throw toError(error)
  return count ?? 0
}

/** Marks all the user's notifications as read. */
export async function markNotificationsRead(): Promise<void> {
  unwrap(await supabase.from('Notification').update({ NOT_read: true }).eq('NOT_read', false))
}

// Support space (admin; the database refuses these writes to other users) ------------------

/** Fetches the proposed solutions waiting for validation, oldest first. */
export async function fetchValidationQueue(): Promise<ReportCardData[]> {
  return unwrap(
    await supabase
      .from('Report')
      .select(REPORT_CARD)
      .not('REP_solution', 'is', null)
      .eq('REP_is_solution_validated', false)
      .is('REP_duplicate_of', null)
      .order('REP_created_at'),
  )
}

/** Fetches the reports still waiting for a solution, oldest first. */
export async function fetchUnsolvedReports(): Promise<ReportCardData[]> {
  return unwrap(
    await supabase
      .from('Report')
      .select(REPORT_CARD)
      .is('REP_solution', null)
      .is('REP_duplicate_of', null)
      .order('REP_created_at'),
  )
}

/** Marks a report's solution as validated or not. */
export async function setSolutionValidated(id: number, validated: boolean): Promise<void> {
  unwrapRow(
    await supabase
      .from('Report')
      .update({ REP_is_solution_validated: validated })
      .eq('REP_id', id)
      .select('REP_id')
      .single(),
  )
}

/** Refuses a proposed solution: it is removed so someone can propose another one. */
export async function refuseSolution(id: number): Promise<void> {
  unwrapRow(
    await supabase
      .from('Report')
      .update({ REP_solution: null, REP_is_solution_validated: false })
      .eq('REP_id', id)
      .select('REP_id')
      .single(),
  )
}

/** Marks a report as a duplicate of another one, which hides it from lists and search. */
export async function markDuplicate(id: number, originalId: number): Promise<void> {
  const row = unwrapRow(
    await supabase
      .from('Report')
      .update({ REP_duplicate_of: originalId })
      .eq('REP_id', id)
      .select('REP_duplicate_of')
      .single(),
  )
  // The database silently keeps the old value for non-admins.
  if (row.REP_duplicate_of !== originalId) throw new Error('Not found or not allowed')
}

/** Fetches the call-back requests not handled yet, oldest first. */
export async function fetchOpenCallbacks(): Promise<CallbackRequest[]> {
  return unwrap(
    await supabase.from('CallbackRequest').select('*').eq('CB_done', false).order('CB_created_at'),
  )
}

/** Marks a call-back request as handled. */
export async function closeCallback(id: number): Promise<void> {
  unwrapRow(
    await supabase
      .from('CallbackRequest')
      .update({ CB_done: true })
      .eq('CB_id', id)
      .select('CB_id')
      .single(),
  )
}

/**
 * Counts reports by status, people helped and open call-backs, for the statistics panel.
 * shortcut: loads one small row per report, move to a SQL aggregate past a few thousand reports.
 */
export async function fetchStats(): Promise<SupportStats> {
  const reports = unwrap(
    await supabase
      .from('Report')
      .select('REP_solution, REP_is_solution_validated, REP_helped_count')
      .is('REP_duplicate_of', null),
  )
  const callbacks = unwrap(
    await supabase.from('CallbackRequest').select('CB_id').eq('CB_done', false),
  )
  return {
    total: reports.length,
    unsolved: reports.filter((report) => !report.REP_solution).length,
    validated: reports.filter((report) => report.REP_is_solution_validated).length,
    helped: reports.reduce((sum, report) => sum + report.REP_helped_count, 0),
    openCallbacks: callbacks.length,
  }
}

/** Adds a category. */
export async function createCategory(
  label: string,
  icon: string,
  description: string,
): Promise<void> {
  unwrap(
    await supabase.from('Base').insert({
      BAS_libelle: label.trim(),
      BAS_icon: icon,
      BAS_description: description.trim(),
    }),
  )
}

/** Deletes a category; its reports keep existing without a category. */
export async function deleteCategory(id: number): Promise<void> {
  unwrapRow(await supabase.from('Base').delete().eq('BAS_id', id).select('BAS_id').single())
}
