/**
 * Template reçu fiscal France - Étape 2.2.3
 * Conforme aux exigences pour les dons aux associations (réduction d’impôt).
 */

import type { ReceiptData } from '../types';

export const FRANCE_LEGAL = {
  title: 'Reçu aux fins de réduction d’impôt',
  subtitle: 'Don à un organisme d’intérêt général',
  disclaimer:
    'Conformément à l’article 200 du CGI, aucun bien ou service n’a été fourni en contrepartie de ce don. Ce reçu doit être conservé pour justifier de votre réduction d’impôt.',
  rna: 'Référence RNA (Répertoire National des Associations)',
};

export function getFranceReceiptNumber(data: ReceiptData): string {
  return `FR-${data.donationId.slice(-8).toUpperCase()}-${data.donatedAt.getFullYear()}`;
}

export function formatFranceAddress(org: ReceiptData['organization']): string {
  const parts = [org.name, org.address, org.city];
  if (org.postalCode) parts.push(org.postalCode);
  if (org.country && org.country !== 'FR') parts.push(org.country);
  return parts.filter(Boolean).join('\n');
}

export function formatFranceDonorAddress(donator: ReceiptData['donator']): string {
  const name = [donator.firstName, donator.lastName].filter(Boolean).join(' ').trim() || donator.email;
  const parts = [name, donator.address, donator.city];
  if (donator.postalCode) parts.push(donator.postalCode);
  if (donator.country && donator.country !== 'FR') parts.push(donator.country);
  parts.push(donator.email);
  return parts.filter(Boolean).join('\n');
}
