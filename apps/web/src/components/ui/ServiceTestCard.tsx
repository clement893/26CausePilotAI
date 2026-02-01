'use client';
import Link from 'next/link';
import { ReactNode } from 'react';
import { clsx } from 'clsx';
interface ServiceTestCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  color: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';
}
const colorClasses = {
  primary: {
    border: 'border-gray-800 dark:border-primary-800',
    bg: 'glass-effect bg-[#13131A] dark:from-primary-900 dark:to-primary-800',
    hoverBorder: 'hover:border-blue-500 dark:hover:border-primary-600',
    iconBg: 'bg-gradient-to-r from-blue-500 to-purple-500',
    text: 'text-white dark:text-primary-100',
    textSecondary: 'text-gray-300 dark:text-primary-200',
    arrow: 'text-blue-400 dark:text-primary-400',
  },
  secondary: {
    border: 'border-gray-800 dark:border-secondary-800',
    bg: 'glass-effect bg-[#13131A] dark:from-secondary-900 dark:to-secondary-800',
    hoverBorder: 'hover:border-gray-700 dark:hover:border-secondary-600',
    iconBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
    text: 'text-white dark:text-secondary-100',
    textSecondary: 'text-gray-300 dark:text-secondary-200',
    arrow: 'text-gray-400 dark:text-secondary-400',
  },
  info: {
    border: 'border-gray-800 dark:border-info-800',
    bg: 'glass-effect bg-[#13131A] dark:from-info-900 dark:to-info-800',
    hoverBorder: 'hover:border-blue-500 dark:hover:border-info-600',
    iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    text: 'text-white dark:text-info-100',
    textSecondary: 'text-gray-300 dark:text-info-200',
    arrow: 'text-blue-400 dark:text-info-400',
  },
  success: {
    border: 'border-gray-800 dark:border-success-800',
    bg: 'glass-effect bg-[#13131A] dark:from-success-900 dark:to-success-800',
    hoverBorder: 'hover:border-green-500 dark:hover:border-success-600',
    iconBg: 'bg-gradient-to-r from-green-500 to-cyan-500',
    text: 'text-white dark:text-success-100',
    textSecondary: 'text-gray-300 dark:text-success-200',
    arrow: 'text-green-400 dark:text-success-400',
  },
  warning: {
    border: 'border-gray-800 dark:border-warning-800',
    bg: 'glass-effect bg-[#13131A] dark:from-warning-900 dark:to-warning-800',
    hoverBorder: 'hover:border-yellow-500 dark:hover:border-warning-600',
    iconBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    text: 'text-white dark:text-warning-100',
    textSecondary: 'text-gray-300 dark:text-warning-200',
    arrow: 'text-yellow-400 dark:text-warning-400',
  },
  error: {
    border: 'border-gray-800 dark:border-error-800',
    bg: 'glass-effect bg-[#13131A] dark:from-error-900 dark:to-error-800',
    hoverBorder: 'hover:border-red-500 dark:hover:border-error-600',
    iconBg: 'bg-gradient-to-r from-red-500 to-pink-500',
    text: 'text-white dark:text-error-100',
    textSecondary: 'text-gray-300 dark:text-error-200',
    arrow: 'text-red-400 dark:text-error-400',
  },
};
export default function ServiceTestCard({
  href,
  title,
  description,
  icon,
  color = 'info',
}: ServiceTestCardProps) {
  const colors = colorClasses[color];
  return (
    <Link
      href={href}
      className={clsx(
        'group p-6 border-2 rounded-lg hover:shadow-lg hover-lift transition-all duration-200',
        colors.border,
        colors.bg,
        colors.hoverBorder
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={clsx('w-12 h-12 rounded-lg flex items-center justify-center', colors.iconBg)}
        >
          <div className="w-6 h-6 text-white">{icon}</div>
        </div>
        <svg
          className={clsx('w-5 h-5 group-hover:translate-x-1 transition-transform', colors.arrow)}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
      <h3 className={clsx('text-xl font-bold mb-2', colors.text)}>{title}</h3>
      <p className={clsx('text-sm', colors.textSecondary)}>{description}</p>
    </Link>
  );
}
