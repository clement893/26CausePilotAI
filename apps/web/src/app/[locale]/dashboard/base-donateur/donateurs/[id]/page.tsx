'use client';

/**
 * Page profil donateur - Étape 1.2.2
 * Vue détaillée : header, stats, onglets (Vue d'ensemble, Dons, Interactions, Notes, Activité).
 */

import DonorProfileContent from './DonorProfileContent';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function DonorProfilePage() {
  return <DonorProfileContent />;
}
