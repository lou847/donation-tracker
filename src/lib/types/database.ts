// Donation Request Status
export type DonationRequestStatus = 'new' | 'under_review' | 'approved' | 'denied' | 'fulfilled'

// Requester Category
export type RequesterCategory = 'school' | 'nonprofit' | 'sports_team' | 'community_event' | 'religious' | 'other'

// Donation Type
export type DonationType = 'monetary' | 'gift_card' | 'product' | 'sponsorship' | 'in_kind' | 'other'

// Profile (team member)
export interface Profile {
  id: string
  name: string | null
  email: string | null
  avatar_url: string | null
  role: string
  created_at: string
}

// Requester (organization or person requesting donation)
export interface Requester {
  id: string
  org_name: string
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  category: RequesterCategory
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface RequesterInsert {
  id?: string
  org_name: string
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  category?: RequesterCategory
  address?: string | null
  notes?: string | null
}

// Donation Request
export interface DonationRequest {
  id: string
  requester_id: string
  description: string
  request_date: string
  event_date: string | null
  event_name: string | null
  amount_requested: number | null
  amount_approved: number | null
  donation_type: DonationType
  status: DonationRequestStatus
  reviewed_by: string | null
  reviewed_at: string | null
  fulfilled_at: string | null
  notes: string | null
  internal_notes: string | null
  tax_receipt_sent: boolean
  follow_up_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface DonationRequestInsert {
  id?: string
  requester_id: string
  description: string
  request_date?: string
  event_date?: string | null
  event_name?: string | null
  amount_requested?: number | null
  amount_approved?: number | null
  donation_type?: DonationType
  status?: DonationRequestStatus
  notes?: string | null
  internal_notes?: string | null
  created_by?: string | null
}

// Donation Request Note (activity log)
export interface DonationRequestNote {
  id: string
  donation_request_id: string
  author_id: string | null
  content: string
  created_at: string
}

// Extended types with relations
export interface DonationRequestWithRequester extends DonationRequest {
  requester: Requester
}

export interface RequesterWithStats extends Requester {
  total_requests: number
  total_donated: number
}
