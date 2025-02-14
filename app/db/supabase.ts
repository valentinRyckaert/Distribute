import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nmkgytxaznlnjdzyelcd.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY != undefined ? process.env.SUPABASE_KEY :  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ta2d5dHhhem5sbmpkenllbGNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY3MDcxMDEsImV4cCI6MjA1MjI4MzEwMX0.8qCpg6fDOz-H5JN3S0zYhzVGlk-KBLaPG8DtQYagRrg'
console.log(process.env.SUPABASE_KEY)
export const supabase = createClient(supabaseUrl, supabaseKey)
