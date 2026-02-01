'use client';

/**
 * AIGenerateButton - Bouton "Générer avec l'IA"
 * Bouton compact qui ouvre la modale de génération de contenu
 */

import { useState } from 'react';
import { Button } from '@/components/ui';
import { Sparkles } from 'lucide-react';
import { AIGenerationModal } from './AIGenerationModal';

export interface AIGenerateButtonProps {
  contentType?: 'email' | 'campaign_description' | 'general';
  context?: string;
  onGenerated: (content: string) => void;
  size?: 'sm' | 'md';
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
}

export function AIGenerateButton({
  contentType = 'general',
  context,
  onGenerated,
  size = 'sm',
  variant = 'outline',
  className,
}: AIGenerateButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInsert = (content: string) => {
    onGenerated(content);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        <Sparkles className="w-3 h-3 mr-1" />
        IA
      </Button>
      <AIGenerationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onInsert={handleInsert}
        contentType={contentType}
        context={context}
      />
    </>
  );
}
