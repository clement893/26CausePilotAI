'use server';

/**
 * createFormAction - Étape 2.1.3
 * Crée un nouveau formulaire de don (statut DRAFT).
 * Appelle le backend API lorsqu'il expose POST /api/v1/donation-forms.
 */

import { auth } from '@/lib/auth/core';
import type { DonationFormDraft } from '@/lib/types/donation-form';

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

export async function createFormAction(
  data: Omit<DonationFormDraft, 'id'> & { status?: 'draft' | 'published' }
): Promise<{ success?: true; formId?: string; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const status = data.status ?? 'draft';
  const payload = {
    title: data.title,
    description: data.description || null,
    slug: data.slug,
    cover_image: data.coverImage || null,
    amount_type: data.amountType,
    suggested_amounts: data.suggestedAmounts,
    min_amount: data.minAmount,
    max_amount: data.maxAmount,
    currency: data.currency,
    allow_recurring: data.allowRecurring,
    frequencies: data.frequencies,
    required_fields: data.requiredFields,
    optional_fields: data.optionalFields,
    custom_fields: data.customFields,
    primary_color: data.primaryColor,
    logo: data.logo || null,
    cover_image_design: data.coverImageDesign || null,
    font: data.font,
    button_style: data.buttonStyle,
    welcome_message: data.welcomeMessage || null,
    thank_you_message: data.thankYouMessage || null,
    email_template: data.emailTemplate || null,
    redirect_url: data.redirectUrl || null,
    enable_consents: data.enableConsents,
    consent_text: data.consentText || null,
    enable_captcha: data.enableCaptcha,
    max_donations: data.maxDonations,
    start_date: data.startDate,
    end_date: data.endDate,
    goal_amount: data.goalAmount,
    organization_id: data.organizationId,
    status,
  };

  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/v1/donation-forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const json = (await res.json().catch(() => ({}))) as { id?: string; detail?: string };
    if (!res.ok) {
      const msg = typeof json.detail === 'string' ? json.detail : 'Erreur lors de la création du formulaire';
      return { error: msg };
    }
    return { success: true, formId: json.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}
