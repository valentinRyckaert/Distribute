/** Row Level Security and database rules, checked with raw clients as each kind of user. */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/src/lib/database.types'
import { newClient, signedIn, USERS } from './helpers'

let marie: SupabaseClient<Database>
let admin: SupabaseClient<Database>
let adminReportId: number

beforeAll(async () => {
  marie = await signedIn('marie')
  admin = await signedIn('admin')
  const { data, error } = await admin
    .from('Report')
    .insert({ REP_libelle: 'Rapport de l’admin', REP_content: 'Test' })
    .select('REP_id')
    .single()
  if (error) throw error
  adminReportId = data.REP_id
})

afterAll(async () => {
  await admin.from('Report').delete().eq('REP_id', adminReportId)
})

describe('anonymous visitors', () => {
  it('cannot read any table', async () => {
    for (const table of ['Report', 'Base', 'Comment', 'Notification', 'CallbackRequest'] as const) {
      const { error } = await newClient().from(table).select('*').limit(1)
      expect(error?.code).toBe('42501')
    }
  })

  it('cannot sign up', async () => {
    const { error } = await newClient().auth.signUp({
      email: 'intrus@x.fr',
      password: 'password123',
    })
    expect(error?.message).toMatch(/signups not allowed/i)
  })
})

describe('reports', () => {
  it('forces the author and the creation date on insert', async () => {
    const { data } = await marie
      .from('Report')
      .insert({
        REP_libelle: 'Usurpation',
        REP_content: 'x',
        user_id: USERS.admin.id,
        REP_created_at: '2000-01-01T00:00:00Z',
        REP_is_solution_validated: true,
        REP_helped_count: 999,
      })
      .select()
      .single()
    expect(data).toMatchObject({
      user_id: USERS.marie.id,
      REP_is_solution_validated: false,
      REP_helped_count: 0,
    })
    expect(new Date(data!.REP_created_at).getFullYear()).toBeGreaterThan(2000)
    await marie.from('Report').delete().eq('REP_id', data!.REP_id)
  })

  it("cannot edit or delete someone else's report", async () => {
    const update = await marie
      .from('Report')
      .update({ REP_libelle: 'Piraté' })
      .eq('REP_id', adminReportId)
      .select()
    expect(update.data).toEqual([])
    const removal = await marie.from('Report').delete().eq('REP_id', adminReportId).select()
    expect(removal.data).toEqual([])
  })

  it('cannot validate a solution or mark a duplicate, only admins can', async () => {
    const { data: own } = await marie
      .from('Report')
      .insert({ REP_libelle: 'Le mien', REP_content: 'x', REP_solution: 'Redémarrer' })
      .select('REP_id')
      .single()
    const attempt = await marie
      .from('Report')
      .update({ REP_is_solution_validated: true, REP_duplicate_of: adminReportId })
      .eq('REP_id', own!.REP_id)
      .select('REP_is_solution_validated, REP_duplicate_of')
      .single()
    expect(attempt.data).toEqual({ REP_is_solution_validated: false, REP_duplicate_of: null })

    const validated = await admin
      .from('Report')
      .update({ REP_is_solution_validated: true })
      .eq('REP_id', own!.REP_id)
      .select('REP_is_solution_validated')
      .single()
    expect(validated.data?.REP_is_solution_validated).toBe(true)

    // Editing a validated solution drops the validation.
    const edited = await marie
      .from('Report')
      .update({ REP_solution: 'Autre chose' })
      .eq('REP_id', own!.REP_id)
      .select('REP_is_solution_validated')
      .single()
    expect(edited.data?.REP_is_solution_validated).toBe(false)
    await marie.from('Report').delete().eq('REP_id', own!.REP_id)
  })

  it('refuses invalid content', async () => {
    const { error } = await marie.from('Report').insert({ REP_libelle: 'ab', REP_content: 'x' })
    expect(error?.code).toBe('23514')
  })

  it("cannot tag someone else's report", async () => {
    const { error } = await marie.from('ReportHasTag').insert({ REP_id: adminReportId, TAG_id: 1 })
    expect(error?.code).toBe('42501')
  })
})

describe('private data', () => {
  it('notifications cannot be created or read for others', async () => {
    const insert = await marie
      .from('Notification')
      .insert({ user_id: USERS.marie.id, NOT_message: 'faux' })
    expect(insert.error?.code).toBe('42501')
    const { data } = await marie.from('Notification').select('user_id')
    expect(data?.every((row) => row.user_id === USERS.marie.id)).toBe(true)
  })

  it('call-back requests are visible to their author and admins only', async () => {
    const { data } = await marie
      .from('CallbackRequest')
      .insert({ CB_phone: '0612345678' })
      .select('CB_id')
      .single()
    const seenByAdmin = await admin.from('CallbackRequest').select('CB_id').eq('CB_id', data!.CB_id)
    expect(seenByAdmin.data).toHaveLength(1)
    const closeAttempt = await marie
      .from('CallbackRequest')
      .update({ CB_done: true })
      .eq('CB_id', data!.CB_id)
      .select()
    expect(closeAttempt.data).toEqual([])
    const badPhone = await marie.from('CallbackRequest').insert({ CB_phone: 'appelez-moi' })
    expect(badPhone.error?.code).toBe('23514')
  })

  it('favorites and feedback stay private', async () => {
    await admin.from('Favorite').upsert({ REP_id: adminReportId })
    const { data } = await marie.from('Favorite').select('*').eq('REP_id', adminReportId)
    expect(data).toEqual([])
    await admin.from('Favorite').delete().eq('REP_id', adminReportId)
  })

  it('internal functions are not callable through the API', async () => {
    const { error } = await marie.rpc('count_helped' as never)
    expect(error).not.toBeNull()
  })
})

describe('reference data and storage', () => {
  it('only admins delete categories', async () => {
    const attempt = await marie.from('Base').delete().eq('BAS_id', 1).select()
    expect(attempt.data).toEqual([])
  })

  it("photos can only be uploaded in one's own folder", async () => {
    const elsewhere = await marie.storage
      .from('report-photos')
      .upload(`${USERS.admin.id}/x.jpg`, new Uint8Array([1]), { contentType: 'image/jpeg' })
    expect(elsewhere.error).not.toBeNull()
    const own = await marie.storage
      .from('report-photos')
      .upload(`${USERS.marie.id}/test-${Date.now()}.jpg`, new Uint8Array([1]), {
        contentType: 'image/jpeg',
      })
    expect(own.error).toBeNull()
    await marie.storage.from('report-photos').remove([own.data!.path])
    const notImage = await marie.storage
      .from('report-photos')
      .upload(`${USERS.marie.id}/x.html`, new Uint8Array([1]), { contentType: 'text/html' })
    expect(notImage.error).not.toBeNull()
  })
})
