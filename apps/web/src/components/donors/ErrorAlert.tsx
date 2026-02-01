/**
 * ErrorAlert Component
 * 
 * Reusable error alert component with consistent styling and behavior
 */

'use client';

import { Card } from '@/components/ui';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface ErrorAlertProps {
  message: string;
  details?: string;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorAlert({ message, details, onDismiss, className }: ErrorAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <Card variant="glass" className={`mb-6 glass-effect bg-red-500/10 border border-red-500/50 animate-in fade-in slide-in-from-top-2 ${className || ''}`}>
      <div className="p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-400 font-medium">{message}</p>
          {details && (
            <p className="text-sm text-gray-400 mt-1">{details}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </Card>
  );
}
