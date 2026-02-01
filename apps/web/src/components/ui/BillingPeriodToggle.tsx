'use client';
import { Button, Badge } from '@/components/ui';
interface BillingPeriodToggleProps {
  value: 'month' | 'year';
  onChange: (value: 'month' | 'year') => void;
}
export default function BillingPeriodToggle({ value, onChange }: BillingPeriodToggleProps) {
  return (
    <div className="inline-flex items-center glass-effect bg-[#13131A] dark:bg-background rounded-lg p-1 shadow-md border border-gray-800 dark:border-border">
      <Button
        onClick={() => onChange('month')}
        variant={value === 'month' ? 'gradient' : 'ghost'}
        size="md"
        className="px-6"
      >
        Mensuel
      </Button>
      <Button
        onClick={() => onChange('year')}
        variant={value === 'year' ? 'gradient' : 'ghost'}
        size="md"
        className="px-6"
      >
        Annuel
        <Badge variant="gradient-success" className="ml-2">
          -20%
        </Badge>
      </Button>
    </div>
  );
}
