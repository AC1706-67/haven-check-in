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
export async function recordPickup(pickup: Omit<NaloxonePickup, 'id'>): Promise<boolean> {
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
