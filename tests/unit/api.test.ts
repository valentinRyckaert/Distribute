import AsyncStorage from '@react-native-async-storage/async-storage'
import * as api from '@/src/lib/api'
import { supabase } from '@/src/lib/supabase'
import { calls, queueResponse, resetSupabase } from '../mocks/supabase'

const auth = supabase.auth as unknown as Record<string, jest.Mock>
const user = {
  id: 'u1',
  email: 'marie@corp.fr',
  user_metadata: { full_name: 'Marie Durand' },
  app_metadata: {},
}
const report = { REP_id: 7, REP_libelle: 'Wifi', Base: null }

beforeEach(async () => {
  resetSupabase()
  jest.clearAllMocks()
  auth.getUser.mockResolvedValue({ data: { user } })
  await AsyncStorage.clear()
})

/** Returns the recorded builder calls of a given method name. */
const called = (method: string) => calls.filter((call) => call[0] === method)

describe('session and account', () => {
  it('signs in with a trimmed email and throws auth errors', async () => {
    await api.signIn(' marie@corp.fr ', 'pw')
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'marie@corp.fr', password: 'pw' })
    auth.signInWithPassword.mockResolvedValueOnce({ error: new Error('Invalid login credentials') })
    await expect(api.signIn('a', 'b')).rejects.toThrow('Invalid login')
  })

  it('signs out and forgets the offline favorites', async () => {
    await AsyncStorage.setItem('distribute-favorites', '[]')
    await api.signOut()
    expect(auth.signOut).toHaveBeenCalled()
    expect(await AsyncStorage.getItem('distribute-favorites')).toBeNull()
  })

  it('describes the current user, admin role from app_metadata only', async () => {
    expect(await api.getCurrentUser()).toEqual({
      id: 'u1',
      email: 'marie@corp.fr',
      name: 'Marie Durand',
      isAdmin: false,
    })
    auth.getUser.mockResolvedValueOnce({
      data: {
        user: { ...user, user_metadata: { role: 'admin' }, app_metadata: { role: 'admin' } },
      },
    })
    expect(await api.getCurrentUser()).toMatchObject({ name: 'marie', isAdmin: true })
    auth.getUser.mockResolvedValueOnce({ data: { user: null } })
    expect(await api.getCurrentUser()).toBeNull()
  })

  it('resets a password with the emailed code', async () => {
    await api.sendPasswordResetCode(' marie@corp.fr ')
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('marie@corp.fr')
    await api.resetPasswordWithCode('marie@corp.fr', ' 123456 ', 'newpass123')
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      email: 'marie@corp.fr',
      token: '123456',
      type: 'recovery',
    })
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'newpass123' })
  })

  it('changes the password only after checking the current one', async () => {
    auth.signInWithPassword.mockResolvedValueOnce({ error: new Error('Invalid login credentials') })
    await expect(api.changePassword('wrong', 'newpass123')).rejects.toThrow()
    expect(auth.updateUser).not.toHaveBeenCalled()
    await api.changePassword('right', 'newpass123')
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'newpass123' })
    auth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(api.changePassword('a', 'b')).rejects.toThrow('Not signed in')
  })
})

describe('reports', () => {
  it('fetches categories with their report count', async () => {
    queueResponse({
      data: [
        { BAS_id: 1, BAS_libelle: 'Wifi', Report: [{ count: 4 }] },
        { BAS_id: 2, Report: [] },
      ],
    })
    expect(await api.fetchCategories()).toEqual([
      { BAS_id: 1, BAS_libelle: 'Wifi', reportCount: 4 },
      { BAS_id: 2, reportCount: 0 },
    ])
  })

  it('throws PostgREST errors', async () => {
    queueResponse({ error: new Error('permission denied') })
    await expect(api.fetchPopularReports()).rejects.toThrow('permission denied')
  })

  it('searches with the full-text function when there is text, filtered by category', async () => {
    queueResponse({ data: [report] })
    expect(await api.searchReports(' wifi ', 3)).toEqual([report])
    expect(supabase.rpc).toHaveBeenCalledWith('search_reports', { query: 'wifi' })
    expect(called('eq')).toContainEqual(['eq', 'BAS_id', 3])
  })

  it('lists the newest reports without text, duplicates excluded', async () => {
    queueResponse({ data: [] })
    await api.searchReports('', null)
    expect(supabase.rpc).not.toHaveBeenCalled()
    expect(called('is')).toContainEqual(['is', 'REP_duplicate_of', null])
    expect(called('eq')).toHaveLength(0)
  })

  it('looks for similar reports only from 3 characters', async () => {
    expect(await api.fetchSimilarReports('ab')).toEqual([])
    queueResponse({ data: [report] })
    expect(await api.fetchSimilarReports('wifi coupé')).toEqual([report])
  })

  it('fetches a report, falling back to the offline copy of favorites', async () => {
    queueResponse({ data: { ...report, Comment: [] } })
    expect(await api.fetchReport(7)).toMatchObject({ REP_id: 7 })
    await AsyncStorage.setItem('distribute-favorites', JSON.stringify([report]))
    queueResponse({ error: new Error('Network request failed') })
    expect(await api.fetchReport(7)).toEqual({ ...report, Comment: [] })
    queueResponse({ error: new Error('Network request failed') })
    await expect(api.fetchReport(8)).rejects.toThrow('Network')
  })

  it('fetches my reports, or none when signed out', async () => {
    queueResponse({ data: [report] })
    expect(await api.fetchMyReports()).toEqual([report])
    expect(called('eq')).toContainEqual(['eq', 'user_id', 'u1'])
    auth.getUser.mockResolvedValueOnce({ data: { user: null } })
    expect(await api.fetchMyReports()).toEqual([])
  })

  it('creates a report without a photo and returns its id', async () => {
    queueResponse({ data: { REP_id: 12 } })
    const id = await api.createReport({
      REP_libelle: 'Wifi',
      REP_content: 'Coupé',
      BAS_id: 1,
      REP_since: 'today',
      REP_notify: true,
      photoUri: null,
    })
    expect(id).toBe(12)
    expect(called('insert')[0][1]).toEqual({
      REP_libelle: 'Wifi',
      REP_content: 'Coupé',
      BAS_id: 1,
      REP_since: 'today',
      REP_notify: true,
      REP_photo_path: null,
    })
  })

  it('uploads the photo in the user folder before creating the report', async () => {
    global.fetch = jest.fn(async () => ({ arrayBuffer: async () => new ArrayBuffer(2) })) as never
    queueResponse({ data: { REP_id: 13 } })
    await api.createReport({
      REP_libelle: 'x',
      REP_content: 'y',
      BAS_id: null,
      REP_since: null,
      REP_notify: false,
      photoUri: 'file://a.jpg',
    })
    expect(called('insert')[0][1]).toMatchObject({
      REP_photo_path: expect.stringMatching(/^u1\/\d+\.jpg$/),
    })
    auth.getUser.mockResolvedValueOnce({ data: { user: null } })
    await expect(api.uploadPhoto('file://a.jpg')).rejects.toThrow('Not signed in')
  })

  it('returns a signed photo link and throws storage errors', async () => {
    expect(await api.getPhotoUrl('u1/1.jpg')).toBe('https://signed/url')
    ;(supabase.storage.from as jest.Mock).mockReturnValueOnce({
      createSignedUrl: async () => ({ data: null, error: new Error('Object not found') }),
    })
    await expect(api.getPhotoUrl('x')).rejects.toThrow('Object not found')
  })

  it('treats an update or delete that changed no row as refused', async () => {
    queueResponse({ data: null })
    await expect(
      api.updateReport(1, { REP_libelle: 'a', REP_content: 'b', REP_solution: null, BAS_id: null }),
    ).rejects.toThrow('Not found or not allowed')
    queueResponse({ data: { REP_id: 1 } })
    await api.deleteReport(1)
    expect(called('delete')).toHaveLength(1)
  })

  it('proposes a solution, sends feedback, comments', async () => {
    await api.proposeSolution(3, 'Redémarrer')
    expect(supabase.rpc).toHaveBeenCalledWith('propose_solution', {
      report_id: 3,
      solution: 'Redémarrer',
    })
    await api.sendFeedback(3, true)
    expect(called('upsert')[0][1]).toEqual({ REP_id: 3, FB_worked: true })
    await api.addComment(3, '  Merci  ')
    expect(called('insert')[0][1]).toEqual({ REP_id: 3, COM_content: 'Merci' })
  })

  it('reads my previous feedback', async () => {
    queueResponse({ data: { FB_worked: false } }, { data: null })
    expect(await api.fetchMyFeedback(3)).toBe(false)
    expect(await api.fetchMyFeedback(3)).toBeNull()
  })
})

describe('favorites', () => {
  it('fetches favorites and keeps an offline copy', async () => {
    queueResponse({ data: [{ Report: report }, { Report: null }] })
    expect(await api.fetchFavorites()).toEqual([report])
    expect(JSON.parse((await AsyncStorage.getItem('distribute-favorites')) ?? '')).toEqual([report])
    queueResponse({ error: new Error('offline') })
    expect(await api.fetchFavorites()).toEqual([report])
  })

  it('returns no favorite when the offline copy is unreadable', async () => {
    await AsyncStorage.setItem('distribute-favorites', '{broken')
    queueResponse({ error: new Error('offline') })
    expect(await api.fetchFavorites()).toEqual([])
  })

  it('keeps and forgets a report', async () => {
    await api.setFavorite(7, true)
    expect(called('upsert')[0][1]).toEqual({ REP_id: 7 })
    await api.setFavorite(7, false)
    expect(called('delete')).toHaveLength(1)
  })
})

describe('call-back and notifications', () => {
  it('requests a call-back with trimmed values', async () => {
    await api.requestCallback(' 0612 ', ' vite ', null)
    expect(called('insert')[0][1]).toEqual({ CB_phone: '0612', CB_message: 'vite', REP_id: null })
  })

  it('lists, counts and marks notifications', async () => {
    queueResponse({ data: [{ NOT_id: 1 }] }, { count: 2 }, { count: undefined })
    expect(await api.fetchNotifications()).toEqual([{ NOT_id: 1 }])
    expect(await api.countUnreadNotifications()).toBe(2)
    expect(await api.countUnreadNotifications()).toBe(0)
    queueResponse({ error: new Error('nope') })
    await expect(api.countUnreadNotifications()).rejects.toThrow('nope')
    await api.markNotificationsRead()
    expect(called('update')[0][1]).toEqual({ NOT_read: true })
  })
})

describe('support space', () => {
  it('fetches the validation queue, unsolved reports and call-backs', async () => {
    queueResponse({ data: [report] }, { data: [] }, { data: [{ CB_id: 1 }] })
    expect(await api.fetchValidationQueue()).toEqual([report])
    expect(await api.fetchUnsolvedReports()).toEqual([])
    expect(await api.fetchOpenCallbacks()).toEqual([{ CB_id: 1 }])
  })

  it('validates, refuses, marks duplicates and closes call-backs', async () => {
    queueResponse(
      { data: { REP_id: 1 } },
      { data: { REP_id: 1 } },
      { data: { REP_duplicate_of: 2 } },
      { data: { CB_id: 4 } },
    )
    await api.setSolutionValidated(1, true)
    await api.refuseSolution(1)
    await api.markDuplicate(1, 2)
    await api.closeCallback(4)
    expect(called('update').map((call) => call[1])).toEqual([
      { REP_is_solution_validated: true },
      { REP_solution: null, REP_is_solution_validated: false },
      { REP_duplicate_of: 2 },
      { CB_done: true },
    ])
  })

  it('computes the statistics', async () => {
    queueResponse(
      {
        data: [
          { REP_solution: null, REP_is_solution_validated: false, REP_helped_count: 0 },
          { REP_solution: 'x', REP_is_solution_validated: true, REP_helped_count: 3 },
          { REP_solution: 'y', REP_is_solution_validated: false, REP_helped_count: 2 },
        ],
      },
      { data: [{ CB_id: 1 }] },
    )
    expect(await api.fetchStats()).toEqual({
      total: 3,
      unsolved: 1,
      validated: 1,
      helped: 5,
      openCallbacks: 1,
    })
  })

  it('turns supabase error objects into errors, "0 rows" into a refusal', async () => {
    queueResponse({ error: { message: 'boom', code: '42501' } })
    await expect(api.fetchUnsolvedReports()).rejects.toMatchObject({
      message: 'boom',
      code: '42501',
    })
    queueResponse({ error: { message: 'Cannot coerce the result', code: 'PGRST116' } })
    await expect(api.deleteReport(1)).rejects.toThrow('Not found or not allowed')
  })

  it('detects a duplicate mark silently ignored by the database', async () => {
    queueResponse({ data: { REP_duplicate_of: null } })
    await expect(api.markDuplicate(1, 2)).rejects.toThrow('Not found or not allowed')
  })

  it('creates and deletes categories', async () => {
    await api.createCategory(' Visio ', 'videocam-outline', ' Teams ')
    expect(called('insert')[0][1]).toEqual({
      BAS_libelle: 'Visio',
      BAS_icon: 'videocam-outline',
      BAS_description: 'Teams',
    })
    queueResponse({ data: { BAS_id: 9 } })
    await api.deleteCategory(9)
    expect(called('eq')).toContainEqual(['eq', 'BAS_id', 9])
  })
})
