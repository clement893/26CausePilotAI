'use client';

/**
 * PasswordStrengthIndicator - Étape 1.1.3
 * Barre de progression (rouge → jaune → vert) + label Faible / Moyen / Fort
 */

export type PasswordStrength = 'weak' | 'medium' | 'strong';

function getStrength(password: string): PasswordStrength {
  if (!password || password.length < 8) return 'weak';
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 2;
  if (score < 4) return 'weak';
  if (score < 6) return 'medium';
  return 'strong';
}

const labels: Record<PasswordStrength, string> = {
  weak: 'Faible',
  medium: 'Moyen',
  strong: 'Fort',
};

const colors: Record<PasswordStrength, string> = {
  weak: 'bg-red-500',
  medium: 'bg-yellow-500',
  strong: 'bg-green-500',
};

const widths: Record<PasswordStrength, string> = {
  weak: 'w-1/3',
  medium: 'w-2/3',
  strong: 'w-full',
};

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className={className}>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-[var(--text-secondary,#A0A0B0)]">Force du mot de passe</span>
        <span
          className={
            strength === 'weak'
              ? 'text-red-500'
              : strength === 'medium'
                ? 'text-yellow-500'
                : 'text-green-500'
          }
        >
          {labels[strength]}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--background-elevated,#252532)]">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colors[strength]} ${widths[strength]}`}
        />
      </div>
    </div>
  );
}

export { getStrength };
