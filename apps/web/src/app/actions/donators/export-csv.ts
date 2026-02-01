'use server';

/**
 * Action export CSV donateurs - Étape 1.2.1
 * Récupère les donateurs via l'API backend et retourne le CSV.
 */

import { auth } from '@/lib/auth/core';

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

export interface ExportDonatorsCSVParams {
  organizationId: string;
  donatorIds?: string[];
  bearerToken?: string;
}

export async function exportDonatorsCSVAction(
  params: ExportDonatorsCSVParams
): Promise<{ csv?: string; filename?: string; error?: string }> {
  await auth();
  const { organizationId, donatorIds, bearerToken } = params;
  const apiUrl = getApiUrl();
  const limit = donatorIds?.length ? donatorIds.length : 10000;
  const page = 1;
  const url = new URL(`${apiUrl}/api/v1/organizations/${organizationId}/donors`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('page_size', String(limit));
  const res = await fetch(url.toString(), {
    headers: bearerToken ? { Authorization: `Bearer ${bearerToken}` } : {},
    cache: 'no-store',
  });
  if (!res.ok) {
    return { error: 'Erreur lors de la récupération des donateurs' };
  }
  const data = (await res.json()) as {
    items?: Array<{
      id?: string;
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
      total_donated?: string;
      donation_count?: number;
      last_donation_date?: string;
      tags?: string[];
    }>;
  };
  let items = data.items ?? [];
  if (donatorIds?.length) {
    const idSet = new Set(donatorIds);
    items = items.filter((d) => d.id && idSet.has(String(d.id)));
  }
  const headers = [
    'Prénom',
    'Nom',
    'Email',
    'Téléphone',
    'Segment',
    'Total Dons',
    'Nombre de Dons',
    'Dernier Don',
  ];
  const rows = items.map((d) => {
    const segment = d.tags?.includes('vip') ? 'VIP' : d.total_donated ? 'Actif' : '—';
    return [
      d.first_name ?? '',
      d.last_name ?? '',
      d.email ?? '',
      d.phone ?? '',
      segment,
      d.total_donated ?? '0',
      String(d.donation_count ?? 0),
      d.last_donation_date?.split('T')[0] ?? '',
    ].join(',');
  });
  const csv = [headers.join(','), ...rows].join('\n');
  const filename = `donateurs-${new Date().toISOString().split('T')[0]}.csv`;
  return { csv, filename };
}
