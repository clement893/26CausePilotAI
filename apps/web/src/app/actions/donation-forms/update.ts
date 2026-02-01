'use server';

/**
 * updateFormAction - Étape 2.1.3
 * Met à jour un formulaire de don existant.
 * Appelle le backend PATCH /api/v1/donation-forms/:id.
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

export async function updateFormAction(
  formId: string,
  data: Partial<DonationFormDraft>
): Promise<{ success?: true; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Non authentifié' };
  }

  const payload: Record<string, unknown> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.description !== undefined) payload.description = data.description;
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.coverImage !== undefined) payload.cover_image = data.coverImage;
  if (data.amountType !== undefined) payload.amount_type = data.amountType;
  if (data.suggestedAmounts !== undefined) payload.suggested_amounts = data.suggestedAmounts;
  if (data.minAmount !== undefined) payload.min_amount = data.minAmount;
  if (data.maxAmount !== undefined) payload.max_amount = data.maxAmount;
  if (data.currency !== undefined) payload.currency = data.currency;
  if (data.allowRecurring !== undefined) payload.allow_recurring = data.allowRecurring;
  if (data.frequencies !== undefined) payload.frequencies = data.frequencies;
  if (data.requiredFields !== undefined) payload.required_fields = data.requiredFields;
  if (data.optionalFields !== undefined) payload.optional_fields = data.optionalFields;
  if (data.customFields !== undefined) payload.custom_fields = data.customFields;
  if (data.primaryColor !== undefined) payload.primary_color = data.primaryColor;
  if (data.logo !== undefined) payload.logo = data.logo;
  if (data.coverImageDesign !== undefined) payload.cover_image_design = data.coverImageDesign;
  if (data.font !== undefined) payload.font = data.font;
  if (data.buttonStyle !== undefined) payload.button_style = data.buttonStyle;
  if (data.welcomeMessage !== undefined) payload.welcome_message = data.welcomeMessage;
  if (data.thankYouMessage !== undefined) payload.thank_you_message = data.thankYouMessage;
  if (data.emailTemplate !== undefined) payload.email_template = data.emailTemplate;
  if (data.redirectUrl !== undefined) payload.redirect_url = data.redirectUrl;
  if (data.enableConsents !== undefined) payload.enable_consents = data.enableConsents;
  if (data.consentText !== undefined) payload.consent_text = data.consentText;
  if (data.enableCaptcha !== undefined) payload.enable_captcha = data.enableCaptcha;
  if (data.maxDonations !== undefined) payload.max_donations = data.maxDonations;
  if (data.startDate !== undefined) payload.start_date = data.startDate;
  if (data.endDate !== undefined) payload.end_date = data.endDate;
  if (data.goalAmount !== undefined) payload.goal_amount = data.goalAmount;
  if (data.status !== undefined) payload.status = data.status;

  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/v1/donation-forms/${formId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    const json = (await res.json().catch(() => ({}))) as { detail?: string };
    if (!res.ok) {
      const msg = typeof json.detail === 'string' ? json.detail : 'Erreur lors de la mise à jour';
      return { error: msg };
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}
