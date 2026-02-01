'use client';

/**
 * Page Suggestions de Segments - Étape 5.1.2
 * Affiche les suggestions de segments générées par l'IA/clustering
 */

import { useState, useEffect } from 'react';
import { Container, Card, Button, LoadingSkeleton, useToast } from '@/components/ui';
import { Sparkles, RefreshCw, ArrowLeft, Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { listSegmentSuggestions } from '@/lib/api/donors';
import { createSegmentFromSuggestion } from '@/app/actions/segments/createSegmentFromSuggestion';
import { createSegment } from '@/lib/api/donors';
import { SegmentSuggestionCard } from '@/components/segments/SegmentSuggestionCard';
import type { SegmentSuggestion } from '@modele/types';

export default function SegmentSuggestionsPage() {
  const { activeOrganization, isLoading: orgLoading } = useOrganization();
  const { success: showSuccessToast, error: showErrorToast, info } = useToast();
  
  const [suggestions, setSuggestions] = useState<SegmentSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [creatingSegmentIds, setCreatingSegmentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (activeOrganization && !orgLoading) {
      loadSuggestions();
    }
  }, [activeOrganization, orgLoading]);

  const loadSuggestions = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const response = await listSegmentSuggestions({
        organizationId: activeOrganization.id,
        pageSize: 100,
        includeAccepted: true,
      });
      setSuggestions(response.items);
    } catch (error) {
      console.error('Error loading segment suggestions:', error);
      showErrorToast('Erreur lors du chargement des suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSegment = async (suggestionId: string) => {
    if (!activeOrganization) return;

    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    try {
      setCreatingSegmentIds(prev => new Set(prev).add(suggestionId));
      info('Création du segment...');

      // Créer le segment via l'API
      await createSegment(activeOrganization.id, {
        name: suggestion.name,
        description: suggestion.description,
        criteria: suggestion.criteria,
        is_automatic: true,
        color: '#8B5CF6', // Couleur par défaut pour les segments suggérés
      });

      // Marquer la suggestion comme acceptée
      await createSegmentFromSuggestion(activeOrganization.id, suggestionId);

      showSuccessToast(`Segment "${suggestion.name}" créé avec succès`);
      
      // Recharger les suggestions
      await loadSuggestions();
    } catch (error) {
      console.error('Error creating segment from suggestion:', error);
      showErrorToast('Erreur lors de la création du segment');
    } finally {
      setCreatingSegmentIds(prev => {
        const next = new Set(prev);
        next.delete(suggestionId);
        return next;
      });
    }
  };

  if (orgLoading || isLoading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="mb-8 h-16 animate-pulse rounded-lg bg-[#1C1C26]/60" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </Container>
    );
  }

  if (!activeOrganization) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="text-center py-12">
          <p className="text-destructive">Veuillez sélectionner une organisation</p>
        </div>
      </Container>
    );
  }

  const pendingSuggestions = suggestions.filter(s => !s.is_accepted);
  const acceptedSuggestions = suggestions.filter(s => s.is_accepted);

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8">
        <Link href="/dashboard/base-donateur/segments" className="inline-block mb-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux segments
          </Button>
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Suggestions de Segments
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Segments suggérés par l&apos;IA basés sur l&apos;analyse de vos donateurs
        </p>
      </div>

      {pendingSuggestions.length === 0 && acceptedSuggestions.length === 0 && (
        <Card className="p-12 text-center" elevated>
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Aucune suggestion disponible</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Exécutez le script de génération de suggestions pour créer des segments basés sur le clustering de vos donateurs.
          </p>
          <div className="bg-[#1C1C26] rounded-lg p-4 text-left max-w-lg mx-auto">
            <p className="text-sm text-gray-300 mb-2 font-mono">
              pnpm tsx scripts/generate-segment-suggestions.ts {activeOrganization.id}
            </p>
          </div>
        </Card>
      )}

      {pendingSuggestions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Suggestions disponibles ({pendingSuggestions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingSuggestions.map((suggestion) => (
              <SegmentSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onCreateSegment={handleCreateSegment}
                isCreating={creatingSegmentIds.has(suggestion.id)}
              />
            ))}
          </div>
        </div>
      )}

      {acceptedSuggestions.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Suggestions acceptées ({acceptedSuggestions.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acceptedSuggestions.map((suggestion) => (
              <SegmentSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                onCreateSegment={() => {}}
                isCreating={false}
              />
            ))}
          </div>
        </div>
      )}

      {pendingSuggestions.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={loadSuggestions}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </div>
      )}
    </Container>
  );
}
