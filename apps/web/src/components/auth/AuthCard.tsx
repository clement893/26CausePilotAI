/**
 * AuthCard - Étape 1.1.3
 * Card réutilisable pour pages d'auth (glassmorphism, logo, contenu)
 */

import { type ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
  logo?: ReactNode;
  className?: string;
}

export function AuthCard({ children, logo, className = '' }: AuthCardProps) {
  return (
    <div
      className={`glass-effect w-full max-w-md rounded-2xl border border-white/10 p-8 shadow-xl sm:p-10 ${className}`}
      style={{
        background: 'rgba(28, 28, 38, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {logo && (
        <div className="mb-6 flex justify-center">
          {logo}
        </div>
      )}
      {children}
    </div>
  );
}
