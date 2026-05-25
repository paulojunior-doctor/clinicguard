import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://soeyobmsztgnzllvbkdo.supabase.co'
const SUPABASE_KEY = 'sb_publishable_4K8M7lcn1RkbpWmmt5zeyw_BimbvjlZ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
