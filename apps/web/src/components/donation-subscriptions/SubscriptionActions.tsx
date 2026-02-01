'use client';

/**
 * SubscriptionActions - Étape 2.2.4
 * Boutons pour gérer un abonnement (pause, reprise, annulation).
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Pause, Play, X } from 'lucide-react';
import { pauseSubscriptionAction } from '@/app/actions/subscriptions/pause';
import { resumeSubscriptionAction } from '@/app/actions/subscriptions/resume';
import { cancelSubscriptionAction } from '@/app/actions/subscriptions/cancel';
import type { DonationSubscription } from './types';

export interface SubscriptionActionsProps {
  subscription: DonationSubscription;
  onPaused?: () => void;
  onResumed?: () => void;
  onCancelled?: () => void;
  onError?: (message: string) => void;
}

export function SubscriptionActions({
  subscription,
  onPaused,
  onResumed,
  onCancelled,
  onError,
}: SubscriptionActionsProps) {
  const [loading, setLoading] = useState<'pause' | 'resume' | 'cancel' | null>(null);

  const handlePause = async () => {
    setLoading('pause');
    try {
      const result = await pauseSubscriptionAction(subscription.id);
      if (result.error) onError?.(result.error);
      else onPaused?.();
    } finally {
      setLoading(null);
    }
  };

  const handleResume = async () => {
    setLoading('resume');
    try {
      const result = await resumeSubscriptionAction(subscription.id);
      if (result.error) onError?.(result.error);
      else onResumed?.();
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    if (typeof window !== 'undefined' && !window.confirm('Annuler cet abonnement ?')) return;
    setLoading('cancel');
    try {
      const result = await cancelSubscriptionAction(subscription.id);
      if (result.error) onError?.(result.error);
      else onCancelled?.();
    } finally {
      setLoading(null);
    }
  };

  const isActive = subscription.status === 'ACTIVE';
  const isPaused = subscription.status === 'PAUSED';
  const isEnded = subscription.status === 'CANCELLED' || subscription.status === 'EXPIRED';

  if (isEnded) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {isActive && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePause}
          disabled={loading !== null}
          aria-label="Mettre en pause"
        >
          <Pause className="w-4 h-4 mr-1" />
          {loading === 'pause' ? '…' : 'Pause'}
        </Button>
      )}
      {isPaused && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleResume}
          disabled={loading !== null}
          aria-label="Reprendre"
        >
          <Play className="w-4 h-4 mr-1" />
          {loading === 'resume' ? '…' : 'Reprendre'}
        </Button>
      )}
      {!isEnded && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={loading !== null}
          aria-label="Annuler l’abonnement"
          className="text-red-400 border-red-400/50 hover:bg-red-500/10"
        >
          <X className="w-4 h-4 mr-1" />
          {loading === 'cancel' ? '…' : 'Annuler'}
        </Button>
      )}
    </div>
  );
}
