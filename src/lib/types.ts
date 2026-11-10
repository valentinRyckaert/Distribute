import type { Tables, TablesInsert } from './database.types'

/** A problem report and its solution, as stored in the `Report` table. */
export type Report = Tables<'Report'>

/** A problem category ("base"), e.g. Internet & Wi-Fi, with its icon and short description. */
export type Base = Tables<'Base'>

/** A colleague's comment on a report. */
export type Comment = Tables<'Comment'>

/** A message telling the user something happened on one of their reports. */
export type Notification = Tables<'Notification'>

/** A request to be called back by the support. */
export type CallbackRequest = Tables<'CallbackRequest'>

/** A report with its category, as shown on a card. */
export interface ReportCardData extends Report {
  Base: Base | null
}

/** A report with its category and comments, for the detail screen. */
export interface ReportDetail extends ReportCardData {
  Comment: Comment[]
}

/** A category with the number of reports filed in it. */
export interface CategoryWithCount extends Base {
  reportCount: number
}

/** The fields the user fills in the guided report, plus an optional photo to upload. */
export type NewReport = Pick<
  TablesInsert<'Report'>,
  'REP_libelle' | 'REP_content' | 'BAS_id' | 'REP_since' | 'REP_notify'
> & { photoUri: string | null }

/** When the problem started, as asked in step 2 of the guided report. */
export type Since = 'today' | 'week' | 'longer'

/** The signed-in user as the app needs it. */
export interface CurrentUser {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

/** Figures shown in the support space. */
export interface SupportStats {
  total: number
  unsolved: number
  validated: number
  helped: number
  openCallbacks: number
}
