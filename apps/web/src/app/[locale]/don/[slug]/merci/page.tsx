'use client';

/**
 * Page de remerciement après don - Étape 2.1.4
 * Route : /[locale]/don/[slug]/merci
 */

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function DonThankYouPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const submissionId = searchParams?.get('submission') ?? '';

  const [thankYouMessage, setThankYouMessage] = useState<string>('');
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      const { getFormBySlugAction } = await import('@/app/actions/donation-forms/get-by-slug');
      const res = await getFormBySlugAction(slug);
      if (cancelled) return;
      if (res.form) {
        setThankYouMessage(res.form.thankYouMessage || 'Merci pour votre généreux don !');
        if (res.form.redirectUrl) {
          setRedirectUrl(res.form.redirectUrl);
          setCountdown(10);
        }
      } else {
        setThankYouMessage('Merci pour votre don !');
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    if (countdown == null || countdown <= 0 || !redirectUrl) return;
    const t = setInterval(() => {
      setCountdown((c) => (c != null && c > 0 ? c - 1 : null));
    }, 1000);
    return () => clearInterval(t);
  }, [countdown, redirectUrl]);

  useEffect(() => {
    if (countdown === 0 && redirectUrl) {
      window.location.href = redirectUrl;
    }
  }, [countdown, redirectUrl]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href.replace(/\/merci.*/, '') : '';
  const shareText = encodeURIComponent('Je viens de faire un don. Rejoignez-moi !');

  return (
    <div className="min-h-screen bg-[var(--background-primary,#0A0A0F)] flex items-center justify-center p-4">
      <div className="mx-auto max-w-lg rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Merci !</h1>
        <p className="text-white/90 whitespace-pre-wrap mb-6">
          {thankYouMessage || 'Merci pour votre généreux don.'}
        </p>
        {submissionId && (
          <p className="text-sm text-white/60 mb-6">
            Référence : {submissionId}
          </p>
        )}
        <p className="text-sm text-white/70 mb-6">
          Un email de confirmation vous a été envoyé.
        </p>

        <div className="mb-6">
          <p className="text-sm font-medium text-white/80 mb-3">Partager</p>
          <div className="flex justify-center gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Partager sur Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Partager sur Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 bg-white/10 text-white hover:bg-white/20 transition-colors"
              aria-label="Partager sur LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {redirectUrl && countdown != null && countdown > 0 && (
          <p className="text-sm text-white/60 mb-4">
            Redirection dans {countdown} seconde{countdown !== 1 ? 's' : ''}…
          </p>
        )}

        <Link
          href={slug ? `/don/${slug}` : '/'}
          className="inline-block rounded-lg bg-[var(--color-primary,#3B82F6)] px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          {slug ? 'Retour au formulaire' : 'Retour à l\'accueil'}
        </Link>
      </div>
    </div>
  );
}
