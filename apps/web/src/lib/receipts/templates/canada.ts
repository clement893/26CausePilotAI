/**
 * Template reçu fiscal Canada - Étape 2.2.3
 * Conforme aux exigences CRA pour les dons de bienfaisance.
 */

import type { ReceiptData } from '../types';

export const CANADA_LEGAL = {
  title: 'Official Donation Receipt for Income Tax Purposes',
  subtitle: 'Reçu officiel de don aux fins de l’impôt sur le revenu',
  registration: 'Charitable registration number / Numéro d’enregistrement d’organisme de bienfaisance',
  disclaimer:
    'This receipt is for income tax purposes. No goods or services were provided in exchange for this gift.',
  disclaimerFr:
    'Ce reçu est aux fins d’impôt sur le revenu. Aucun bien ou service n’a été fourni en contrepartie de ce don.',
};

export function getCanadaReceiptNumber(data: ReceiptData): string {
  return `CA-${data.donationId.slice(-8).toUpperCase()}-${data.donatedAt.getFullYear()}`;
}

export function formatCanadaAddress(org: ReceiptData['organization']): string {
  const parts = [org.name, org.address, org.city];
  if (org.province && org.postalCode) parts.push(`${org.province} ${org.postalCode}`);
  else if (org.province) parts.push(org.province);
  else if (org.postalCode) parts.push(org.postalCode);
  if (org.country && org.country !== 'CA') parts.push(org.country);
  return parts.filter(Boolean).join('\n');
}

export function formatCanadaDonorAddress(donator: ReceiptData['donator']): string {
  const name = [donator.firstName, donator.lastName].filter(Boolean).join(' ').trim() || donator.email;
  const parts = [name, donator.address, donator.city];
  if (donator.province && donator.postalCode) parts.push(`${donator.province} ${donator.postalCode}`);
  else if (donator.province) parts.push(donator.province);
  else if (donator.postalCode) parts.push(donator.postalCode);
  if (donator.country && donator.country !== 'CA') parts.push(donator.country);
  parts.push(donator.email);
  return parts.filter(Boolean).join('\n');
}
