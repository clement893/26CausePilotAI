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
import { format } from 'date-fns';

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

const statusColors = {
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  opened: 'bg-purple-100 text-purple-800',
  clicked: 'bg-indigo-100 text-indigo-800',
  bounced: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
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
    return <div className={className}>Loading communications...</div>;
  }

  return (
    <div className={className}>
      <div className="space-y-3">
        {communications.map(communication => {
          const Icon = communicationIcons[communication.communication_type] || Mail;
          const statusClass = statusColors[communication.status] || statusColors.sent;

          return (
            <Card key={communication.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    communication.communication_type === 'email' ? 'bg-blue-100 dark:bg-blue-900' :
                    communication.communication_type === 'sms' ? 'bg-green-100 dark:bg-green-900' :
                    communication.communication_type === 'phone' ? 'bg-purple-100 dark:bg-purple-900' :
                    'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">
                        {communication.subject || `${communication.communication_type} communication`}
                      </h4>
                      <Badge className={statusClass}>
                        {communication.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {communication.content.substring(0, 150)}
                      {communication.content.length > 150 && '...'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      {communication.sent_at && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(communication.sent_at), 'MMM d, yyyy HH:mm')}
                        </div>
                      )}
                      {communication.delivered_at && (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          Delivered
                        </div>
                      )}
                      {communication.opened_at && (
                        <div className="flex items-center gap-1 text-purple-600">
                          <CheckCircle className="w-3 h-3" />
                          Opened
                        </div>
                      )}
                      {communication.status === 'failed' && (
                        <div className="flex items-center gap-1 text-red-600">
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
        <Card className="p-8 text-center">
          <Mail className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No communications yet.</p>
        </Card>
      )}

      {hasMore && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={isLoading}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
