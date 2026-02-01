'use client';

/**
 * SentimentBadge - Étape 5.2.2
 * Badge pour afficher le sentiment d'un commentaire (positif, négatif, neutre)
 */

import { Badge } from '@/components/ui';
import { Smile, Frown, Minus } from 'lucide-react';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export interface SentimentBadgeProps {
  sentiment: Sentiment;
  className?: string;
}

const sentimentConfig: Record<
  Sentiment,
  { label: string; variant: 'default' | 'error' | 'success' | 'info'; icon: typeof Smile }
> = {
  positive: {
    label: 'Positif',
    variant: 'success',
    icon: Smile,
  },
  negative: {
    label: 'Négatif',
    variant: 'error',
    icon: Frown,
  },
  neutral: {
    label: 'Neutre',
    variant: 'info',
    icon: Minus,
  },
};

export function SentimentBadge({ sentiment, className }: SentimentBadgeProps) {
  const config = sentimentConfig[sentiment];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`inline-flex items-center gap-1.5 ${className || ''}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
