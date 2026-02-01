'use client';

/**
 * Tableau de bord Ambassadeur P2P - Étape 6.2.2
 * Route : /dashboard/p2p/ambassadeur
 * Tableau de bord pour les participants P2P pour gérer leur collecte
 */

import { useState, useEffect } from 'react';
import { Container, Card, Button, LoadingSkeleton, useToast } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth/core';
import { getP2PParticipantByEmail } from '@/app/actions/p2p/getParticipantByEmail';
import { getP2PParticipantStats } from '@/app/actions/p2p/getParticipantStats';
import type { P2PParticipantStats } from '@/app/actions/p2p/getParticipantStats';
import { logger } from '@/lib/logger';
import { P2PParticipantDashboard } from '@/components/p2p';

export const dynamic = 'force-dynamic';
export const dynamicParams = true;


export default function P2PAmbassadorDashboardPage() {
  const router = useRouter();
  const { error: showErrorToast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [stats, setStats] = useState<P2PParticipantStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserAndParticipants();
  }, []);

  useEffect(() => {
    if (selectedParticipantId && userEmail) {
      loadParticipantStats();
    }
  }, [selectedParticipantId, userEmail]);

  const loadUserAndParticipants = async () => {
    try {
      setIsLoading(true);
      const session = await auth();
      
      if (!session?.user?.email) {
        showErrorToast('Vous devez être connecté pour accéder au tableau de bord ambassadeur');
        router.push('/auth/login');
        return;
      }

      const userEmail = session.user.email;
      setUserEmail(userEmail);

      // Récupérer tous les participants de cet utilisateur
      const result = await getP2PParticipantByEmail({
        email: userEmail,
      });

      if (result.success && result.participants && result.participants.length > 0) {
        setParticipants(result.participants);
        const firstParticipant = result.participants[0];
        if (firstParticipant?.id) {
          setSelectedParticipantId(firstParticipant.id);
        }
      } else {
        showErrorToast('Aucun participant trouvé pour votre compte');
      }
    } catch (error) {
      logger.error('Error loading user participants', error);
      showErrorToast('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipantStats = async () => {
    if (!selectedParticipantId || !userEmail) return;

    try {
      setIsLoading(true);
      const currentParticipant = participants.find(p => p.id === selectedParticipantId);
      
      if (!currentParticipant) return;

      const result = await getP2PParticipantStats({
        participantId: selectedParticipantId,
        organizationId: currentParticipant.campaign.organizationId,
      });

      if (result.success && result.stats) {
        setStats(result.stats);
      } else {
        showErrorToast(result.error || 'Erreur lors du chargement des statistiques');
      }
    } catch (error) {
      logger.error('Error loading participant stats', error);
      showErrorToast('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  const getParticipantUrl = (participant: any) => {
    return `/p2p/${participant.campaign.slug}/${participant.slug}`;
  };

  const handleShare = async (participant: any, platform?: string) => {
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}${getParticipantUrl(participant)}`
      : '';
    
    const shareText = `Soutenez ${participant.firstName} ${participant.lastName} dans la campagne "${participant.campaign.name}" !`;

    if (platform === 'copy') {
      await navigator.clipboard.writeText(url);
      showErrorToast('Lien copié dans le presse-papier !');
      return;
    }

    if (platform === 'email') {
      window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`Faites un don : ${url}`)}`;
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: participant.personalMessage || '',
          url: url,
        });
      } catch (error) {
        // L'utilisateur a annulé le partage
      }
    } else {
      // Fallback: copier dans le presse-papier
      await navigator.clipboard.writeText(url);
      showErrorToast('Lien copié dans le presse-papier !');
    }
  };

  if (isLoading && !participants.length) {
    return (
      <Container className="py-8 lg:py-12">
        <LoadingSkeleton variant="card" count={3} />
      </Container>
    );
  }

  if (participants.length === 0) {
    return (
      <Container className="py-8 lg:py-12">
        <Card>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">Aucune page de collecte trouvée</h2>
            <p className="text-gray-400 mb-6">
              Vous n'avez pas encore créé de page de collecte personnelle.
            </p>
            <Button variant="primary" onClick={() => router.push('/dashboard/p2p/campagnes')}>
              Voir les campagnes disponibles
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  const selectedParticipant = participants.find(p => p.id === selectedParticipantId);

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord Ambassadeur</h1>
        <p className="text-gray-400">Gérez vos pages de collecte personnelles</p>
      </div>

      {/* Sélecteur de participant */}
      {participants.length > 1 && (
        <Card className="mb-6">
          <div className="p-4">
            <label className="block text-sm font-medium text-white mb-2">
              Sélectionner une page de collecte
            </label>
            <select
              value={selectedParticipantId || ''}
              onChange={(e) => setSelectedParticipantId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] px-4 py-2 text-white"
            >
              {participants.map(p => (
                <option key={p.id} value={p.id}>
                  {p.firstName} {p.lastName} - {p.campaign.name}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {selectedParticipant && stats && (
        <P2PParticipantDashboard
          participant={selectedParticipant}
          stats={stats}
          onShare={handleShare}
          getParticipantUrl={getParticipantUrl}
        />
      )}

      {selectedParticipant && !stats && !isLoading && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-400">Chargement des statistiques...</p>
          </div>
        </Card>
      )}
    </Container>
  );
}
