'use client';

/**
 * Page de remerciement après un don P2P - Étape 6.2.1
 * Route : /p2p/[campaignSlug]/[participantSlug]/merci
 */

import { useParams, useRouter } from 'next/navigation';
import { Container, Card, Button } from '@/components/ui';
import { CheckCircle, ArrowLeft, Share2 } from 'lucide-react';

export default function P2PThankYouPage() {
  const params = useParams();
  const router = useRouter();
  const campaignSlug = params?.campaignSlug as string;
  const participantSlug = params?.participantSlug as string;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/p2p/${campaignSlug}/${participantSlug}`
    : '';

  const handleShare = () => {
    if (navigator.share && shareUrl) {
      navigator.share({
        title: `Soutenez ${participantSlug}`,
        text: 'Faites un don pour cette cause importante !',
        url: shareUrl,
      }).catch(() => {
        // Fallback: copier dans le presse-papier
        navigator.clipboard.writeText(shareUrl);
        alert('Lien copié dans le presse-papier !');
      });
    } else if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      alert('Lien copié dans le presse-papier !');
    }
  };

  return (
    <Container className="py-8 lg:py-12">
      <Card className="max-w-2xl mx-auto text-center p-12">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Merci pour votre don !</h1>
        <p className="text-lg text-gray-400 mb-8">
          Votre générosité fait une réelle différence. Un email de confirmation vous a été envoyé.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" onClick={() => router.push(`/p2p/${campaignSlug}/${participantSlug}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la page de collecte
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Partager cette page
          </Button>
        </div>
      </Card>
    </Container>
  );
}
