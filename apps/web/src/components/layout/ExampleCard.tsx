import { ReactNode } from 'react';
import { Card } from '@/components/ui';
import { clsx } from 'clsx';

interface ExampleCardProps {
  title: string;
  children: ReactNode;
  description?: string;
  className?: string;
}

export default function ExampleCard({ title, children, description, className }: ExampleCardProps) {
  return (
    <Card variant="glass" className={clsx('border border-gray-800 border-gray-800 hover-lift', className)}>
      <h3 className="text-lg font-semibold mb-2 text-white text-white">{title}</h3>
      {description && <p className="text-sm text-gray-400 text-gray-400 mb-4">{description}</p>}
      {children}
    </Card>
  );
}
