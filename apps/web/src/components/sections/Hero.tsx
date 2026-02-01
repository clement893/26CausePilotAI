'use client';

import { useEffect, useState } from 'react';
import ButtonLink from '../ui/ButtonLink';
import Badge from '../ui/Badge';
import { clsx } from 'clsx';

export default function Hero() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check for prefers-reduced-motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    // Lazy load animations after initial render
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0F] via-[#13131A] to-[#1C1C26] overflow-hidden">
      {/* Background decoration - Optimized with will-change and reduced opacity */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={clsx(
            'absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10',
            !prefersReducedMotion && isLoaded && 'animate-blob',
            'will-change-transform'
          )}
          style={{
            ...(prefersReducedMotion ? { animation: 'none' } : { animationDelay: '0s' }),
          }}
          aria-hidden="true"
        />
        <div
          className={clsx(
            'absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10',
            !prefersReducedMotion && isLoaded && 'animate-blob',
            'will-change-transform'
          )}
          style={{
            ...(prefersReducedMotion ? { animation: 'none' } : { animationDelay: '6.67s' }),
          }}
          aria-hidden="true"
        />
        <div
          className={clsx(
            'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10',
            !prefersReducedMotion && isLoaded && 'animate-blob',
            'will-change-transform'
          )}
          style={{
            ...(prefersReducedMotion ? { animation: 'none' } : { animationDelay: '13.33s' }),
          }}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <Badge
          variant="info"
          className="mb-4 sm:mb-6 animate-fade-in"
          aria-label="Badge: Fundraising propulsé par l'IA"
        >
          ✨ Fundraising propulsé par l'IA
        </Badge>

        <h1
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-4 sm:mb-6 leading-[1.1] px-2 animate-fade-in"
          style={{ animationDelay: '0.1s' }}
        >
          <span className="block mb-2">CAUSE PILOT</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            AI-POWERED FUNDRAISING
          </span>
        </h1>

        <p
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-2 font-medium animate-fade-in"
          style={{ animationDelay: '0.2s' }}
        >
          La plateforme intelligente qui transforme votre manière de collecter des fonds. 
          Gérez vos donateurs, optimisez vos campagnes et maximisez votre impact avec l'intelligence artificielle.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 sm:mb-16 px-2">
          <ButtonLink href="/auth/register" size="lg" variant="primary">
            Démarrer gratuitement
          </ButtonLink>
          <ButtonLink href="/pricing" size="lg" variant="secondary">
            Voir les tarifs
          </ButtonLink>
          <ButtonLink href="/dashboard" size="lg" variant="secondary">
            Voir une démo
          </ButtonLink>
          <ButtonLink href="/auth/login" size="lg" variant="outline">
            Se connecter
          </ButtonLink>
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-400 px-2"
          role="list"
          aria-label="Caractéristiques principales"
        >
          <div className="flex items-center gap-2" role="listitem">
            <svg
              className="w-5 h-5 text-secondary-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>IA Avancée</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <svg
              className="w-5 h-5 text-secondary-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Conformité RGPD</span>
          </div>
          <div className="flex items-center gap-2" role="listitem">
            <svg
              className="w-5 h-5 text-secondary-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Support 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
