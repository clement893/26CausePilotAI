/** * RBAC Demo Component * Demonstrates Role-Based Access Control functionality */ 'use client';
import Card from '@/components/ui/Card';
export interface RBACDemoProps {
  className?: string;
}
export default function RBACDemo({ className }: RBACDemoProps) {
  return (
    <Card variant="glass" className={`border border-gray-800 ${className}`}>
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">RBAC Demo</h2>
        <p className="text-gray-400">RBAC demo functionality coming soon.</p>
      </div>
    </Card>
  );
}
