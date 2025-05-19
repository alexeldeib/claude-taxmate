import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Service role client for admin tasks
export const supabaseAdmin = config.supabase.url && config.supabase.serviceRoleKey
  ? createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    )
  : null