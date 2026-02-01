'use client';

/**
 * Subscription Badge Component
 * Étape 7.1.2 - Gestion des organisations (Super Admin)
 */


interface SubscriptionBadgeProps {
  plan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL';
  className?: string;
}

const PLAN_COLORS: Record<string, { bg: string; text: string }> = {
  FREE: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
  STARTER: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  PROFESSIONAL: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
  ENTERPRISE: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: 'bg-green-500/20', text: 'text-green-400' },
  TRIAL: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
  CANCELED: { bg: 'bg-red-500/20', text: 'text-red-400' },
  EXPIRED: { bg: 'bg-gray-500/20', text: 'text-gray-400' },
};

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Gratuit',
  STARTER: 'Starter',
  PROFESSIONAL: 'Professionnel',
  ENTERPRISE: 'Enterprise',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actif',
  TRIAL: 'Essai',
  CANCELED: 'Annulé',
  EXPIRED: 'Expiré',
};

export function SubscriptionBadge({ plan, status, className }: SubscriptionBadgeProps) {
  const planColor = PLAN_COLORS[plan] ?? PLAN_COLORS.FREE;
  const statusColor = STATUS_COLORS[status] ?? STATUS_COLORS.ACTIVE;

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${planColor.bg} ${planColor.text}`}
      >
        {PLAN_LABELS[plan] || plan}
      </span>
      <span
        className={`px-2 py-1 rounded text-xs font-medium ${statusColor.bg} ${statusColor.text}`}
      >
        {STATUS_LABELS[status] || status}
      </span>
    </div>
  );
}
