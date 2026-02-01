'use client';

/**
 * PredefinedReportsList - Étape 4.2.2
 * Liste des rapports prédéfinis avec description et lien pour les consulter.
 */

import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui';
import { PREDEFINED_REPORT_TYPES } from '@/app/actions/reports/types';
import { ChevronRight, FileBarChart } from 'lucide-react';

export function PredefinedReportsList() {
  return (
    <div className="space-y-3">
      {PREDEFINED_REPORT_TYPES.map((report) => (
        <Link
          key={report.type}
          href={`/dashboard/rapports/predefinis/${report.type}`}
          className="block"
        >
          <Card className="p-4 hover:border-[var(--color-primary,#3B82F6)]/50 hover:bg-white/5 transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="shrink-0 rounded-lg bg-[var(--color-primary,#3B82F6)]/20 p-2">
                <FileBarChart className="h-5 w-5 text-[var(--color-primary,#3B82F6)]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white">{report.label}</h3>
                <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mt-0.5">
                  {report.description}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500 shrink-0 mt-0.5" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
