/**
 * SuccessAlert Component
 * 
 * Reusable success alert component with consistent styling
 */

'use client';

import { Card } from '@/components/ui';
import { CheckCircle2, X } from 'lucide-react';
import { useState } from 'react';

interface SuccessAlertProps {
  message: string;
  details?: string;
  onDismiss?: () => void;
  className?: string;
}

export function SuccessAlert({ message, details, onDismiss, className }: SuccessAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <Card variant="glass" className={`mb-6 glass-effect bg-green-500/10 border border-green-500/50 animate-in fade-in slide-in-from-top-2 ${className || ''}`}>
      <div className="p-4 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-green-400 font-medium">{message}</p>
          {details && (
            <p className="text-sm text-gray-400 mt-1">{details}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="text-green-400 hover:text-green-300 transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </Card>
  );
}
