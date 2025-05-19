import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Service role client for admin tasks
export const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey
)