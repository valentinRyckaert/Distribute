import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL != undefined ? process.env.EXPO_PUBLIC_SUPABASE_URL : ''
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY != undefined ? process.env.EXPO_PUBLIC_SUPABASE_KEY : ''
export const supabase = createClient(supabaseUrl, supabaseKey)
