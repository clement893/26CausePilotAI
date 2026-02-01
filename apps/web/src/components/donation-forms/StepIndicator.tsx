'use client';

/**
 * StepIndicator - Étape 2.1.3
 * Stepper en 6 étapes (cliquable pour naviguer).
 */

import { clsx } from 'clsx';
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Informations' },
  { id: 2, label: 'Montants' },
  { id: 3, label: 'Champs' },
  { id: 4, label: 'Design' },
  { id: 5, label: 'Messages' },
  { id: 6, label: 'Paramètres' },
] as const;

export interface StepIndicatorProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export default function StepIndicator({ currentStep, onStepClick, className }: StepIndicatorProps) {
  return (
    <nav aria-label="Étapes du formulaire" className={clsx('flex flex-col gap-1', className)}>
      {STEPS.map((step, index) => {
        const stepNum = index + 1;
        const isActive = currentStep === stepNum;
        const isCompleted = currentStep > stepNum;
        const isClickable = !!onStepClick;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick?.(stepNum)}
            disabled={!isClickable}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
              isClickable && 'hover:bg-white/5 cursor-pointer',
              !isClickable && 'cursor-default',
              isActive && 'bg-white/10 text-white',
              isCompleted && !isActive && 'text-white/80',
              !isActive && !isCompleted && 'text-white/60'
            )}
            aria-current={isActive ? 'step' : undefined}
          >
            <span
              className={clsx(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium',
                isActive && 'border-[var(--color-primary,#3B82F6)] bg-[var(--color-primary,#3B82F6)] text-white',
                isCompleted && 'border-green-500 bg-green-500 text-white',
                !isActive && !isCompleted && 'border-white/30 bg-transparent'
              )}
            >
              {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
            </span>
            <span className="font-medium">{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
