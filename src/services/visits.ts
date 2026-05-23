import { supabase } from '../lib/supabase'

export interface VisitData {
  session_id: string
  participant_id: string
  shower?: boolean
  tepap_food?: boolean
  narcan_received?: boolean
  narcan_quantity?: number
  clothing_pickup?: boolean
  mail_pickup?: boolean
  referral_made?: boolean
  referral_notes?: string
  consent_signed?: boolean
  consent_signature_url?: string
  recent_overdose?: boolean
  overdose_date?: string
  overdose_zip?: string
}

// Check if participant already got a shower today (1/day rule)
export async function hasShowerToday(participantId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('hc_visits')
    .select('id')
    .eq('participant_id', participantId)
    .eq('visit_date', today)
    .eq('shower', true)
    .limit(1)

  return (data?.length ?? 0) > 0
}

// Check if participant already checked in today
export async function hasVisitToday(participantId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]

  const { data } = await supabase
    .from('hc_visits')
    .select('id')
    .eq('participant_id', participantId)
    .eq('visit_date', today)
    .limit(1)

  return (data?.length ?? 0) > 0
}

// Record a visit
export async function recordVisit(visitData: VisitData): Promise<boolean> {
  const { error } = await supabase
    .from('hc_visits')
    .insert({
      ...visitData,
      consent_timestamp: visitData.consent_signed
        ? new Date().toISOString()
        : null,
    })

  if (error) {
    console.error('Error recording visit:', error)
    return false
  }

  return true
}

// Get visit history for a participant
export async function getVisitHistory(participantId: string, limit = 10) {
  const { data, error } = await supabase
    .from('hc_visits')
    .select('*')
    .eq('participant_id', participantId)
    .order('visit_date', { ascending: false })
    .limit(limit)

  if (error) return []
  return data ?? []
}

// Get today's visit count (for dashboard)
export async function getTodayVisitCount(): Promise<number> {
  const today = new Date().toISOString().split('T')[0]

  const { count } = await supabase
    .from('hc_visits')
    .select('*', { count: 'exact', head: true })
    .eq('visit_date', today)

  return count ?? 0
}
