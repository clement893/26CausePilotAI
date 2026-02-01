'use server';

/**
 * getReportData - Étape 4.2.1
 * Récupère les données pour un rapport (selon config : métrique, dimension, période).
 */

import { prisma } from '@/lib/db';
import type { ReportConfig, ReportDataResult, ReportDataRow } from './types';

export async function getReportData(
  organizationId: string,
  config: ReportConfig
): Promise<ReportDataResult> {
  try {
    const dateFrom = new Date(config.dateFrom);
    const dateTo = new Date(config.dateTo);
    const whereBase = {
      organizationId,
      status: 'completed' as const,
      donatedAt: { gte: dateFrom, lte: dateTo },
    };

    if (config.dimension === 'none') {
      const [sum, count, donatorCount] = await Promise.all([
        prisma.donation.aggregate({
          where: whereBase,
          _sum: { amount: true },
        }),
        prisma.donation.count({ where: whereBase }),
        prisma.donation.findMany({
          where: whereBase,
          select: { donatorId: true },
          distinct: ['donatorId'],
        }),
      ]);
      const total = Number(sum._sum.amount ?? 0);
      const rows: ReportDataRow[] = [];
      switch (config.metric) {
        case 'total_donations':
          rows.push({ label: 'Total', value: total });
          break;
        case 'donor_count':
          rows.push({ label: 'Total', value: donatorCount.length });
          break;
        case 'donation_count':
          rows.push({ label: 'Total', value: count });
          break;
        case 'avg_donation':
          rows.push({ label: 'Total', value: count > 0 ? total / count : 0 });
          break;
        default:
          rows.push({ label: 'Total', value: total });
      }
      return {
        rows,
        summary: rows[0]?.value,
      };
    }

    if (config.dimension === 'month') {
      const donations = await prisma.donation.findMany({
        where: whereBase,
        select: { amount: true, donatedAt: true, donatorId: true },
      });
      const byMonth = new Map<string, { sum: number; count: number; donatorIds: Set<string> }>();
      for (const d of donations) {
        const key = d.donatedAt
          ? new Date(d.donatedAt).toLocaleDateString('fr-CA', { month: 'short', year: 'numeric' })
          : 'Inconnu';
        if (!byMonth.has(key)) {
          byMonth.set(key, { sum: 0, count: 0, donatorIds: new Set() });
        }
        const row = byMonth.get(key)!;
        row.sum += Number(d.amount);
        row.count += 1;
        row.donatorIds.add(d.donatorId);
      }
      const rows: ReportDataRow[] = [];
      for (const [label, data] of byMonth.entries()) {
        let value = 0;
        switch (config.metric) {
          case 'total_donations':
            value = data.sum;
            break;
          case 'donor_count':
            value = data.donatorIds.size;
            break;
          case 'donation_count':
            value = data.count;
            break;
          case 'avg_donation':
            value = data.count > 0 ? data.sum / data.count : 0;
            break;
          default:
            value = data.sum;
        }
        rows.push({ label, value });
      }
      rows.sort((a, b) => {
        const months: Record<string, number> = {};
        let i = 0;
        for (const k of byMonth.keys()) months[k] = i++;
        return (months[a.label] ?? 0) - (months[b.label] ?? 0);
      });
      return {
        rows,
        summary: rows.reduce((s, r) => s + r.value, 0),
      };
    }

    if (config.dimension === 'country') {
      const donations = await prisma.donation.findMany({
        where: whereBase,
        select: { amount: true, donatorId: true, donator: { select: { country: true } } },
      });
      const byCountry = new Map<string, { sum: number; count: number; donatorIds: Set<string> }>();
      for (const d of donations) {
        const key = d.donator?.country ?? 'Non renseigné';
        if (!byCountry.has(key)) {
          byCountry.set(key, { sum: 0, count: 0, donatorIds: new Set() });
        }
        const row = byCountry.get(key)!;
        row.sum += Number(d.amount);
        row.count += 1;
        row.donatorIds.add(d.donatorId);
      }
      const rows: ReportDataRow[] = [];
      for (const [label, data] of byCountry.entries()) {
        let value = 0;
        switch (config.metric) {
          case 'total_donations':
            value = data.sum;
            break;
          case 'donation_count':
            value = data.count;
            break;
          case 'avg_donation':
            value = data.count > 0 ? data.sum / data.count : 0;
            break;
          case 'donor_count':
            value = data.donatorIds.size;
            break;
          default:
            value = data.sum;
        }
        rows.push({ label, value });
      }
      rows.sort((a, b) => b.value - a.value);
      return {
        rows,
        summary: rows.reduce((s, r) => s + r.value, 0),
      };
    }

    if (config.dimension === 'form') {
      const donations = await prisma.donation.findMany({
        where: whereBase,
        select: { amount: true, formId: true, form: { select: { title: true } } },
      });
      const byForm = new Map<string, { sum: number; count: number }>();
      for (const d of donations) {
        const key = d.form?.title ?? (d.formId ?? 'Sans formulaire');
        if (!byForm.has(key)) byForm.set(key, { sum: 0, count: 0 });
        const row = byForm.get(key)!;
        row.sum += Number(d.amount);
        row.count += 1;
      }
      const rows: ReportDataRow[] = [];
      for (const [label, data] of byForm.entries()) {
        let value = 0;
        switch (config.metric) {
          case 'total_donations':
            value = data.sum;
            break;
          case 'donation_count':
            value = data.count;
            break;
          case 'avg_donation':
            value = data.count > 0 ? data.sum / data.count : 0;
            break;
          case 'donor_count':
            value = data.count;
            break;
          default:
            value = data.sum;
        }
        rows.push({ label, value });
      }
      rows.sort((a, b) => b.value - a.value);
      return {
        rows,
        summary: rows.reduce((s, r) => s + r.value, 0),
      };
    }

    return { rows: [] };
  } catch (e) {
    console.error('[getReportData]', e);
    return {
      rows: [],
      error: e instanceof Error ? e.message : 'Erreur lors du chargement des données',
    };
  }
}
