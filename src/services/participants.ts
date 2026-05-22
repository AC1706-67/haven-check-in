import { supabase } from '../lib/supabase'

export interface Participant {
  id: string
  card_number: string
  enrolled_at: string
  is_active: boolean
  on_chain_hash?: string
  wallet_address?: string
}

export interface Demographics {
  gender?: string
  race_ethnicity?: string
  age_range?: string
  housing_status?: string
  veteran_status?: boolean
  preferred_language?: string
}

// Look up participant by card number (returning participant flow)
export async function getParticipantByCard(cardNumber: string): Promise<Participant | null> {
  const { data, error } = await supabase
    .from('hc_participants')
    .select('*')
    .eq('card_number', cardNumber)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data
}

// Get demographics for a participant
export async function getDemographics(participantId: string): Promise<Demographics | null> {
  const { data, error } = await supabase
    .from('hc_demographics')
    .select('*')
    .eq('participant_id', participantId)
    .single()

  if (error || !data) return null
  return data
}

// Enroll new participant
export async function enrollParticipant(
  cardNumber: string,
  demographics: Demographics
): Promise<Participant | null> {
  // Create participant record
  const { data: participant, error: pError } = await supabase
    .from('hc_participants')
    .insert({ card_number: cardNumber })
    .select()
    .single()

  if (pError || !participant) {
    console.error('Error enrolling participant:', pError)
    return null
  }

  // Create demographics record
  const { error: dError } = await supabase
    .from('hc_demographics')
    .insert({ participant_id: participant.id, ...demographics })

  if (dError) {
    console.error('Error saving demographics:', dError)
  }

  return participant
}

// Update demographics (if info changed at return visit)
export async function updateDemographics(
  participantId: string,
  demographics: Partial<Demographics>
): Promise<boolean> {
  const { error } = await supabase
    .from('hc_demographics')
    .update({ ...demographics, updated_at: new Date().toISOString() })
    .eq('participant_id', participantId)

  return !error
}

// Generate next card number (sequential, padded)
export async function generateCardNumber(): Promise<string> {
  const { count } = await supabase
    .from('hc_participants')
    .select('*', { count: 'exact', head: true })

  const next = ((count ?? 0) + 1).toString().padStart(6, '0')
  return `HC-${next}`
}
