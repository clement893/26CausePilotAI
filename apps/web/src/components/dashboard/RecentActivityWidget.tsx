'use client';

/**
 * RecentActivityWidget - Liste des dernières activités (dons, inscriptions, etc.).
 */

import { type ReactNode } from 'react';
import { Widget } from './Widget';
import { Link } from '@/i18n/routing';

export interface ActivityItem {
  id: string;
  type: 'donation' | 'signup' | 'campaign' | 'form';
  title: string;
  description?: string;
  date: string;
  href?: string;
}

export interface RecentActivityWidgetProps {
  title?: string;
  items: ActivityItem[];
  icon?: ReactNode;
  showHandle?: boolean;
  emptyMessage?: string;
}

export function RecentActivityWidget({
  title = 'Activité récente',
  items,
  icon,
  showHandle,
  emptyMessage = 'Aucune activité récente',
}: RecentActivityWidgetProps) {
  return (
    <Widget title={title} icon={icon} showHandle={showHandle}>
      <ul className="space-y-3">
        {items.length === 0 ? (
          <li className="text-sm text-gray-400 py-4 text-center">{emptyMessage}</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="border-b border-white/5 last:border-0 pb-3 last:pb-0">
              {item.href ? (
                <Link
                  href={item.href}
                  className="block hover:bg-white/5 rounded-lg -mx-2 px-2 py-1 transition-colors"
                >
                  <p className="font-medium text-white text-sm">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                </Link>
              ) : (
                <>
                  <p className="font-medium text-white text-sm">{item.title}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                </>
              )}
            </li>
          ))
        )}
      </ul>
    </Widget>
  );
}
