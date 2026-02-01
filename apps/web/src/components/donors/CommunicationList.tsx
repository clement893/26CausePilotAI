/**
 * CommunicationList Component
 * 
 * Component for displaying donor communications history.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { Mail, MessageSquare, Phone, FileText, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { listDonorCommunications } from '@/lib/api/donors';
import type { DonorCommunication } from '@modele/types';
import { useOrganization } from '@/hooks/useOrganization';

const formatDateTime = (d: Date) =>
  d.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

interface CommunicationListProps {
  donorId: string;
  className?: string;
}

const communicationIcons = {
  email: Mail,
  sms: MessageSquare,
  phone: Phone,
  letter: FileText,
  in_person: User,
};

export function CommunicationList({ donorId, className }: CommunicationListProps) {
  const { activeOrganization } = useOrganization();
  const [communications, setCommunications] = useState<DonorCommunication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (activeOrganization && donorId) {
      loadCommunications();
    }
  }, [activeOrganization, donorId, page]);

  const loadCommunications = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const response = await listDonorCommunications({
        organizationId: activeOrganization.id,
        donorId,
        page,
        pageSize: 20,
      });
      setCommunications(response.items);
      setHasMore(response.page < response.total_pages);
    } catch (error) {
      console.error('Error loading communications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && communications.length === 0) {
    return <div className={className}><p className="text-gray-400">Loading communications...</p></div>;
  }

  const statusBadgeVariants: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
    sent: 'info',
    delivered: 'success',
    opened: 'default',
    clicked: 'default',
    bounced: 'error',
    failed: 'error',
  };

  return (
    <div className={className}>
      <div className="space-y-3">
        {communications.map(communication => {
          const Icon = communicationIcons[communication.communication_type] || Mail;
          const statusVariant = statusBadgeVariants[communication.status] || 'default';

          return (
            <Card key={communication.id} variant="glass" className="p-4 border border-gray-800 hover-lift">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg glass-effect ${
                    communication.communication_type === 'email' ? 'bg-blue-500/20 border border-blue-500/50' :
                    communication.communication_type === 'sms' ? 'bg-green-500/20 border border-green-500/50' :
                    communication.communication_type === 'phone' ? 'bg-purple-500/20 border border-purple-500/50' :
                    'bg-[#1C1C26] border border-gray-800'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      communication.communication_type === 'email' ? 'text-blue-400' :
                      communication.communication_type === 'sms' ? 'text-green-400' :
                      communication.communication_type === 'phone' ? 'text-purple-400' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-white">
                        {communication.subject || `${communication.communication_type} communication`}
                      </h4>
                      <Badge variant={statusVariant}>
                        {communication.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400 mb-2">
                      {communication.content.substring(0, 150)}
                      {communication.content.length > 150 && '...'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      {communication.sent_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDateTime(new Date(communication.sent_at))}
                        </div>
                      )}
                      {communication.delivered_at && (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Delivered
                        </div>
                      )}
                      {communication.opened_at && (
                        <div className="flex items-center gap-1 text-purple-400">
                          <CheckCircle className="w-3 h-3" />
                          Opened
                        </div>
                      )}
                      {communication.status === 'failed' && (
                        <div className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {communications.length === 0 && !isLoading && (
        <Card variant="glass" className="p-8 text-center border border-gray-800">
          <Mail className="w-12 h-12 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400">No communications yet.</p>
        </Card>
      )}

      {hasMore && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={isLoading} className="border-gray-700 text-gray-300 hover:bg-[#252532]">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
