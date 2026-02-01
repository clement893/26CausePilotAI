/**
 * Types partagés pour les composants donators - Étape 1.2.1
 */

export interface DonatorFilters {
  search?: string;
  segment?: string[];
  minTotalDonations?: number;
  maxTotalDonations?: number;
  minDonationCount?: number;
  maxDonationCount?: number;
  lastDonationFrom?: Date;
  lastDonationTo?: Date;
  preferredChannel?: string[];
  interests?: string[];
  consents?: string[];
  /** Filtre rapide : all | vip | active | inactive | new */
  quickFilter?: 'all' | 'vip' | 'active' | 'inactive' | 'new';
}
