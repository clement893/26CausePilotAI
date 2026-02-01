/**
 * Types pour les abonnements (dons récurrents) - Étape 2.2.4
 */

export interface DonationSubscription {
  id: string;
  donatorId: string;
  donatorEmail: string;
  donatorName: string;
  formId: string;
  formTitle: string;
  amount: number;
  currency: string;
  frequency: string;
  gateway: string;
  status: string;
  startDate: Date;
  nextPaymentDate: Date;
  endDate: Date | null;
  cancelledAt: Date | null;
  donationCount: number;
}

export const FREQUENCY_LABELS: Record<string, string> = {
  monthly: 'Mensuel',
  quarterly: 'Trimestriel',
  yearly: 'Annuel',
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  PAUSED: 'En pause',
  CANCELLED: 'Annulé',
  EXPIRED: 'Expiré',
};
