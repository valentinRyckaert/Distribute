import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nmkgytxaznlnjdzyelcd.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY != undefined ? process.env.SUPABASE_KEY :  ''
console.log(process.env.SUPABASE_KEY)
export const supabase = createClient(supabaseUrl, supabaseKey)
