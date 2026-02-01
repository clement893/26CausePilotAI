'use client';

/**
 * AIGenerationModal - Étape 5.2.1
 * Modale qui permet à l'utilisateur de donner un prompt et d'afficher le contenu généré
 */

import { useState } from 'react';
import { Modal, Button, Textarea, LoadingSkeleton, Alert } from '@/components/ui';
import { Sparkles, Copy, Check } from 'lucide-react';
import { generateContent, type GenerateContentParams } from '@/app/actions/ai/generateContent';
import { logger } from '@/lib/logger';

export interface AIGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (content: string) => void;
  contentType?: 'email' | 'campaign_description' | 'general';
  context?: string;
  initialPrompt?: string;
}

export function AIGenerationModal({
  isOpen,
  onClose,
  onInsert,
  contentType = 'general',
  context,
  initialPrompt = '',
}: AIGenerationModalProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer un prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const params: GenerateContentParams = {
        prompt: prompt.trim(),
        contentType,
        context,
      };

      const result = await generateContent(params);

      if (result.success && result.content) {
        setGeneratedContent(result.content);
      } else {
        setError(result.error || 'Erreur lors de la génération');
      }
    } catch (err) {
      logger.error('Erreur lors de la génération de contenu', err);
      setError('Une erreur est survenue lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = () => {
    if (generatedContent) {
      onInsert(generatedContent);
      handleClose();
    }
  };

  const handleCopy = async () => {
    if (generatedContent) {
      try {
        await navigator.clipboard.writeText(generatedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        logger.error('Erreur lors de la copie', err);
      }
    }
  };

  const handleClose = () => {
    setPrompt(initialPrompt);
    setGeneratedContent(null);
    setError(null);
    setCopied(false);
    onClose();
  };

  const getPlaceholder = () => {
    switch (contentType) {
      case 'email':
        return 'Ex: Écris un email de remerciement pour un don de 100$...';
      case 'campaign_description':
        return 'Ex: Décris une campagne de collecte de fonds pour aider les sans-abri...';
      default:
        return 'Décris le contenu que tu souhaites générer...';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Générer du contenu avec l'IA"
      size="lg"
    >
      <div className="space-y-6">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Votre prompt
          </label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={getPlaceholder()}
            rows={4}
            className="w-full"
            disabled={isGenerating}
          />
          {context && (
            <p className="text-xs text-gray-400 mt-1">
              Contexte: {context}
            </p>
          )}
        </div>

        {/* Generate Button */}
        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {isGenerating ? 'Génération en cours...' : 'Générer avec l\'IA'}
        </Button>

        {/* Error */}
        {error && (
          <Alert variant="error" title="Erreur">
            {error}
          </Alert>
        )}

        {/* Loading */}
        {isGenerating && (
          <div className="space-y-3">
            <LoadingSkeleton variant="card" count={3} />
            <p className="text-sm text-gray-400 text-center">
              L'IA génère votre contenu...
            </p>
          </div>
        )}

        {/* Generated Content */}
        {generatedContent && !isGenerating && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-white">
                Contenu généré
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier
                  </>
                )}
              </Button>
            </div>
            <div className="p-4 bg-[#1C1C26] rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
              <div className="prose prose-invert max-w-none text-sm text-gray-300 whitespace-pre-wrap">
                {generatedContent}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                onClick={handleInsert}
                className="flex-1"
              >
                Insérer dans l'éditeur
              </Button>
              <Button
                variant="outline"
                onClick={handleClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
