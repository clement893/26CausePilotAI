'use client';

/**
 * Page Création de segment - Étape 3.2.1
 * Nom, description, type (Statique/Dynamique), constructeur de règles, compteur temps réel.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { createSegmentAction } from '@/app/actions/segments/create';
import { evaluateSegmentAction } from '@/app/actions/segments/evaluate';
import { RuleBuilder } from '@/components/segmentation';
import { createEmptyRuleGroup, type SegmentRules } from '@/lib/segmentation/types';
import { ChevronRight, Loader2, Users } from 'lucide-react';

const EVALUATE_DEBOUNCE_MS = 500;

export const dynamic = 'force-dynamic';

export default function NewSegmentPage() {
  const router = useRouter();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'STATIC' | 'DYNAMIC'>('DYNAMIC');
  const [rules, setRules] = useState<SegmentRules>({ group: createEmptyRuleGroup() });
  const [count, setCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const evaluateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCount = useCallback(async () => {
    if (!activeOrganization || type !== 'DYNAMIC') return;
    setCountLoading(true);
    setError(null);
    try {
      const res = await evaluateSegmentAction(activeOrganization.id, rules);
      if (res.error) setCount(null);
      else setCount(res.count ?? 0);
    } finally {
      setCountLoading(false);
    }
  }, [activeOrganization?.id, type, rules]);

  useEffect(() => {
    if (type !== 'DYNAMIC' || !activeOrganization) {
      setCount(null);
      return;
    }
    if (evaluateTimeoutRef.current) clearTimeout(evaluateTimeoutRef.current);
    evaluateTimeoutRef.current = setTimeout(() => {
      fetchCount();
      evaluateTimeoutRef.current = null;
    }, EVALUATE_DEBOUNCE_MS);
    return () => {
      if (evaluateTimeoutRef.current) clearTimeout(evaluateTimeoutRef.current);
    };
  }, [type, rules, activeOrganization?.id, fetchCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await createSegmentAction(activeOrganization.id, {
        name: name.trim(),
        description: description.trim() || null,
        type,
        rules: type === 'DYNAMIC' ? rules : null,
      });
      if (res.error) {
        setError(res.error);
        return;
      }
      if (res.id) router.push('/dashboard/marketing/segments');
    } finally {
      setSubmitting(false);
    }
  };

  if (orgLoading || !activeOrganization) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <div className="h-8 w-64 animate-pulse rounded bg-white/10 mb-6" />
          <div className="h-96 animate-pulse rounded-xl bg-white/10" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/marketing/segments" className="hover:text-white">Segments</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Nouveau segment</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-2">Nouveau segment</h1>
        <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mb-6">
          Créez une audience statique (liste fixe) ou dynamique (règles).
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6 space-y-4">
            <h2 className="font-medium text-white">Informations</h2>
            <div>
              <label className="block text-sm text-[var(--text-secondary,#A0A0B0)] mb-1">Nom du segment</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ex: Donateurs actifs"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[var(--text-secondary,#A0A0B0)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary,#A0A0B0)] mb-1">Description (optionnel)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Ex: Donateurs avec au moins un don dans les 30 derniers jours"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[var(--text-secondary,#A0A0B0)]"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary,#A0A0B0)] mb-2">Type de segment</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="DYNAMIC"
                    checked={type === 'DYNAMIC'}
                    onChange={() => setType('DYNAMIC')}
                    className="rounded"
                  />
                  <span className="text-white">Dynamique (règles)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="STATIC"
                    checked={type === 'STATIC'}
                    onChange={() => setType('STATIC')}
                    className="rounded"
                  />
                  <span className="text-white">Statique (liste fixe)</span>
                </label>
              </div>
            </div>
          </div>

          {type === 'DYNAMIC' && (
            <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6 space-y-4">
              <h2 className="font-medium text-white">Règles de segmentation</h2>
              <RuleBuilder
                group={rules.group}
                onChange={(group) => setRules({ group })}
              />
              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                <Users className="w-5 h-5 text-[var(--text-secondary,#A0A0B0)]" />
                <span className="text-sm text-[var(--text-secondary,#A0A0B0)]">Donateurs dans ce segment :</span>
                {countLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary,#3B82F6)]" />
                ) : (
                  <span className="font-semibold text-white">{count !== null ? count : '-'}</span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:opacity-90"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Créer le segment
            </button>
            <Link
              href="/dashboard/marketing/segments"
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5"
            >
              Annuler
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
