'use client';

/**
 * Page Dashboard Principal - Étape 4.1.1
 * Vue d'ensemble avec grille de widgets personnalisable (KPIs, graphiques, activité récente).
 */

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import DashboardMainContent from './DashboardMainContent';

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardMainContent />
    </ErrorBoundary>
  );
}
