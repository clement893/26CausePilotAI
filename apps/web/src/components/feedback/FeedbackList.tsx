'use client';
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import {
  Bug,
  Lightbulb,
  HelpCircle,
  MessageSquare,
  ThumbsUp,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { apiClient } from '@/lib/api/client';
interface Feedback {
  id: number;
  type: string;
  subject: string;
  message: string;
  status: string;
  priority: number;
  response?: string;
  created_at: string;
}
interface FeedbackListProps {
  className?: string;
}
const typeIcons = {
  bug: Bug,
  feature_request: Lightbulb,
  question: HelpCircle,
  complaint: MessageSquare,
  praise: ThumbsUp,
  other: FileText,
};
const statusIcons = { open: Clock, in_progress: Clock, resolved: CheckCircle, closed: XCircle };
const statusColors = {
  open: 'text-blue-400',
  in_progress: 'text-yellow-400',
  resolved: 'text-green-400',
  closed: 'text-gray-400',
};
export function FeedbackList({ className = '' }: FeedbackListProps) {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    fetchFeedback();
  }, []);
  const fetchFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Feedback[]>('/api/v1/feedback/feedback');
      if (response.data) {
        setFeedback(response.data);
      }
    } catch (error) {
      logger.error('', 'Failed to fetch feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <Card variant="glass" className={`${className} border border-gray-800`}>
        {' '}
        <div className="text-center py-8 text-gray-400">Loading feedback...</div>{' '}
      </Card>
    );
  }
  if (feedback.length === 0) {
    return (
      <Card variant="glass" className={`${className} border border-gray-800`}>
        {' '}
        <div className="text-center py-8 text-gray-400">
          {' '}
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-500" />{' '}
          <p className="text-white">No feedback submitted yet</p>{' '}
        </div>{' '}
      </Card>
    );
  }
  return (
    <Card variant="glass" className={`${className} border border-gray-800`}>
      {' '}
      <h3 className="text-lg font-semibold mb-4 text-white">My Feedback</h3>{' '}
      <div className="space-y-3">
        {' '}
        {feedback.map((item) => {
          const TypeIcon = typeIcons[item.type as keyof typeof typeIcons] || FileText;
          const StatusIcon = statusIcons[item.status as keyof typeof statusIcons] || Clock;
          const statusColor =
            statusColors[item.status as keyof typeof statusColors] || 'text-gray-400';
          return (
            <div key={item.id} className="p-4 border border-gray-800 rounded-lg glass-effect bg-[#1C1C26] hover:bg-[#252532] hover-lift">
              {' '}
              <div className="flex items-start justify-between mb-2">
                {' '}
                <div className="flex items-center gap-2">
                  {' '}
                  <TypeIcon className="h-4 w-4 text-gray-400" />{' '}
                  <span className="font-medium text-sm text-white">{item.subject}</span>{' '}
                </div>{' '}
                <div className="flex items-center gap-2">
                  {' '}
                  <StatusIcon className={`h-4 w-4 ${statusColor}`} />{' '}
                  <span className={`text-xs capitalize ${statusColor}`}>{item.status}</span>{' '}
                </div>{' '}
              </div>{' '}
              <p className="text-sm text-gray-400 mb-2">{item.message}</p>{' '}
              {item.response && (
                <div className="mt-2 p-2 glass-effect bg-[#252532] rounded text-sm border border-gray-800">
                  {' '}
                  <strong className="text-white">Response:</strong> <span className="text-gray-300">{item.response}</span>{' '}
                </div>
              )}{' '}
              <div className="mt-2 text-xs text-gray-400">
                {' '}
                {new Date(item.created_at).toLocaleDateString()}{' '}
              </div>{' '}
            </div>
          );
        })}{' '}
      </div>{' '}
    </Card>
  );
}
