/**
 * Reçus fiscaux - Étape 2.2.3
 */

export { generateReceipt, generateReceiptPdf, uploadReceiptToS3 } from './generator';
export type { ReceiptData, ReceiptCountry, ReceiptDonator, ReceiptOrganization } from './types';
export * from './templates/canada';
export * from './templates/usa';
export * from './templates/france';
