'use server';

/**
 * trackFormViewAction - Étape 2.1.4
 * Incrémente le compteur de vues du formulaire.
 */

function getApiUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_DEFAULT_API_URL ||
    'http://localhost:8000'
  ).replace(/\/$/, '');
}

export async function trackFormViewAction(formId: string): Promise<{ success?: true; error?: string }> {
  try {
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/api/v1/donation-forms/${formId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      cache: 'no-store',
    });
    if (!res.ok) {
      const json = (await res.json().catch(() => ({}))) as { detail?: string };
      return { error: typeof json.detail === 'string' ? json.detail : 'Erreur' };
    }
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Erreur réseau' };
  }
}
