import { supabase } from '../lib/supabase'

export interface NaloxoneOrg {
  id: string
  org_name: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  address?: string
  is_active: boolean
}

export interface NaloxonePickup {
  id: string
  org_id: string
  pickup_date: string
  units_picked_up: number
  recipient_name?: string
  recipient_org?: string
  notes?: string
  recorded_by?: string
}

// Get all active orgs
export async function getActiveOrgs(): Promise<NaloxoneOrg[]> {
  const { data, error } = await supabase
    .from('hc_naloxone_orgs')
    .select('*')
    .eq('is_active', true)
    .order('org_name')

  if (error) return []
  return data ?? []
}

// Add a new org
export async function addOrg(org: Omit<NaloxoneOrg, 'id' | 'is_active'>): Promise<NaloxoneOrg | null> {
  const { data, error } = await supabase
    .from('hc_naloxone_orgs')
    .insert(org)
    .select()
    .single()

  if (error) {
    console.error('Error adding org:', error)
    return null
  }

  return data
}

// Record a pickup
export async function recordPickup(pickup: Omit<NaloxonePickup, 'id'>, cardNumber?: string): Promise<boolean> {
  // Look up org by card number if provided
  if (cardNumber) {
    const org = await getOrgByCardNumber(cardNumber)
    if (!org) {
      throw new Error('Card not registered. Contact the hub coordinator.')
    }
    pickup = { ...pickup, org_id: org.id }
  }

  const { error: pickupError } = await supabase
    .from('hc_naloxone_pickups')
    .insert(pickup)

  if (pickupError) {
    console.error('Error recording pickup:', pickupError)
    return false
  }

  // Update inventory
  const { data: inv } = await supabase
    .from('hc_naloxone_inventory')
    .select('id, units_on_hand')
    .eq('org_id', pickup.org_id)
    .single()

  if (inv) {
    await supabase
      .from('hc_naloxone_inventory')
      .update({
        units_on_hand: inv.units_on_hand - pickup.units_picked_up,
        last_updated: new Date().toISOString(),
      })
      .eq('id', inv.id)
  }

  return true
}

// Get pickup history for an org
export async function getPickupHistory(orgId: string): Promise<NaloxonePickup[]> {
  const { data, error } = await supabase
    .from('hc_naloxone_pickups')
    .select('*')
    .eq('org_id', orgId)
    .order('pickup_date', { ascending: false })

  if (error) return []
  return data ?? []
}

// Get inventory for an org
export async function getInventory(orgId: string): Promise<number> {
  const { data } = await supabase
    .from('hc_naloxone_inventory')
    .select('units_on_hand')
    .eq('org_id', orgId)
    .single()

  return data?.units_on_hand ?? 0
}

// Set initial inventory for an org
export async function setInventory(
  orgId: string,
  units: number
): Promise<boolean> {
  const { error } = await supabase
    .from('hc_naloxone_inventory')
    .upsert({ org_id: orgId, units_on_hand: units, last_updated: new Date().toISOString() })

  return !error
}

// Look up org by card number
export async function getOrgByCardNumber(cardNumber: string) {
  const { data, error } = await supabase
    .from('hc_naloxone_orgs')
    .select('id, card_number, is_active')
    .eq('card_number', cardNumber)
    .single()
  if (error) return null
  return data
}

// Register a new org card (coordinator use only)
export async function registerNaloxoneCard(cardNumber: string) {
  const { data, error } = await supabase
    .from('hc_naloxone_orgs')
    .insert({ card_number: cardNumber, is_active: true })
    .select('id, card_number')
    .single()
  if (error) throw error
  return data
}
