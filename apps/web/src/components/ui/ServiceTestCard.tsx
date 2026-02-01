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
    border: 'border-blue-500/30',
    bg: 'glass-effect bg-[#13131A]',
    hoverBorder: 'hover:border-blue-500',
    iconBg: 'bg-gradient-to-r from-blue-500 to-purple-500',
    text: 'text-blue-300',
    textSecondary: 'text-blue-200',
    arrow: 'text-blue-400',
  },
  secondary: {
    border: 'border-green-500/30',
    bg: 'glass-effect bg-[#13131A]',
    hoverBorder: 'hover:border-green-500',
    iconBg: 'bg-gradient-to-r from-gray-500 to-gray-600',
    text: 'text-green-300',
    textSecondary: 'text-green-200',
    arrow: 'text-green-400',
  },
  info: {
    border: 'border-blue-500/30',
    bg: 'glass-effect bg-[#13131A]',
    hoverBorder: 'hover:border-blue-500',
    iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    text: 'text-blue-300',
    textSecondary: 'text-blue-200',
    arrow: 'text-blue-400',
  },
  success: {
    border: 'border-green-500/30',
    bg: 'glass-effect bg-[#13131A]',
    hoverBorder: 'hover:border-green-500',
    iconBg: 'bg-gradient-to-r from-green-500 to-cyan-500',
    text: 'text-green-300',
    textSecondary: 'text-green-200',
    arrow: 'text-green-400',
  },
  warning: {
    border: 'border-yellow-500/30',
    bg: 'glass-effect bg-[#13131A]',
    hoverBorder: 'hover:border-yellow-500',
    iconBg: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    text: 'text-yellow-300',
    textSecondary: 'text-yellow-200',
    arrow: 'text-yellow-400',
  },
  error: {
    border: 'border-red-500/30',
    bg: 'glass-effect bg-[#13131A]',
    hoverBorder: 'hover:border-red-500',
    iconBg: 'bg-gradient-to-r from-red-500 to-pink-500',
    text: 'text-red-300',
    textSecondary: 'text-red-200',
    arrow: 'text-red-400',
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
