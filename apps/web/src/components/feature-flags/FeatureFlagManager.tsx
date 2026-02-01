'use client';
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Flag, ToggleLeft, ToggleRight, Trash2, BarChart3 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui';
import { getErrorMessage } from '@/lib/errors';
interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rollout_percentage: number;
  is_ab_test: boolean;
  created_at: string;
}
interface FeatureFlagManagerProps {
  className?: string;
}
export function FeatureFlagManager({ className = '' }: FeatureFlagManagerProps) {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  useEffect(() => {
    fetchFlags();
  }, []);
  const fetchFlags = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<FeatureFlag[]>('/api/v1/feature-flags/feature-flags');
      if (response.data) {
        setFlags(response.data);
      }
    } catch (error) {
      logger.error('', 'Failed to fetch feature flags:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await apiClient.put(`/v1/feature-flags/${flag.id}`, { enabled: !flag.enabled });
      setFlags(flags.map((f) => (f.id === flag.id ? { ...f, enabled: !f.enabled } : f)));
      showToast({
        message: `Feature flag ${!flag.enabled ? 'enabled' : 'disabled'}`,
        type: 'success',
      });
    } catch (error: unknown) {
      showToast({
        message: getErrorMessage(error) || 'Failed to update feature flag',
        type: 'error',
      });
    }
  };
  const handleDelete = async (flagId: number) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;
    try {
      await apiClient.delete(`/v1/feature-flags/${flagId}`);
      setFlags(flags.filter((f) => f.id !== flagId));
      showToast({ message: 'Feature flag deleted successfully', type: 'success' });
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        'Failed to delete feature flag';
      showToast({ message: errorMessage, type: 'error' });
    }
  };
  if (isLoading) {
    return (
      <Card variant="glass" className={className}>
        <div className="text-center py-8 text-gray-400">Loading feature flags...</div>
      </Card>
    );
  }
  return (
    <Card variant="glass" className={`border border-gray-800 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Feature Flags</h3>
        <Button variant="gradient" size="sm">
          <Flag className="h-4 w-4 mr-2" /> New Flag
        </Button>
      </div>
      {flags.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Flag className="h-12 w-12 mx-auto mb-4 text-gray-500" />
          <p className="text-white">No feature flags</p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <div
              key={flag.id}
              className="flex items-center justify-between p-3 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg hover-lift"
            >
              <div className="flex items-center gap-3 flex-1">
                <button onClick={() => handleToggle(flag)} className="flex-shrink-0">
                  {flag.enabled ? (
                    <ToggleRight className="h-6 w-6 text-blue-400" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-500" />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-white">{flag.name}</span>
                    <span className="text-xs glass-effect bg-[#13131A] border border-gray-800 px-2 py-0.5 rounded font-mono text-gray-300">
                      {flag.key}
                    </span>
                    {flag.is_ab_test && (
                      <span className="text-xs glass-effect bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 text-blue-300 px-2 py-0.5 rounded">
                        A/B Test
                      </span>
                    )}
                  </div>
                  {flag.description && (
                    <p className="text-xs text-gray-400"> {flag.description} </p>
                  )}
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span>{flag.rollout_percentage}% rollout</span>
                    {flag.enabled && (
                      <span className="text-green-400">Active</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  className="p-1 hover:bg-[#252532] rounded text-gray-400 hover:text-white transition-colors"
                  title="View stats"
                >
                  <BarChart3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(flag.id)}
                  className="p-1 hover:bg-[#252532] rounded text-red-400 hover:text-red-300 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
