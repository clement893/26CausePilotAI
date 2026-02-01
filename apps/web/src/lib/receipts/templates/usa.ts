/**
 * Template reçu fiscal USA - Étape 2.2.3
 * Conforme aux exigences IRS pour les dons déductibles (501(c)(3)).
 */

import type { ReceiptData } from '../types';

export const USA_LEGAL = {
  title: 'Tax-Deductible Donation Receipt',
  subtitle: 'IRS 501(c)(3) Qualified Organization',
  disclaimer:
    'No goods or services were provided in exchange for this gift. This organization is a qualified 501(c)(3) tax-exempt organization. Please retain this receipt for your records.',
  ein: 'EIN (Employer Identification Number)',
};

export function getUSAReceiptNumber(data: ReceiptData): string {
  return `US-${data.donationId.slice(-8).toUpperCase()}-${data.donatedAt.getFullYear()}`;
}

export function formatUSAAddress(org: ReceiptData['organization']): string {
  const parts = [org.name, org.address, org.city];
  if (org.province) parts.push(org.province);
  if (org.postalCode) parts.push(org.postalCode);
  if (org.country && org.country !== 'US') parts.push(org.country);
  return parts.filter(Boolean).join('\n');
}

export function formatUSADonorAddress(donator: ReceiptData['donator']): string {
  const name = [donator.firstName, donator.lastName].filter(Boolean).join(' ').trim() || donator.email;
  const parts = [name, donator.address, donator.city];
  if (donator.province) parts.push(donator.province);
  if (donator.postalCode) parts.push(donator.postalCode);
  if (donator.country && donator.country !== 'US') parts.push(donator.country);
  parts.push(donator.email);
  return parts.filter(Boolean).join('\n');
}
