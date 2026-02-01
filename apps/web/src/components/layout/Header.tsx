'use client';

import { useState, useEffect, useRef } from 'react';
import { Link } from '@/i18n/routing';
import { useAuthStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import Button from '../ui/Button';
import { ThemeToggleWithIcon } from '../ui/ThemeToggle';
import LanguageSwitcher from '../i18n/LanguageSwitcher';
import NotificationBellConnected from '../notifications/NotificationBellConnected';
import { Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

export default function Header() {
  const { isAuthenticated, user } = useAuthStore();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Focus management when menu opens
  useEffect(() => {
    if (mobileMenuOpen && mobileMenuRef.current) {
      const firstLink = mobileMenuRef.current.querySelector('a') as HTMLElement;
      firstLink?.focus();
    }
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 glass-effect bg-[#13131A]/80 bg-[#1C1C26]/80 backdrop-blur-md border-b border-gray-800 border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl sm:text-2xl font-bold text-white text-white">
            MODELE<span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">FULLSTACK</span>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Navigation principale"
          ></nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggleWithIcon />
            {isAuthenticated() ? (
              <>
                <NotificationBellConnected />
                <span className="text-sm text-gray-400 text-gray-400 hidden lg:block">
                  {user?.name || user?.email}
                </span>
                <Link href="/dashboard">
                  <Button size="sm" variant="ghost" className="text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]">
                    Dashboard
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={logout} className="border-gray-700 border-blue-500 text-gray-300 text-blue-400 hover:bg-[#1C1C26] hover:bg-blue-500/20">
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button size="sm" variant="ghost" className="text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm" variant="gradient">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggleWithIcon />
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26] focus:ring-primary min-h-[44px]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          id="mobile-menu"
          className={clsx(
            'md:hidden border-t border-gray-800 border-gray-800 overflow-hidden transition-all duration-300 ease-in-out bg-[#13131A] bg-[#13131A]',
            mobileMenuOpen ? 'max-h-[800px] opacity-100 py-4' : 'max-h-0 opacity-0 py-0'
          )}
          role="menu"
          aria-label="Menu mobile"
          aria-hidden={!mobileMenuOpen}
        >
          <nav className="flex flex-col gap-2">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-white text-white hover:text-blue-400 hover:text-blue-400 transition-colors px-4 py-3 min-h-[44px] flex items-center rounded-lg hover:bg-[#1C1C26] hover:bg-[#1C1C26]/50"
            >
              Accueil
            </Link>
            {isAuthenticated() && (
              <>
                <div className="px-4 py-3">
                  <NotificationBellConnected />
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white text-white hover:text-blue-400 hover:text-blue-400-400 transition-colors px-4 py-3 min-h-[44px] flex items-center rounded-lg hover:bg-[#1C1C26] hover:bg-[#1C1C26]/50"
                >
                  Dashboard
                </Link>
              </>
            )}
            <div className="border-t border-gray-800 border-gray-800 pt-4 mt-2">
              <div className="px-2 mb-4">
                <LanguageSwitcher />
              </div>
              {isAuthenticated() ? (
                <div className="flex flex-col gap-2 px-2">
                  <span className="text-sm text-gray-400 text-gray-400">{user?.name || user?.email}</span>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" variant="ghost" className="w-full justify-start text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]">
                      Dashboard
                    </Button>
                  </Link>
                  <Button size="sm" variant="outline" onClick={logout} className="w-full border-gray-700 border-blue-500 text-gray-300 text-blue-400 hover:bg-[#1C1C26] hover:bg-blue-500/20">
                    Déconnexion
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-2">
                  <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" variant="ghost" className="w-full text-gray-300 text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26]">
                      Connexion
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" variant="gradient" className="w-full">
                      Inscription
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
