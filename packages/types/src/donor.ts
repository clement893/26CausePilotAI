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
