'use client';
import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: 'completed' | 'current' | 'pending';
  icon?: ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'default';
}
interface TimelineProps {
  items: TimelineItem[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}
const statusIcons = { completed: CheckCircle2, current: Clock, pending: Circle };
const colorClasses = {
  primary: 'text-blue-500 text-blue-400',
  success: 'text-green-500 text-green-400',
  warning: 'text-yellow-500 text-yellow-400',
  error: 'text-red-500 text-red-400',
  default: 'text-gray-400 text-gray-400',
};
export default function Timeline({ items, orientation = 'vertical', className }: TimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div className={clsx('flex items-start gap-4 overflow-x-auto pb-4', className)}>
        {' '}
        {items.map((item, index) => {
          const StatusIcon = statusIcons[item.status || 'pending'];
          const colorClass = colorClasses[item.color || 'default'];
          const isCompleted = item.status === 'completed';
          const isCurrent = item.status === 'current';
          return (
            <div key={item.id} className="flex flex-col items-center min-w-[120px]">
              {' '}
              <div className="flex items-center w-full">
                {' '}
                {index > 0 && (
                  <div
                    className={clsx(
                      'h-0.5 flex-1',
                      isCompleted ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-[#1C1C26] bg-[#1C1C26]'
                    )}
                  />
                )}
                <div
                  className={clsx(
                    'flex items-center justify-center w-8 h-8 rounded-full border-2',
                    isCompleted
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500'
                      : isCurrent
                        ? 'bg-[#13131A] bg-[#13131A] border-blue-500'
                        : 'bg-[#13131A] bg-[#13131A] border-gray-800',
                    colorClass
                  )}
                >
                  {' '}
                  {item.icon || <StatusIcon className="w-4 h-4" />}{' '}
                </div>{' '}
                {index < items.length - 1 && (
                  <div
                    className={clsx(
                      'h-0.5 flex-1',
                      isCompleted ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-[#1C1C26] bg-[#1C1C26]'
                    )}
                  />
                )}
              </div>{' '}
              <div className="mt-2 text-center">
                {' '}
                <div
                  className={clsx(
                    'text-sm font-medium',
                    isCurrent ? 'text-white text-white' : 'text-gray-400 text-gray-400'
                  )}
                >
                  {item.title}
                </div>
                {item.description && (
                  <div className="text-xs text-gray-400 mt-1">{item.description}</div>
                )}
                {item.timestamp && (
                  <div className="text-xs text-gray-400 mt-1">{item.timestamp}</div>
                )}
              </div>{' '}
            </div>
          );
        })}{' '}
      </div>
    );
  }
  return (
    <div className={clsx('relative', className)}>
      {' '}
      {items.map((item, index) => {
        const StatusIcon = statusIcons[item.status || 'pending'];
        const colorClass = colorClasses[item.color || 'default'];
        const isCompleted = item.status === 'completed';
        const isCurrent = item.status === 'current';
        const isLast = index === items.length - 1;
        return (
          <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0">
            {' '}
            {/* Line */}
            {!isLast && <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-[#1C1C26]" />}
            {!isLast && isCompleted && (
              <div className="absolute left-4 top-8 h-8 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500" />
            )}
            {/* Icon */}
            <div
              className={clsx(
                'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0',
                isCompleted
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-500'
                  : isCurrent
                    ? 'bg-[#13131A] bg-[#13131A] border-blue-500'
                    : 'bg-[#13131A] bg-[#13131A] border-gray-800',
                colorClass
              )}
            >
              {item.icon || <StatusIcon className="w-4 h-4" />}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div
                className={clsx(
                  'text-base font-medium',
                  isCurrent ? 'text-white text-white' : 'text-gray-300 text-white'
                )}
              >
                {item.title}
              </div>
              {item.description && (
                <div className="text-sm text-gray-400 mt-1">{item.description}</div>
              )}
              {item.timestamp && (
                <div className="text-xs text-gray-400 mt-1">{item.timestamp}</div>
              )}
            </div>{' '}
          </div>
        );
      })}{' '}
    </div>
  );
}
