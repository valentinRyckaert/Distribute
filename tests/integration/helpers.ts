import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/src/lib/database.types'

/** Local stack started with `bun db:start`; the publishable key of a local stack is not a secret. */
export const URL = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321'
export const KEY = process.env.SUPABASE_KEY ?? 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'

/** Seeded accounts (supabase/seed.sql). */
export const USERS = {
  marie: { email: 'test@distribute.local', id: '11111111-1111-1111-1111-111111111111' },
  admin: { email: 'admin@distribute.local', id: '22222222-2222-2222-2222-222222222222' },
} as const

/** A fresh client that keeps its session in memory. */
export function newClient(): SupabaseClient<Database> {
  return createClient<Database>(URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** A client signed in as one of the seeded users. */
export async function signedIn(user: keyof typeof USERS): Promise<SupabaseClient<Database>> {
  const client = newClient()
  const { error } = await client.auth.signInWithPassword({
    email: USERS[user].email,
    password: 'password123',
  })
  if (error) throw new Error(`Is the local Supabase running and seeded? ${error.message}`)
  return client
}
