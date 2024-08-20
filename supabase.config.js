import { createClient } from '@supabase/supabase-js'
export const supabaseUrl = 'https://wlexxndeujwsvmesxetg.supabase.co'
export const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)