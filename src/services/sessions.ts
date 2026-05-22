import { supabase } from '../lib/supabase'

export interface Session {
  id: string
  org_id?: string
  agency_rep: string
  session_date: string
  session_time: string
}

// Start a new session (staff logs in at start of shift)
export async function createSession(
  agencyRep: string,
  orgId?: string
): Promise<Session | null> {
  const { data, error } = await supabase
    .from('hc_sessions')
    .insert({ agency_rep: agencyRep, org_id: orgId })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    return null
  }

  return data
}

// Get today's sessions
export async function getTodaySessions(): Promise<Session[]> {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('hc_sessions')
    .select('*')
    .eq('session_date', today)
    .order('created_at', { ascending: false })

  if (error) return []
  return data ?? []
}
