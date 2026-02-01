'use client';

/**
 * Widget - Composant de base pour les widgets du dashboard.
 * Header optionnel + contenu.
 */

import { type ReactNode } from 'react';
import { Card } from '@/components/ui';
import { GripVertical } from 'lucide-react';

export interface WidgetProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Afficher la poignée de drag (pour le mode édition) */
  showHandle?: boolean;
}

export function Widget({ title, subtitle, icon, children, className, showHandle }: WidgetProps) {
  return (
    <Card className={`h-full flex flex-col overflow-hidden ${className ?? ''}`}>
      {(title || showHandle) && (
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          {showHandle && (
            <span className="cursor-move touch-none text-gray-500" title="Glisser pour déplacer">
              <GripVertical className="h-4 w-4" />
            </span>
          )}
          {icon && <span className="flex-shrink-0 text-[var(--color-primary,#3B82F6)]">{icon}</span>}
          <div className="min-w-0 flex-1">
            {title && <h3 className="font-semibold text-white truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">{children}</div>
    </Card>
  );
}
