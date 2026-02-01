'use client';

/**
 * Page publique du participant P2P - Étape 6.2.1
 * Route : /p2p/[campaignSlug]/[participantSlug]
 * Page de collecte personnelle d'un participant
 */

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getP2PParticipant } from '@/app/actions/p2p/getParticipant';
import { submitDonationFormAction } from '@/app/actions/donation-forms/submit';
import { getDonationAmountSuggestions } from '@/app/actions/donations/getDonationAmountSuggestions';
import type { P2PParticipantDetails } from '@/app/actions/p2p/getParticipant';
import {
  AmountSelector,
  DonatorInfoForm,
  PaymentSection,
  ConsentCheckboxes,
  ProgressBar,
} from '@/components/donation-forms/public';
import type { DonationFormDraft, FrequencyKey } from '@/lib/types/donation-form';
import { Users, DollarSign, Heart } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(amount);
}

export default function P2PParticipantPage() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params?.campaignSlug as string;
  const participantSlug = params?.participantSlug as string;

  const [participant, setParticipant] = useState<P2PParticipantDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État du formulaire de don
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
  const [personalizedAmounts, setPersonalizedAmounts] = useState<number[] | null>(null);
  const [isPersonalized, setIsPersonalized] = useState(false);

  // Créer un formulaire de don virtuel pour utiliser les composants existants
  const [donationForm, setDonationForm] = useState<DonationFormDraft | null>(null);

  useEffect(() => {
    if (!campaignSlug || !participantSlug) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      const res = await getP2PParticipant({
        campaignSlug,
        participantSlug,
      });

      if (cancelled) return;

      if (res.error || !res.participant) {
        setError(res.error || 'Participant non trouvé');
        setParticipant(null);
      } else {
        setParticipant(res.participant);

        // Créer un formulaire de don virtuel pour utiliser les composants existants
        setDonationForm({
          id: res.participant.campaignId,
          title: `Soutenir ${res.participant.firstName} ${res.participant.lastName}`,
          description: res.participant.personalMessage || `Faites un don pour soutenir ${res.participant.firstName} dans la campagne "${res.participant.campaign.name}"`,
          slug: `${campaignSlug}-${participantSlug}`,
          coverImage: res.participant.campaign.coverImage || null,
          amountType: 'flexible',
          suggestedAmounts: [25, 50, 100, 250, 500],
          minAmount: null,
          maxAmount: null,
          currency: 'CAD',
          allowRecurring: false,
          frequencies: [],
          requiredFields: ['email', 'firstName', 'lastName'],
          optionalFields: ['phone', 'address', 'message'],
          customFields: [],
          primaryColor: res.participant.campaign.primaryColor || '#3B82F6',
          logo: res.participant.campaign.logo || null,
          coverImageDesign: null,
          font: 'Inter',
          buttonStyle: 'gradient',
          welcomeMessage: '',
          thankYouMessage: `Merci pour votre don ! Votre soutien aide ${res.participant.firstName} à atteindre son objectif.`,
          emailTemplate: '',
          redirectUrl: '',
          enableConsents: true,
          consentText: '',
          enableCaptcha: false,
          maxDonations: null,
          startDate: null,
          endDate: null,
          goalAmount: res.participant.goalAmount || null,
          organizationId: res.participant.campaign.organizationId,
          status: 'published',
          totalCollected: res.participant.totalRaised,
        });
      }

      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [campaignSlug, participantSlug]);

  // Charger les montants personnalisés quand l'email est disponible
  useEffect(() => {
    const donorEmail = formData.email;
    const formId = donationForm?.id;
    const organizationId = participant?.campaign.organizationId;

    if (!formId || !donorEmail || !organizationId) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(donorEmail)) return;

    const timeoutId = setTimeout(async () => {
      try {
        const suggestions = await getDonationAmountSuggestions({
          formId,
          organizationId,
          donorEmail,
        });

        if (suggestions.success && suggestions.isPersonalized) {
          setPersonalizedAmounts(suggestions.suggestedAmounts);
          setIsPersonalized(true);
        } else {
          setPersonalizedAmounts(null);
          setIsPersonalized(false);
        }
      } catch (error) {
        setPersonalizedAmounts(null);
        setIsPersonalized(false);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.email, donationForm?.id, participant?.campaign.organizationId]);

  const displayAmount = amount ?? (customAmount ? parseFloat(customAmount.replace(/,/, '.')) : null);
  const primaryColor = participant?.campaign.primaryColor || '#3B82F6';
  const buttonStyle = donationForm?.buttonStyle || 'gradient';

  const handleSubmit = useCallback(async () => {
    if (!donationForm?.id || displayAmount == null || displayAmount <= 0 || !participant) return;
    
    setSubmitError(null);
    setSubmitLoading(true);
    
    // TODO: Créer une action spécifique pour les dons P2P qui lie le don au participant
    // Pour l'instant, utiliser le système de formulaire de don existant
    const res = await submitDonationFormAction({
      formId: donationForm.id,
      amount: displayAmount,
      currency: donationForm.currency,
      isRecurring,
      frequency: frequency ?? undefined,
      formData: {
        ...formData,
        p2pParticipantId: participant.id, // Métadonnée pour lier le don au participant
      },
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
    
    router.push(`/p2p/${campaignSlug}/${participantSlug}/merci?submission=${res.submissionId ?? ''}`);
  }, [donationForm?.id, donationForm?.currency, displayAmount, isRecurring, frequency, formData, consentEmail, consentPhone, consentSMS, consentMail, participant, campaignSlug, participantSlug, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] flex items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-[var(--color-primary,#3B82F6)]" />
      </div>
    );
  }

  if (error || !participant || !donationForm) {
    return (
      <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] flex items-center justify-center p-4">
        <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-white mb-2">Page non trouvée</h1>
          <p className="text-white/70 mb-4">{error ?? 'Cette page de collecte n\'existe pas ou n\'est plus disponible.'}</p>
        </div>
      </div>
    );
  }


  return (
    <div
      className="min-h-screen bg-[var(--background-primary,#0A0A0F)]"
      style={{ fontFamily: donationForm.font || 'Inter' }}
    >
      {/* Header / Cover */}
      <header className="relative border-b border-white/10">
        {participant.campaign.coverImage && (
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${participant.campaign.coverImage})` }}
          />
        )}
        <div className="mx-auto max-w-2xl px-4 py-6">
          {participant.campaign.logo && (
            <img src={participant.campaign.logo} alt="" className="mb-4 h-12 object-contain" />
          )}
          <h1 className="text-2xl font-bold text-white">
            {participant.firstName} {participant.lastName}
          </h1>
          <p className="mt-2 text-white/80">
            Collecte pour : {participant.campaign.name}
          </p>
          {participant.team && (
            <div className="mt-2 flex items-center gap-2 text-white/60">
              <Users className="h-4 w-4" />
              <span>Équipe : {participant.team.name}</span>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* Message personnel */}
        {participant.personalMessage && (
          <div className="mb-6 rounded-lg border border-white/10 bg-white/5 p-4 text-white/90">
            <p className="whitespace-pre-wrap">{participant.personalMessage}</p>
          </div>
        )}

        {/* Statistiques */}
        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-xs text-white/60">Collecté</span>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(participant.totalRaised)}</p>
            {participant.goalAmount && (
              <p className="text-xs text-white/40 mt-1">sur {formatCurrency(participant.goalAmount)}</p>
            )}
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-xs text-white/60">Dons</span>
            </div>
            <p className="text-2xl font-bold text-white">{participant.donationCount}</p>
            <p className="text-xs text-white/40 mt-1">donateurs</p>
          </div>
        </div>

        {/* Barre de progression */}
        {participant.goalAmount && participant.goalAmount > 0 && (
          <div className="mb-8">
            <ProgressBar
              current={participant.totalRaised}
              goal={participant.goalAmount}
              currency="CAD"
            />
          </div>
        )}

        {/* Formulaire de don */}
        <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Faire un don</h2>
          <AmountSelector
            form={donationForm}
            amount={amount}
            customAmount={customAmount}
            isRecurring={isRecurring}
            frequency={frequency}
            onAmountChange={(a, c) => { setAmount(a); setCustomAmount(c); }}
            onRecurringChange={(r, f) => { setIsRecurring(r); setFrequency(f); }}
            primaryColor={primaryColor}
            buttonStyle={buttonStyle}
            personalizedAmounts={personalizedAmounts ?? undefined}
            isPersonalized={isPersonalized}
          />
        </section>

        <section className="mb-8 rounded-xl border border-white/10 bg-white/5 p-6">
          <DonatorInfoForm
            form={donationForm}
            data={formData}
            onChange={setFormData}
          />
        </section>

        {donationForm.enableConsents && (
          <section className="mb-8">
            <ConsentCheckboxes
              consentText={donationForm.consentText || undefined}
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
            currency={donationForm.currency}
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
