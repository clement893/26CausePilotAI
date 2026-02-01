'use client';

/**
 * Form Builder - Édition d'un formulaire de don - Étape 2.1.3
 */

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { FormBuilderWizard } from '@/components/donation-forms';
import { getFormAction } from '@/app/actions/donation-forms/get';
import { DEFAULT_DONATION_FORM_DRAFT } from '@/lib/types/donation-form';
import type { DonationFormDraft } from '@/lib/types/donation-form';
import { ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function EditDonationFormPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [data, setData] = useState<DonationFormDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId || !activeOrganization) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getFormAction(formId, activeOrganization.id);
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
        setData(null);
      } else if (res.form) {
        setData(res.form);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [formId, activeOrganization?.id]);

  if (orgLoading || (formId && loading)) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-8 w-64 animate-pulse rounded bg-white/10" />
          <div className="h-96 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (!activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-[var(--text-secondary,#A0A0B0)]">Aucune organisation active</p>
          <Link href="/dashboard" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
  }

  if (error || (formId && !data)) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
          <p className="text-red-400">{error ?? 'Formulaire introuvable'}</p>
          <Link href="/dashboard/formulaires" className="mt-4 inline-block text-[var(--color-primary,#3B82F6)] hover:underline">
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const initialData = data ?? DEFAULT_DONATION_FORM_DRAFT(activeOrganization.id);

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/formulaires" className="hover:text-white">Formulaires</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">{initialData.title || 'Éditer le formulaire'}</span>
        </nav>
        <h1 className="mb-2 text-2xl font-bold text-white">
          {initialData.title ? `Modifier : ${initialData.title}` : 'Éditer le formulaire'}
        </h1>
        <p className="mb-8 text-sm text-[var(--text-secondary,#A0A0B0)]">
          Modifiez les étapes et enregistrez ou publiez.
        </p>
        <FormBuilderWizard
          initialData={initialData}
          formId={formId}
          onSuccess={() => router.push('/dashboard/formulaires')}
        />
      </div>
    </div>
  );
}
