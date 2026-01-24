/**
 * Donor Management Types
 * 
 * TypeScript types for donor management CRM system.
 * These types are shared between frontend and backend.
 */

export interface Address {
  street?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
}

export interface Donor {
  id: string;
  organization_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: Address;
  date_of_birth?: string; // ISO date string
  preferred_language: string;
  tax_id?: string;
  is_active: boolean;
  is_anonymous: boolean;
  opt_in_email: boolean;
  opt_in_sms: boolean;
  opt_in_postal: boolean;
  tags: string[];
  custom_fields: Record<string, any>;
  total_donated: string; // Decimal as string
  first_donation_date?: string; // ISO datetime string
  last_donation_date?: string; // ISO datetime string
  donation_count: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface DonorWithStats extends Donor {
  average_donation?: string; // Decimal as string
  last_donation_amount?: string; // Decimal as string
}

export interface DonorCreate {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: Address;
  date_of_birth?: string;
  preferred_language?: string;
  tax_id?: string;
  is_anonymous?: boolean;
  opt_in_email?: boolean;
  opt_in_sms?: boolean;
  opt_in_postal?: boolean;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface DonorUpdate {
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: Address;
  date_of_birth?: string;
  preferred_language?: string;
  tax_id?: string;
  is_active?: boolean;
  is_anonymous?: boolean;
  opt_in_email?: boolean;
  opt_in_sms?: boolean;
  opt_in_postal?: boolean;
  tags?: string[];
  custom_fields?: Record<string, any>;
}

export interface Donation {
  id: string;
  donor_id: string;
  organization_id: string;
  amount: string; // Decimal as string
  currency: string;
  donation_type: 'one_time' | 'recurring' | 'pledge' | 'in_kind';
  payment_method_id?: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_date?: string; // ISO datetime string
  receipt_number?: string;
  receipt_sent: boolean;
  receipt_sent_date?: string; // ISO datetime string
  campaign_id?: string;
  designation?: string;
  notes?: string;
  is_anonymous: boolean;
  is_tax_deductible: boolean;
  tax_receipt_amount?: string; // Decimal as string
  metadata: Record<string, any>;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface DonationCreate {
  donor_id: string;
  amount: string;
  currency?: string;
  donation_type: 'one_time' | 'recurring' | 'pledge' | 'in_kind';
  payment_method_id?: string;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_date?: string;
  campaign_id?: string;
  designation?: string;
  notes?: string;
  is_anonymous?: boolean;
  is_tax_deductible?: boolean;
  tax_receipt_amount?: string;
  metadata?: Record<string, any>;
}

export interface DonationUpdate {
  amount?: string;
  currency?: string;
  donation_type?: 'one_time' | 'recurring' | 'pledge' | 'in_kind';
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_date?: string;
  campaign_id?: string;
  designation?: string;
  notes?: string;
  is_anonymous?: boolean;
  is_tax_deductible?: boolean;
  tax_receipt_amount?: string;
  metadata?: Record<string, any>;
}

export interface RefundRequest {
  reason?: string;
  amount?: string; // Partial refund amount. If not provided, full refund.
}

export interface PaymentMethod {
  id: string;
  donor_id: string;
  organization_id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'check' | 'cash' | 'other';
  provider?: string;
  last_four?: string;
  expiry_month?: number;
  expiry_year?: number;
  brand?: string;
  is_default: boolean;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodCreate {
  donor_id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer' | 'check' | 'cash' | 'other';
  provider?: string;
  last_four?: string;
  expiry_month?: number;
  expiry_year?: number;
  brand?: string;
  is_default?: boolean;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface DonorNote {
  id: string;
  donor_id: string;
  organization_id: string;
  note: string;
  note_type: 'general' | 'call' | 'meeting' | 'email' | 'other';
  created_by?: number;
  is_private: boolean;
  created_at: string;
}

export interface DonorNoteCreate {
  donor_id: string;
  note: string;
  note_type?: 'general' | 'call' | 'meeting' | 'email' | 'other';
  is_private?: boolean;
}

export interface DonorActivity {
  id: string;
  donor_id: string;
  organization_id: string;
  activity_type: string;
  activity_data: Record<string, any>;
  performed_by?: number;
  created_at: string;
}

export interface DonorList {
  items: Donor[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DonationList {
  items: Donation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DonorHistory {
  donations: Donation[];
  activities: DonorActivity[];
  total_donations: number;
  total_activities: number;
}

export interface DonorStats {
  total_donated: string;
  donation_count: number;
  average_donation: string;
  first_donation_date?: string;
  last_donation_date?: string;
  last_donation_amount?: string;
  largest_donation?: string;
  this_year_total: string;
  this_year_count: number;
  this_month_total: string;
  this_month_count: number;
}

// ============= Donor Tag Types =============

export interface DonorTag {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color?: string; // Hex color
  icon?: string;
  donor_count: number;
  created_at: string;
}

export interface DonorTagCreate {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface DonorTagUpdate {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface DonorTagList {
  items: DonorTag[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============= Donor Segment Types =============

export interface DonorSegment {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  criteria: Record<string, any>;
  is_automatic: boolean;
  color?: string; // Hex color
  donor_count: number;
  created_at: string;
  updated_at: string;
}

export interface DonorSegmentCreate {
  name: string;
  description?: string;
  criteria?: Record<string, any>;
  is_automatic?: boolean;
  color?: string;
}

export interface DonorSegmentUpdate {
  name?: string;
  description?: string;
  criteria?: Record<string, any>;
  is_automatic?: boolean;
  color?: string;
}

export interface DonorSegmentList {
  items: DonorSegment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============= Donor Communication Types =============

export interface DonorCommunication {
  id: string;
  donor_id: string;
  organization_id: string;
  communication_type: 'email' | 'sms' | 'letter' | 'phone' | 'in_person';
  subject?: string;
  content: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  sent_by?: number;
  metadata: Record<string, any>;
  created_at: string;
}

export interface DonorCommunicationCreate {
  communication_type: 'email' | 'sms' | 'letter' | 'phone' | 'in_person';
  subject?: string;
  content: string;
  status?: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
}

export interface DonorCommunicationUpdate {
  status?: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  metadata?: Record<string, any>;
}

export interface DonorCommunicationList {
  items: DonorCommunication[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============= Campaign Types =============

export interface Campaign {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  goal_amount?: string; // Decimal as string
  goal_donors?: number;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  total_raised: string; // Decimal as string
  donor_count: number;
  donation_count: number;
  image_url?: string;
  external_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignCreate {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  goal_amount?: string;
  goal_donors?: number;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  image_url?: string;
  external_url?: string;
}

export interface CampaignUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  goal_amount?: string;
  goal_donors?: number;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  image_url?: string;
  external_url?: string;
}

export interface CampaignList {
  items: Campaign[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CampaignStats {
  total_raised: string;
  donor_count: number;
  donation_count: number;
  progress_percentage: number;
  days_remaining?: number;
  is_active: boolean;
}

// ============= Recurring Donation Types =============

export interface RecurringDonation {
  id: string;
  donor_id: string;
  organization_id: string;
  amount: string; // Decimal as string
  currency: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  payment_method_id: string;
  start_date: string;
  next_payment_date: string;
  end_date?: string;
  status: 'active' | 'paused' | 'cancelled' | 'failed';
  total_payments: number;
  total_amount: string; // Decimal as string
  last_payment_date?: string;
  consecutive_failures: number;
  last_failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface RecurringDonationCreate {
  amount: string;
  currency?: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  payment_method_id: string;
  start_date: string;
  end_date?: string;
}

export interface RecurringDonationUpdate {
  amount?: string;
  currency?: string;
  frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  payment_method_id?: string;
  status?: 'active' | 'paused' | 'cancelled' | 'failed';
  end_date?: string;
}

export interface RecurringDonationList {
  items: RecurringDonation[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
