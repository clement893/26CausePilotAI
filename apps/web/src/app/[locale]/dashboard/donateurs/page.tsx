'use client';

/**
 * Page Base de Données Donateurs - Étape 1.2.1
 * Liste, recherche, filtres, KPIs, table, actions en vrac.
 */

import DonateursContent from './DonateursContent';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function DonateursPage() {
  return <DonateursContent />;
}
