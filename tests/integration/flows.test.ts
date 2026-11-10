/**
 * End-to-end data flows through the app's real API layer (src/lib/api.ts) and the local database:
 * the app's Supabase client is replaced by a Node client signed in as the current test user.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import * as api from '@/src/lib/api'
import type { Database } from '@/src/lib/database.types'
import { signedIn } from './helpers'

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
)

const current: { client?: SupabaseClient<Database> } = {}
jest.mock('@/src/lib/supabase', () => ({
  get supabase() {
    return current.client
  },
}))

let marie: SupabaseClient<Database>
let admin: SupabaseClient<Database>
const as = (client: SupabaseClient<Database>) => (current.client = client)
const unique = `Écran noir ${Date.now()}`
let reportId: number

beforeAll(async () => {
  marie = await signedIn('marie')
  admin = await signedIn('admin')
})

afterAll(async () => {
  as(admin)
  if (reportId) await api.deleteReport(reportId)
})

it('identifies users and their role', async () => {
  as(marie)
  expect(await api.getCurrentUser()).toMatchObject({ name: 'Marie Durand', isAdmin: false })
  as(admin)
  expect(await api.getCurrentUser()).toMatchObject({ isAdmin: true })
})

it('creates a report that shows up in categories, search and my reports', async () => {
  as(marie)
  reportId = await api.createReport({
    REP_libelle: unique,
    REP_content: 'L’écran reste noir au démarrage',
    BAS_id: 3,
    REP_since: 'today',
    REP_notify: true,
    photoUri: null,
  })
  expect((await api.fetchCategories()).find((c) => c.BAS_id === 3)?.reportCount).toBeGreaterThan(0)
  expect((await api.searchReports('ecran noir demarrage', 3)).map((r) => r.REP_id)).toContain(
    reportId,
  )
  expect((await api.searchReports('', 3)).map((r) => r.REP_id)).toContain(reportId)
  expect((await api.fetchMyReports()).map((r) => r.REP_id)).toContain(reportId)
  expect((await api.fetchSimilarReports('écran noir')).length).toBeGreaterThan(0)
})

it('tolerates typos in the search', async () => {
  as(marie)
  const found = await api.searchReports('imprimente', null)
  expect(found.map((r) => r.REP_libelle)).toContain("L'imprimante n'imprime plus")
})

it('lets a colleague propose a solution, notifies the author, then support validates it', async () => {
  as(admin)
  await api.proposeSolution(reportId, 'Débranchez l’écran\nRebranchez-le')
  await expect(api.proposeSolution(reportId, 'Autre')).rejects.toThrow(/already has a solution/)

  as(marie)
  const unread = await api.countUnreadNotifications()
  expect(unread).toBeGreaterThan(0)
  expect((await api.fetchNotifications())[0].NOT_message).toContain(unique)
  await api.markNotificationsRead()
  expect(await api.countUnreadNotifications()).toBe(0)

  as(admin)
  expect((await api.fetchValidationQueue()).map((r) => r.REP_id)).toContain(reportId)
  await api.setSolutionValidated(reportId, true)
  expect((await api.fetchReport(reportId))?.REP_is_solution_validated).toBe(true)

  as(marie)
  expect(await api.countUnreadNotifications()).toBe(1)
})

it('counts people helped and keeps one answer per person', async () => {
  as(admin)
  await api.sendFeedback(reportId, true)
  await api.sendFeedback(reportId, true)
  expect(await api.fetchMyFeedback(reportId)).toBe(true)
  expect((await api.fetchReport(reportId))?.REP_helped_count).toBe(1)
  await api.sendFeedback(reportId, false)
  expect((await api.fetchReport(reportId))?.REP_helped_count).toBe(0)
})

it('adds comments and notifies the author', async () => {
  as(admin)
  await api.addComment(reportId, 'Ça a marché pour moi aussi')
  const report = await api.fetchReport(reportId)
  expect(report?.Comment.map((c) => c.COM_content)).toContain('Ça a marché pour moi aussi')
  as(marie)
  expect((await api.fetchNotifications())[0].NOT_message).toMatch(/commentaire/)
})

it('keeps favorites and reads them back', async () => {
  as(marie)
  await api.setFavorite(reportId, true)
  expect((await api.fetchFavorites()).map((r) => r.REP_id)).toContain(reportId)
  await api.setFavorite(reportId, false)
  expect((await api.fetchFavorites()).map((r) => r.REP_id)).not.toContain(reportId)
})

it('handles call-backs and statistics in the support space', async () => {
  as(marie)
  await api.requestCallback('06 12 34 56 78', 'Écran noir', reportId)
  as(admin)
  const open = await api.fetchOpenCallbacks()
  const mine = open.find((cb) => cb.REP_id === reportId)
  expect(mine?.CB_phone).toBe('06 12 34 56 78')
  const stats = await api.fetchStats()
  expect(stats.total).toBeGreaterThan(0)
  expect(stats.openCallbacks).toBeGreaterThan(0)
  await api.closeCallback(mine!.CB_id)
  expect((await api.fetchOpenCallbacks()).find((cb) => cb.CB_id === mine!.CB_id)).toBeUndefined()
})

it('marks duplicates, which hides them from lists', async () => {
  as(marie)
  const duplicate = await api.createReport({
    REP_libelle: `${unique} bis`,
    REP_content: 'Pareil',
    BAS_id: 3,
    REP_since: null,
    REP_notify: false,
    photoUri: null,
  })
  await expect(api.markDuplicate(duplicate, reportId)).rejects.toThrow()
  as(admin)
  await api.markDuplicate(duplicate, reportId)
  expect((await api.searchReports(unique, null)).map((r) => r.REP_id)).not.toContain(duplicate)
  await api.deleteReport(duplicate)
})

it('lets admins manage categories, not regular users', async () => {
  as(admin)
  const label = `Visio ${Date.now()}`
  await api.createCategory(label, 'videocam-outline', 'Teams, Zoom')
  const created = (await api.fetchCategories()).find((c) => c.BAS_libelle === label)!
  as(marie)
  await expect(api.deleteCategory(created.BAS_id)).rejects.toThrow('Not found or not allowed')
  as(admin)
  await api.deleteCategory(created.BAS_id)
})

it("refuses to change someone else's report", async () => {
  as(marie)
  await expect(
    api.updateReport(2, {
      REP_libelle: 'Piraté',
      REP_content: 'x',
      REP_solution: null,
      BAS_id: null,
    }),
  ).rejects.toThrow('Not found or not allowed')
})
