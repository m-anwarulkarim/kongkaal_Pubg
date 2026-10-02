import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  'https://zojnpcbuxgvmmckdtvar.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_KEY ||
  import.meta.env.SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_Dr4jh7y3uaELXVPGeN1taA_vkIn0UfH'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'))
}
