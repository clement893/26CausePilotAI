/**
 * Tabs Component
 *
 * Tab navigation component for ERP applications
 * Supports both simple API (tabs prop) and compound API (TabList, Tab, TabPanels, TabPanel)
 */
'use client';

import { type ReactNode, useState, createContext, useContext } from 'react';
import { clsx } from 'clsx';

// Context for compound API
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

function useTabsContext() {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs component');
  }
  return context;
}

// Simple API Types
export interface Tab {
  id: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

export interface TabsProps {
  children?: ReactNode;
  tabs?: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  variant?: 'default' | 'pills' | 'underline';
}

// Compound API Components
export interface TabListProps {
  children: ReactNode;
  className?: string;
}

export interface TabProps {
  children: ReactNode;
  value: string;
  disabled?: boolean;
  className?: string;
}

export interface TabPanelsProps {
  children: ReactNode;
  className?: string;
}

export interface TabPanelProps {
  children: ReactNode;
  value: string;
  className?: string;
}

// Main Tabs Component
export default function Tabs({
  children,
  tabs,
  defaultTab,
  onChange,
  className,
  variant = 'default',
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab ?? tabs?.[0]?.id ?? '');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  // Simple API: render with tabs prop
  if (tabs) {
    const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

    const variantClasses = {
      default: {
        container: 'border-b border-gray-800 border-gray-800',
        tab: (isActive: boolean) =>
          clsx(
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            isActive
              ? 'border-blue-500 border-blue-500 text-white text-blue-400 bg-gradient-to-r from-blue-500/10 to-purple-500/10'
              : 'border-transparent text-gray-400 text-gray-400 hover:text-white hover:text-white hover:border-gray-700 hover:border-gray-800'
          ),
      },
      pills: {
        container: 'flex gap-2',
        tab: (isActive: boolean) =>
          clsx(
            'px-4 py-2 text-sm font-medium rounded-full transition-colors',
            isActive
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 bg-blue-500 text-white text-white'
              : 'bg-[#1C1C26] bg-[#1C1C26] text-gray-400 text-gray-400 hover:bg-[#252532] hover:bg-[#1C1C26]/80'
          ),
      },
      underline: {
        container: 'border-b border-gray-800 border-gray-800',
        tab: (isActive: boolean) =>
          clsx(
            'px-4 py-2 text-sm font-medium transition-colors relative',
            isActive
              ? 'text-white text-blue-400'
              : 'text-gray-400 text-gray-400 hover:text-white hover:text-white',
            isActive &&
              'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-blue-500 after:to-purple-500 after:bg-blue-500'
          ),
      },
    };

    const classes = variantClasses[variant];

    return (
      <div className={clsx('w-full', className)}>
        <div className={clsx('flex', classes.container)}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={clsx(
                classes.tab(activeTab === tab.id),
                tab.disabled && 'opacity-50 cursor-not-allowed',
                'flex items-center gap-2'
              )}
            >
              {tab.icon && <span>{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={clsx(
                    'ml-1 px-2 py-0.5 text-xs rounded-full',
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 bg-blue-500/20 text-white text-blue-300'
                      : 'bg-[#1C1C26] bg-[#1C1C26] text-gray-400 text-gray-400'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4">{activeTabContent}</div>
      </div>
    );
  }

  // Compound API: render with children
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className={clsx('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// TabList Component
export function TabList({ children, className }: TabListProps) {
  return (
    <div className={clsx('flex border-b border-gray-800 border-gray-800 overflow-x-auto', className)}>{children}</div>
  );
}

// Tab Component
export function Tab({ children, value, disabled, className }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => !disabled && setActiveTab(value)}
      disabled={disabled}
      className={clsx(
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0',
        isActive
          ? 'border-blue-500 border-blue-500 text-white text-blue-400 bg-gradient-to-r from-blue-500/10 to-purple-500/10'
          : 'border-transparent text-gray-400 text-gray-400 hover:text-white hover:text-white hover:border-gray-700 hover:border-gray-800',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}

// TabPanels Component
export function TabPanels({ children, className }: TabPanelsProps) {
  return <div className={clsx('mt-4', className)}>{children}</div>;
}

// TabPanel Component
export function TabPanel({ children, value, className }: TabPanelProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) {
    return null;
  }
  return <div className={className}>{children}</div>;
}
