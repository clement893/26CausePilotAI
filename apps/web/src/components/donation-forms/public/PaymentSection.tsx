'use client';

/**
 * PaymentSection - Étape 2.1.4
 * Section paiement : placeholder Stripe Elements + bouton PayPal.
 * L'intégration réelle Stripe/PayPal sera branchée lorsque les passerelles seront configurées.
 */

export interface PaymentSectionProps {
  primaryColor: string;
  buttonStyle: string;
  amount: number;
  currency: string;
  onSubmit: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function PaymentSection({
  primaryColor,
  buttonStyle,
  amount,
  currency,
  onSubmit,
  loading = false,
  disabled = false,
}: PaymentSectionProps) {
  const formatAmount = () =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency }).format(amount);

  const btnClass =
    buttonStyle === 'outline'
      ? 'border-2 bg-transparent text-white'
      : buttonStyle === 'gradient'
        ? 'border-0 text-white'
        : 'border-0 text-white';

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-white/90">Paiement</p>
      <div className="rounded-lg border border-white/20 bg-white/5 p-4">
        <p className="mb-4 text-sm text-white/70">
          Carte bancaire (Stripe) — à configurer côté backend.
        </p>
        <div className="mb-4 h-12 rounded-lg border border-dashed border-white/30 bg-white/5 flex items-center justify-center text-white/50 text-sm">
          Zone Stripe Elements
        </div>
        <p className="mb-4 text-sm text-white/70">Ou payer avec PayPal — à configurer.</p>
        <button
          type="button"
          className="rounded-lg border border-white/30 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          disabled
        >
          PayPal (bientôt)
        </button>
      </div>
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || loading || amount <= 0}
        className={`w-full rounded-lg py-3 text-base font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
        style={{
          borderColor: primaryColor,
          backgroundColor: buttonStyle === 'outline' ? 'transparent' : primaryColor,
          background: buttonStyle === 'gradient' ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` : undefined,
        }}
      >
        {loading ? 'Traitement…' : `Faire un don de ${formatAmount()}`}
      </button>
    </div>
  );
}
