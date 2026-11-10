import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'
import type { Database } from './database.types'
import { encryptedStorage } from './encryptedStorage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY ?? ''

/** The single Supabase client shared by the whole app. */
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: encryptedStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Refresh the session token only while the app is in the foreground.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh()
  else supabase.auth.stopAutoRefresh()
})
