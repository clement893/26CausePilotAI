'use client';

/**
 * Wizard Création de campagne email - Étape 3.1.3
 * 4 étapes : Configuration, Template, Audience, Planification
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { listEmailTemplatesAction } from '@/app/actions/email-templates/list';
import { listAudiencesAction } from '@/app/actions/audiences/list';
import { createEmailCampaignAction } from '@/app/actions/email-campaigns/create';
import { ChevronRight, ChevronLeft, Loader2, Mail, Users, Calendar, FileText } from 'lucide-react';
import { AIGenerateButton } from '@/components/ai/AIGenerateButton';

type Step = 1 | 2 | 3 | 4;

interface WizardData {
  name: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  templateId: string;
  audienceId: string;
  sendNow: boolean;
  scheduledAt: string; // ISO date-time
}

const INITIAL: WizardData = {
  name: '',
  subject: '',
  fromName: '',
  fromEmail: '',
  templateId: '',
  audienceId: '',
  sendNow: true,
  scheduledAt: '',
};

export const dynamic = 'force-dynamic';

export default function NewCampaignPage() {
  const router = useRouter();
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<WizardData>(INITIAL);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);
  const [audiences, setAudiences] = useState<{ id: string; name: string; donatorCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrganization) return;
    (async () => {
      setLoading(true);
      const [tRes, aRes] = await Promise.all([
        listEmailTemplatesAction(activeOrganization.id),
        listAudiencesAction(activeOrganization.id),
      ]);
      if (tRes.templates) setTemplates(tRes.templates);
      if (aRes.audiences) setAudiences(aRes.audiences);
      setLoading(false);
    })();
  }, [activeOrganization?.id]);

  const update = useCallback((partial: Partial<WizardData>) => {
    setData((d) => ({ ...d, ...partial }));
  }, []);

  const canNext = () => {
    if (step === 1) return data.name.trim() && data.subject.trim() && data.fromName.trim() && data.fromEmail.trim();
    if (step === 2) return !!data.templateId;
    if (step === 3) return !!data.audienceId;
    if (step === 4) return data.sendNow || !!data.scheduledAt.trim();
    return false;
  };

  const handleSubmit = async () => {
    if (!activeOrganization) return;
    setSubmitting(true);
    setError(null);
    try {
      const scheduledAt = data.sendNow ? undefined : (data.scheduledAt ? new Date(data.scheduledAt).toISOString() : undefined);
      const result = await createEmailCampaignAction(activeOrganization.id, {
        name: data.name,
        subject: data.subject,
        fromName: data.fromName,
        fromEmail: data.fromEmail,
        templateId: data.templateId,
        audienceId: data.audienceId,
        scheduledAt,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.id) router.push(`/dashboard/marketing/campagnes`);
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

  const stepOptions: { n: Step; label: string; icon: React.ReactNode }[] = [
    { n: 1, label: 'Configuration', icon: <FileText className="w-4 h-4" /> },
    { n: 2, label: 'Template', icon: <Mail className="w-4 h-4" /> },
    { n: 3, label: 'Audience', icon: <Users className="w-4 h-4" /> },
    { n: 4, label: 'Planification', icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-6 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/dashboard/marketing/campagnes" className="hover:text-white">Campagnes email</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-white">Nouvelle campagne</span>
        </nav>

        <h1 className="text-2xl font-bold text-white mb-2">Nouvelle campagne email</h1>
        <p className="text-sm text-[var(--text-secondary,#A0A0B0)] mb-6">
          Étape {step} sur 4
        </p>

        {/* Step indicators */}
        <div className="flex gap-2 mb-8">
          {stepOptions.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${step === s.n ? 'border-[var(--color-primary,#3B82F6)] bg-[var(--color-primary,#3B82F6)]/20 text-white' : 'border-white/10 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/5'}`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-medium text-white">Configuration</h2>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm text-[var(--text-secondary,#A0A0B0)]">Nom de la campagne</label>
                  <AIGenerateButton
                    contentType="campaign_description"
                    onGenerated={(content) => {
                      const firstLine = content.trim().split('\n')[0];
                      if (firstLine) update({ name: firstLine });
                    }}
                    context={`Campagne: ${data.name || 'nouvelle campagne'}`}
                    size="sm"
                  />
                </div>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="Ex: Newsletter janvier"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[var(--text-secondary,#A0A0B0)]"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm text-[var(--text-secondary,#A0A0B0)]">Sujet de l&apos;email</label>
                  <AIGenerateButton
                    contentType="email"
                    onGenerated={(content) => {
                      // Extraire le sujet depuis le contenu généré (première ligne ou titre)
                      const lines = content.trim().split('\n');
                      const firstLine = lines[0];
                      const subject = firstLine ? firstLine.replace(/^#+\s*/, '').trim() : content.trim().substring(0, 50);
                      if (subject) update({ subject });
                    }}
                    context={`Campagne: ${data.name || 'nouvelle campagne'}`}
                    size="sm"
                  />
                </div>
                <input
                  type="text"
                  value={data.subject}
                  onChange={(e) => update({ subject: e.target.value })}
                  placeholder="Ex: Votre impact ce mois-ci"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[var(--text-secondary,#A0A0B0)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary,#A0A0B0)] mb-1">Nom de l&apos;expéditeur</label>
                <input
                  type="text"
                  value={data.fromName}
                  onChange={(e) => update({ fromName: e.target.value })}
                  placeholder="Ex: Équipe CausePilot"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[var(--text-secondary,#A0A0B0)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary,#A0A0B0)] mb-1">Email de l&apos;expéditeur</label>
                <input
                  type="email"
                  value={data.fromEmail}
                  onChange={(e) => update({ fromEmail: e.target.value })}
                  placeholder="Ex: contact@example.org"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-[var(--text-secondary,#A0A0B0)]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-medium text-white">Choisir un template</h2>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary,#A0A0B0)]" /></div>
              ) : templates.length === 0 ? (
                <p className="text-[var(--text-secondary,#A0A0B0)]">Aucun template. <Link href="/dashboard/marketing/templates" className="text-[var(--color-primary,#3B82F6)] hover:underline">Créer un template</Link></p>
              ) : (
                <div className="space-y-2">
                  {templates.map((t) => (
                    <label key={t.id} className="flex items-center gap-3 rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-white/5">
                      <input
                        type="radio"
                        name="template"
                        value={t.id}
                        checked={data.templateId === t.id}
                        onChange={() => update({ templateId: t.id })}
                        className="rounded"
                      />
                      <span className="text-white">{t.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-medium text-white">Choisir une audience</h2>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary,#A0A0B0)]" /></div>
              ) : audiences.length === 0 ? (
                <p className="text-[var(--text-secondary,#A0A0B0)]">Aucune audience. Créez des audiences dans la base donateur.</p>
              ) : (
                <div className="space-y-2">
                  {audiences.map((a) => (
                    <label key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-white/5">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="audience"
                          value={a.id}
                          checked={data.audienceId === a.id}
                          onChange={() => update({ audienceId: a.id })}
                          className="rounded"
                        />
                        <span className="text-white">{a.name}</span>
                      </div>
                      <span className="text-sm text-[var(--text-secondary,#A0A0B0)]">{a.donatorCount} contact(s)</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="font-medium text-white">Planification</h2>
              <label className="flex items-center gap-3 rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-white/5">
                <input
                  type="radio"
                  name="schedule"
                  checked={data.sendNow}
                  onChange={() => update({ sendNow: true, scheduledAt: '' })}
                  className="rounded"
                />
                <span className="text-white">Envoyer maintenant (après création)</span>
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-white/10 p-3 cursor-pointer hover:bg-white/5">
                <input
                  type="radio"
                  name="schedule"
                  checked={!data.sendNow}
                  onChange={() => update({ sendNow: false })}
                  className="rounded"
                />
                <span className="text-white">Planifier pour plus tard</span>
              </label>
              {!data.sendNow && (
                <div>
                  <label className="block text-sm text-[var(--text-secondary,#A0A0B0)] mb-1">Date et heure</label>
                  <input
                    type="datetime-local"
                    value={data.scheduledAt}
                    onChange={(e) => update({ scheduledAt: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep((s) => (s > 1 ? (s - 1) : 1) as Step)}
              disabled={step === 1}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-white/5"
            >
              <ChevronLeft className="w-4 h-4" /> Précédent
            </button>
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s < 4 ? (s + 1) : 4) as Step)}
                disabled={!canNext()}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm text-white disabled:opacity-50 hover:opacity-90"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canNext() || submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary,#3B82F6)] px-4 py-2 text-sm text-white disabled:opacity-50 hover:opacity-90"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Créer la campagne
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
