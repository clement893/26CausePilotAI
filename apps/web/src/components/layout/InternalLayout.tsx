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
    <div className="flex h-screen bg-[#0A0A0F] bg-[#1C1C26]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64 lg:ml-72 xl:ml-80">
        <header className="glass-effect bg-[#13131A] bg-[#0A0A0F] border-b border-gray-800 border-gray-800 h-16 flex items-center justify-between px-4 md:px-6">
          {/* Hamburger Menu Button (Mobile only) - UX/UI improvements Batch 17 */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-white text-white hover:bg-[#1C1C26] hover:bg-[#1C1C26] transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Ouvrir le menu"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4"> </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#0A0A0F] bg-[#0A0A0F]"> {children} </main>
      </div>
      {/* Mobile Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  );
}
