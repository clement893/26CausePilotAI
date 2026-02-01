/**
 * Types pour les reçus fiscaux - Étape 2.2.3
 */

export type ReceiptCountry = 'CA' | 'US' | 'FR';

export interface ReceiptDonator {
  email: string;
  firstName: string | null;
  lastName: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string | null;
}

export interface ReceiptOrganization {
  name: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  country: string;
}

export interface ReceiptData {
  receiptNumber: string;
  donationId: string;
  amount: number;
  currency: string;
  donatedAt: Date;
  donator: ReceiptDonator;
  organization: ReceiptOrganization;
  country: ReceiptCountry;
}
