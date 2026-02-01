/**
 * Integration List Component
 * List of available integrations
 */
'use client';

import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { ColorVariant } from '@/components/ui/types';
import { Search, Plus, CheckCircle, XCircle, Settings, ExternalLink } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon?: string;
  category: 'payment' | 'communication' | 'storage' | 'analytics' | 'marketing' | 'other';
  status: 'available' | 'connected' | 'disconnected' | 'pending';
  connectedAt?: string;
  configUrl?: string;
  websiteUrl?: string;
}

export interface IntegrationListProps {
  integrations: Integration[];
  onConnect?: (integration: Integration) => void | Promise<void>;
  onDisconnect?: (integration: Integration) => void | Promise<void>;
  onConfigure?: (integration: Integration) => void;
  className?: string;
}

const categoryColors: Record<Integration['category'], ColorVariant> = {
  payment: 'success',
  communication: 'info',
  storage: 'warning',
  analytics: 'info', // Changed from 'primary' to 'info' since Badge doesn't support 'primary'
  marketing: 'error',
  other: 'default',
};

export default function IntegrationList({
  integrations,
  onConnect,
  onDisconnect,
  onConfigure,
  className,
}: IntegrationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredIntegrations = useMemo(() => {
    let filtered = integrations;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(term) ||
          i.description.toLowerCase().includes(term) ||
          i.category.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((i) => i.category === categoryFilter);
    }

    return filtered;
  }, [integrations, searchTerm, categoryFilter]);

  const categories = useMemo(() => {
    const cats = new Set(integrations.map((i) => i.category));
    return Array.from(cats);
  }, [integrations]);

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="success">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Connected
            </span>
          </Badge>
        );
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'disconnected':
        return (
          <Badge variant="error">
            <span className="flex items-center gap-1">
              <XCircle className="w-3 h-3" />
              Disconnected
            </span>
          </Badge>
        );
      default:
        return <Badge variant="default">Available</Badge>;
    }
  };

  return (
    <Card variant="glass" className={clsx('border border-gray-800', className)}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-400" />
            Integrations
          </h3>
          <div className="text-sm text-gray-400">
            {filteredIntegrations.length} of {integrations.length} integrations
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <div className="form-input-glow">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search integrations..."
                  className={clsx(
                    'w-full pl-10 pr-4 py-2 border rounded-lg text-sm',
                    'bg-[#1C1C26]',
                    'text-white',
                    'border-gray-700',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500'
                  )}
                />
              </div>
            </div>
          </div>
          <div className="form-input-glow">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={clsx(
                'px-3 py-2 border rounded-lg text-sm',
                'bg-[#1C1C26]',
                'text-white',
                'border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
            >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      </div>

      {/* Integrations Grid */}
      {filteredIntegrations.length === 0 ? (
        <div className="text-center py-12">
          <Settings className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No integrations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className={clsx(
                'p-4 border rounded-lg transition-all hover-lift glass-effect',
                'bg-[#1C1C26]',
                'border-gray-800',
                'hover:border-gray-700'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {integration.icon ? (
                    <Avatar src={integration.icon} name={integration.name} size="md" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-blue-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-white">{integration.name}</h4>
                    <Badge variant={categoryColors[integration.category]} className="mt-1">
                      {integration.category}
                    </Badge>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>

              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{integration.description}</p>

              {integration.connectedAt && (
                <div className="text-xs text-gray-400 mb-4">
                  Connected {new Date(integration.connectedAt).toLocaleDateString()}
                </div>
              )}

              <div className="flex items-center gap-2">
                {integration.status === 'connected' ? (
                  <>
                    {onConfigure && (
                      <Button variant="outline" size="sm" onClick={() => onConfigure(integration)} fullWidth className="border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white">
                        <span className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Configure
                        </span>
                      </Button>
                    )}
                    {onDisconnect && (
                      <Button variant="danger" size="sm" onClick={() => onDisconnect(integration)} fullWidth>
                        Disconnect
                      </Button>
                    )}
                  </>
                ) : integration.status === 'available' ? (
                  onConnect && (
                    <Button variant="gradient" size="sm" onClick={() => onConnect(integration)} fullWidth>
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Connect
                      </span>
                    </Button>
                  )
                ) : null}

                {integration.websiteUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(integration.websiteUrl, '_blank')}
                    className="text-gray-300 hover:bg-[#252532] hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      Learn More
                    </span>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
