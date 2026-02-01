'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
interface InternalLayoutProps {
  children: React.ReactNode;
}
export default function InternalLayout({ children }: InternalLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-[#0A0A0F] dark:bg-muted">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64 lg:ml-72 xl:ml-80">
        <header className="glass-effect bg-[#13131A] dark:bg-background border-b border-gray-800 dark:border-border h-16 flex items-center justify-between px-4 md:px-6">
          {/* Hamburger Menu Button (Mobile only) - UX/UI improvements Batch 17 */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-white dark:text-foreground hover:bg-[#1C1C26] dark:hover:bg-muted transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Ouvrir le menu"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4"> </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0A0A0F] dark:bg-background"> {children} </main>
      </div>
      {/* Mobile Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
