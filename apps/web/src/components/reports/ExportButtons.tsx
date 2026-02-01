'use client';

/**
 * ExportButtons - Étape 4.2.3
 * Boutons Exporter en PDF et Exporter en CSV.
 */

import { useCallback } from 'react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui';
import type { ReportDataRow } from '@/app/actions/reports/types';
import { FileDown, FileSpreadsheet } from 'lucide-react';

export interface ExportButtonsProps {
  title: string;
  description?: string | null;
  rows: ReportDataRow[];
  summary?: number;
  metricLabel?: string;
}

function formatValue(value: number, metricLabel?: string): string {
  if (metricLabel === 'total_donations' || metricLabel === 'avg_donation') {
    return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(value);
  }
  return new Intl.NumberFormat('fr-CA').format(value);
}

function escapeCsvCell(s: string): string {
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function ExportButtons({
  title,
  description,
  rows,
  summary,
  metricLabel,
}: ExportButtonsProps) {
  const exportPdf = useCallback(() => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const internal = (doc as unknown as { internal?: { pageSize?: { getWidth?(): number } } }).internal;
    const pageWidth = internal?.pageSize?.getWidth?.() ?? 210; // A4 width in mm
    let y = 20;

    doc.setFontSize(18);
    doc.text(title, 14, y);
    y += 10;

    if (description) {
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(description, pageWidth - 28);
      doc.text(lines, 14, y);
      y += lines.length * 5 + 5;
    }

    if (summary != null) {
      doc.setFontSize(11);
      doc.text(`Total : ${formatValue(summary, metricLabel)}`, 14, y);
      y += 10;
    }

    doc.setFontSize(12);
    doc.text('Tableau', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.text('Libellé', 14, y);
    doc.text('Valeur', pageWidth - 14 - 30, y);
    y += 6;

    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;

    for (const row of rows) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(row.label, 14, y);
      doc.text(formatValue(row.value, metricLabel), pageWidth - 14 - 35, y);
      y += 6;
    }

    doc.save(`${title.replace(/[^a-zA-Z0-9-_]/g, '_')}.pdf`);
  }, [title, description, rows, summary, metricLabel]);

  const exportCsv = useCallback(() => {
    const header = 'Libellé,Valeur';
    const body = rows.map((r) => `${escapeCsvCell(r.label)},${escapeCsvCell(formatValue(r.value, metricLabel))}`).join('\r\n');
    const csv = [header, body].join('\r\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9-_]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [title, rows, metricLabel]);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        className="inline-flex items-center gap-2"
        onClick={exportPdf}
        disabled={rows.length === 0}
      >
        <FileDown className="h-4 w-4" />
        Exporter en PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        className="inline-flex items-center gap-2"
        onClick={exportCsv}
        disabled={rows.length === 0}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Exporter en CSV
      </Button>
    </div>
  );
}
