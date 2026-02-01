'use client';

/**
 * Page publique du formulaire de don - Étape 2.1.4
 * Route : /[locale]/don/[slug]
 */

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getFormBySlugAction } from '@/app/actions/donation-forms/get-by-slug';
import { trackFormViewAction } from '@/app/actions/donation-forms/track-view';
import { submitDonationFormAction } from '@/app/actions/donation-forms/submit';
import type { DonationFormDraft } from '@/lib/types/donation-form';
import type { FrequencyKey } from '@/lib/types/donation-form';
import {
  AmountSelector,
  DonatorInfoForm,
  PaymentSection,
  ConsentCheckboxes,
  ProgressBar,
} from '@/components/donation-forms/public';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function PublicDonationFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [form, setForm] = useState<DonationFormDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<FrequencyKey | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [consentEmail, setConsentEmail] = useState(false);
  const [consentPhone, setConsentPhone] = useState(false);
  const [consentSMS, setConsentSMS] = useState(false);
  const [consentMail, setConsentMail] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await getFormBySlugAction(slug);
      if (cancelled) return;
      if (res.error) {
        setError(res.error);
        setForm(null);
      } else if (res.form) {
        setForm(res.form);
        if (res.form.id) {
          trackFormViewAction(res.form.id);
        }
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const displayAmount = amount ?? (customAmount ? parseFloat(customAmount.replace(/,/, '.')) : null);
  const primaryColor = form?.primaryColor ?? '#3B82F6';
  const buttonStyle = form?.buttonStyle ?? 'gradient';

  const handleSubmit = useCallback(async () => {
    if (!form?.id || displayAmount == null || displayAmount <= 0) return;
    setSubmitError(null);
    setSubmitLoading(true);
    const res = await submitDonationFormAction({
      formId: form.id,
      amount: displayAmount,
      currency: form.currency,
      isRecurring,
      frequency: frequency ?? undefined,
      formData,
      consentEmail,
      consentPhone,
      consentSMS,
      consentMail,
    });
    setSubmitLoading(false);
    if (res.error) {
      setSubmitError(res.error);
      return;
    }
    if (res.redirectUrl) {
      window.location.href = res.redirectUrl;
      return;
    }
    router.push(`/don/${slug}/merci?submission=${res.submissionId ?? ''}`);
  }, [form?.id, form?.currency, displayAmount, isRecurring, frequency, formData, consentEmail, consentPhone, consentSMS, consentMail, slug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[var(--color-primary,#3B82F6)]" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] flex items-center justify-center p-4">
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-white mb-2">Formulaire introuvable</h1>
          <p className="text-white/70 mb-4">{error ?? 'Ce formulaire n\'existe pas ou n\'est pas publié.'}</p>
        </div>
      </div>
    );
  }

  const totalCollected = Number(form.totalCollected ?? 0);
  const goalAmount = form.goalAmount != null ? Number(form.goalAmount) : 0;

  return (
    <div
      className="min-h-screen bg-[var(--background-primary,#0A0A0F)]"
      style={{ fontFamily: form.font || 'Inter' }}
    >
      {/* Header / Cover */}
      <header className="relative border-b border-white/10">
        {form.coverImage && (
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${form.coverImage})` }}
          />
        )}
        <div className="mx-auto max-w-2xl px-4 py-6">
          {form.logo && (
            <img src={form.logo} alt="" className="mb-4 h-12 object-contain" />
          )}
          <h1 className="text-2xl font-bold text-white">{form.title}</h1>
          {form.description && (
            <p className="mt-2 text-white/80">{form.description}</p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {form.welcomeMessage && (
          <p className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4 text-white/90">
            {form.welcomeMessage}
          </p>
        )}

        {goalAmount > 0 && (
          <div className="mb-8">
            <ProgressBar
              current={totalCollected}
              goal={goalAmount}
              currency={form.currency}
            />
          </div>
        )}

        <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <AmountSelector
            form={form}
            amount={amount}
            customAmount={customAmount}
            isRecurring={isRecurring}
            frequency={frequency}
            onAmountChange={(a, c) => { setAmount(a); setCustomAmount(c); }}
            onRecurringChange={(r, f) => { setIsRecurring(r); setFrequency(f); }}
            primaryColor={primaryColor}
            buttonStyle={buttonStyle}
          />
        </section>

        <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <DonatorInfoForm
            form={form}
            data={formData}
            onChange={setFormData}
          />
        </section>

        {form.enableConsents && (
          <section className="mb-8">
            <ConsentCheckboxes
              consentText={form.consentText || undefined}
              consentEmail={consentEmail}
              consentPhone={consentPhone}
              consentSMS={consentSMS}
              consentMail={consentMail}
              onConsentEmail={setConsentEmail}
              onConsentPhone={setConsentPhone}
              onConsentSMS={setConsentSMS}
              onConsentMail={setConsentMail}
            />
          </section>
        )}

        <section className="mb-8">
          <PaymentSection
            primaryColor={primaryColor}
            buttonStyle={buttonStyle}
            amount={displayAmount ?? 0}
            currency={form.currency}
            onSubmit={handleSubmit}
            loading={submitLoading}
            disabled={!displayAmount || displayAmount <= 0}
          />
        </section>

        {submitError && (
          <p className="mb-4 text-sm text-red-400">{submitError}</p>
        )}
      </main>
    </div>
  );
}
