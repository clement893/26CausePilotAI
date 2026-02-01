'use client';

/**
 * SegmentSuggestionCard - Étape 5.1.2
 * Carte affichant une suggestion de segment avec description, nombre de donateurs, et bouton "Créer le segment"
 */

import { Card, Button, Badge } from '@/components/ui';
import { Users, Sparkles, CheckCircle2 } from 'lucide-react';
import type { SegmentSuggestion } from '@modele/types';

export interface SegmentSuggestionCardProps {
  suggestion: SegmentSuggestion;
  onCreateSegment: (suggestionId: string) => void;
  isCreating?: boolean;
  className?: string;
}

export function SegmentSuggestionCard({
  suggestion,
  onCreateSegment,
  isCreating = false,
  className,
}: SegmentSuggestionCardProps) {
  const confidencePercentage = suggestion.confidence
    ? Math.round(suggestion.confidence * 100)
    : null;

  return (
    <Card className={`p-6 hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{suggestion.name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{suggestion.description}</p>
          </div>
        </div>
        {suggestion.is_accepted && (
          <Badge variant="success" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Accepté
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">
            <span className="font-semibold text-white">{suggestion.donor_count}</span> donateurs
          </span>
        </div>
        {confidencePercentage !== null && (
          <Badge variant="info" className="text-xs">
            Confiance: {confidencePercentage}%
          </Badge>
        )}
      </div>

      {suggestion.cluster_id && (
        <div className="mb-4 p-3 bg-[#1C1C26] rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Critères de segmentation:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(suggestion.criteria).map(([key, value]) => (
              <Badge key={key} variant="default" className="text-xs">
                {key}: {String(value)}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {!suggestion.is_accepted && (
        <Button
          variant="primary"
          onClick={() => onCreateSegment(suggestion.id)}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Création...' : 'Créer le segment'}
        </Button>
      )}

      {suggestion.is_accepted && suggestion.accepted_at && (
        <div className="text-xs text-gray-500 text-center">
          Accepté le {new Date(suggestion.accepted_at).toLocaleDateString('fr-CA')}
        </div>
      )}
    </Card>
  );
}
