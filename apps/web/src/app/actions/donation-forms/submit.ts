'use server';

/**
 * submitDonationFormAction - Étape 2.1.4
 * Soumet le formulaire de don, crée le PaymentIntent, et retourne l'URL de redirection ou client_secret.
 */

export interface SubmitDonationFormPayload {
  formId: string;
  amount: number;
  currency: string;
  isRecurring?: boolean;
  frequency?: string;
  formData: Record<string, unknown>;
  consentEmail?: boolean;
  consentPhone?: boolean;
  consentSMS?: boolean;
  consentMail?: boolean;
}

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

export async function submitDonationFormAction(
  payload: SubmitDonationFormPayload
): Promise<{
  success?: true;
  submissionId?: string;
  clientSecret?: string;
  redirectUrl?: string;
  error?: string;
}> {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/v1/donation-forms/${payload.formId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: payload.amount,
        currency: payload.currency,
        is_recurring: payload.isRecurring ?? false,
        frequency: payload.frequency ?? null,
        form_data: payload.formData,
        consent_email: payload.consentEmail ?? false,
        consent_phone: payload.consentPhone ?? false,
        consent_sms: payload.consentSMS ?? false,
        consent_mail: payload.consentMail ?? false,
      }),
      cache: 'no-store',
    });
    const json = (await res.json().catch(() => ({}))) as {
      submission_id?: string;
      client_secret?: string;
      redirect_url?: string;
      detail?: string;
    };
    if (!res.ok) {
      return { error: typeof json.detail === 'string' ? json.detail : 'Erreur lors de la soumission' };
    }
    return {
      success: true,
      submissionId: json.submission_id,
      clientSecret: json.client_secret,
      redirectUrl: json.redirect_url,
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}
