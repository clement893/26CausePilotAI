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
    <Card className={`mb-6 border-success bg-success/10 animate-in fade-in slide-in-from-top-2 ${className || ''}`}>
      <div className="p-4 flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center flex-shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-success-foreground" />
        </div>
        <div className="flex-1">
          <p className="text-success font-medium">{message}</p>
          {details && (
            <p className="text-sm text-muted-foreground mt-1">{details}</p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={handleDismiss}
            className="text-success hover:text-success/80 transition-colors flex-shrink-0"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </Card>
  );
}
