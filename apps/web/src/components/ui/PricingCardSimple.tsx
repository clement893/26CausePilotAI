'use client';
import Link from 'next/link';
import { Button, Card, Badge } from '@/components/ui';
import { Check } from 'lucide-react';
import clsx from 'clsx';
interface Plan {
  id: string;
  name: string;
  price: number;
  period: 'month' | 'year';
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
}
interface PricingCardSimpleProps {
  plan: Plan;
  billingPeriod: 'month' | 'year';
  onSelect: (planId: string, period: 'month' | 'year') => void;
}
export default function PricingCardSimple({
  plan,
  billingPeriod,
  onSelect: _onSelect,
}: PricingCardSimpleProps) {
  const calculatePrice = () => {
    if (billingPeriod === 'year') {
      return Math.round((plan.price * 12 * 0.8) / 12);
    }
    return plan.price;
  };
  const calculateYearlyPrice = () => {
    if (billingPeriod === 'year') {
      return Math.round(plan.price * 12 * 0.8);
    }
    return null;
  };
  return (
    <Card
      variant={plan.popular ? 'gradient-border' : 'glass'}
      className={clsx(
        'relative hover-lift',
        plan.popular && 'border-2 shadow-xl scale-105'
      )}
    >
      {plan.popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <Badge variant="gradient-success" className="px-4 py-1">
            Le plus populaire
          </Badge>
        </div>
      )}
      <div className="p-8">
        <h2 className="text-2xl font-bold text-white text-white mb-2">{plan.name}</h2>
        <p className="text-gray-400 text-gray-400 mb-6">{plan.description}</p>
        <div className="mb-6">
          <span className="text-4xl font-bold text-white text-white">{calculatePrice()}€</span>
          <span className="text-gray-400 text-gray-400">/mois</span>
          {billingPeriod === 'year' && calculateYearlyPrice() && (
            <div className="text-sm text-gray-400 text-gray-400 mt-1">{calculateYearlyPrice()}€/an</div>
          )}
        </div>
        <Link href={`/subscriptions?plan=${plan.id}&period=${billingPeriod}`}>
          <Button
            className={clsx('w-full mb-6', plan.popular && 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600')}
            variant={plan.popular ? 'gradient' : 'outline'}
          >
            {plan.buttonText}
          </Button>
        </Link>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-green-400 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300 text-white">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
