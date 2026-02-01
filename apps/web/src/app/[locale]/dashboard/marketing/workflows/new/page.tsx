'use client';

/**
 * Création d'un workflow - redirige vers l'éditeur après création (Étape 3.3.2)
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOrganization } from '@/hooks/useOrganization';
import { createWorkflowAction } from '@/app/actions/workflows/create';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function NewWorkflowPage() {
  const router = useRouter();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();

  useEffect(() => {
    if (!activeOrganization || orgLoading) return;
    let cancelled = false;
    (async () => {
      const res = await createWorkflowAction(activeOrganization.id, 'Nouveau workflow');
      if (cancelled) return;
      if (res.id) router.replace(`/dashboard/marketing/workflows/${res.id}/edit`);
      else router.replace('/dashboard/marketing/workflows');
    })();
    return () => { cancelled = true; };
  }, [activeOrganization?.id, orgLoading, router]);

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary,#3B82F6)] mx-auto mb-4" />
        <p className="text-[var(--text-secondary,#A0A0B0)]">Création du workflow…</p>
      </div>
    </div>
  );
}
