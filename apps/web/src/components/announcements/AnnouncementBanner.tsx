'use client';
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info, Gift } from 'lucide-react';
import Button from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
interface Announcement {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_dismissible: boolean;
  action_label?: string;
  action_url?: string;
}
interface AnnouncementBannerProps {
  className?: string;
  showOnLogin?: boolean;
}
const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  promotion: Gift,
};
const typeStyles = {
  info: 'glass-effect bg-blue-500/10 border-blue-500/50 text-blue-300',
  success:
    'glass-effect bg-green-500/10 border-green-500/50 text-green-300',
  warning:
    'glass-effect bg-yellow-500/10 border-yellow-500/50 text-yellow-300',
  error:
    'glass-effect bg-red-500/10 border-red-500/50 text-red-300',
  promotion:
    'glass-effect bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-blue-300',
};
export function AnnouncementBanner({
  className = '',
  showOnLogin = false,
}: AnnouncementBannerProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<number>>(new Set());
  useEffect(() => {
    fetchAnnouncements();
  }, [showOnLogin]);
  const fetchAnnouncements = async () => {
    try {
      const response = await apiClient.get<Announcement[]>('/v1/announcements', {
        params: { show_on_login: showOnLogin || undefined },
      });
      if (response.data) {
        setAnnouncements(response.data);
      }
    } catch (error) {
      logger.error('', 'Failed to fetch announcements:', error);
    }
  };
  const handleDismiss = async (announcementId: number) => {
    try {
      await apiClient.post(`/v1/announcements/${announcementId}/dismiss`);
      setDismissedIds(new Set([...dismissedIds, announcementId]));
    } catch (error) {
      logger.error('', 'Failed to dismiss announcement:', error);
    }
  };
  const visibleAnnouncements = announcements.filter((ann) => !dismissedIds.has(ann.id));
  if (visibleAnnouncements.length === 0) {
    return null;
  }
  return (
    <div className={`space-y-2 ${className}`}>
      {visibleAnnouncements.map((announcement) => {
        const Icon = typeIcons[announcement.type];
        const styles = typeStyles[announcement.type];
        return (
          <div
            key={announcement.id}
            className={`flex items-start gap-3 p-4 rounded-lg border ${styles}`}
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm mb-1 text-white">{announcement.title}</h4>
              <p className="text-sm text-gray-300">{announcement.message}</p>
              {announcement.action_label && announcement.action_url && (
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (announcement.action_url?.startsWith('http')) {
                        window.open(announcement.action_url, '_blank');
                      } else {
                        window.location.href = announcement.action_url || '#';
                      }
                    }}
                    className="border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white"
                  >
                    {announcement.action_label}
                  </Button>
                </div>
              )}
            </div>
            {announcement.is_dismissible && (
              <button
                onClick={() => handleDismiss(announcement.id)}
                className="flex-shrink-0 p-1 hover:bg-[#252532] rounded text-gray-400 hover:text-white transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
