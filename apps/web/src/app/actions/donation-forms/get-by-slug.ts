'use server';

/**
 * getFormBySlugAction - Étape 2.1.4
 * Récupère un formulaire de don par slug (page publique, pas d'auth).
 */

import type { DonationFormDraft } from '@/lib/types/donation-form';

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

function mapApiToDraft(api: Record<string, unknown>, organizationId: string): DonationFormDraft {
  return {
    id: api.id as string,
    title: (api.title as string) ?? '',
    description: (api.description as string) ?? '',
    slug: (api.slug as string) ?? '',
    coverImage: (api.cover_image as string) ?? null,
    amountType: ((api.amount_type as string) ?? 'flexible') as DonationFormDraft['amountType'],
    suggestedAmounts: Array.isArray(api.suggested_amounts) ? (api.suggested_amounts as number[]) : [25, 50, 100, 250, 500],
    minAmount: api.min_amount != null ? Number(api.min_amount) : null,
    maxAmount: api.max_amount != null ? Number(api.max_amount) : null,
    currency: ((api.currency as string) ?? 'CAD') as DonationFormDraft['currency'],
    allowRecurring: Boolean(api.allow_recurring),
    frequencies: Array.isArray(api.frequencies) ? (api.frequencies as DonationFormDraft['frequencies']) : [],
    requiredFields: Array.isArray(api.required_fields) ? (api.required_fields as string[]) : ['email', 'firstName', 'lastName'],
    optionalFields: Array.isArray(api.optional_fields) ? (api.optional_fields as string[]) : [],
    customFields: Array.isArray(api.custom_fields) ? (api.custom_fields as DonationFormDraft['customFields']) : [],
    primaryColor: (api.primary_color as string) ?? '#3B82F6',
    logo: (api.logo as string) ?? null,
    coverImageDesign: (api.cover_image_design as string) ?? null,
    font: ((api.font as string) ?? 'Inter') as DonationFormDraft['font'],
    buttonStyle: ((api.button_style as string) ?? 'gradient') as DonationFormDraft['buttonStyle'],
    welcomeMessage: (api.welcome_message as string) ?? '',
    thankYouMessage: (api.thank_you_message as string) ?? '',
    emailTemplate: (api.email_template as string) ?? '',
    redirectUrl: (api.redirect_url as string) ?? '',
    enableConsents: Boolean(api.enable_consents ?? true),
    consentText: (api.consent_text as string) ?? '',
    enableCaptcha: Boolean(api.enable_captcha),
    maxDonations: api.max_donations != null ? Number(api.max_donations) : null,
    startDate: api.start_date ? String(api.start_date).slice(0, 10) : null,
    endDate: api.end_date ? String(api.end_date).slice(0, 10) : null,
    goalAmount: api.goal_amount != null ? Number(api.goal_amount) : null,
    organizationId,
    status: ((api.status as string) ?? 'draft') as DonationFormDraft['status'],
    totalCollected: api.total_collected != null ? Number(api.total_collected) : undefined,
  };
}

export async function getFormBySlugAction(slug: string): Promise<{
  success?: true;
  form?: DonationFormDraft;
  error?: string;
}> {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/v1/donation-forms/by-slug/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return { error: typeof json.detail === 'string' ? json.detail : 'Formulaire introuvable' };
    }
    const organizationId = (json.organization_id as string) ?? '';
    const form = mapApiToDraft(json, organizationId);
    if (form.status !== 'published') {
      return { error: 'Ce formulaire n\'est pas publié' };
    }
    return { success: true, form };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}
