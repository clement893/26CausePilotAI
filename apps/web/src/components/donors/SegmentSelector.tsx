/**
 * SegmentSelector Component
 * 
 * Component for selecting segments for donors.
 */

'use client';

import { useState, useEffect } from 'react';
import { Badge, Button } from '@/components/ui';
import { Users } from 'lucide-react';
import { listSegments } from '@/lib/api/donors';
import type { DonorSegment } from '@modele/types';
import { useOrganization } from '@/hooks/useOrganization';

interface SegmentSelectorProps {
  donorId?: string;
  selectedSegmentIds?: string[];
  onSegmentsChange?: (segmentIds: string[]) => void;
  className?: string;
  readOnly?: boolean;
}

export function SegmentSelector({
  donorId,
  selectedSegmentIds = [],
  onSegmentsChange,
  className,
  readOnly = false,
}: SegmentSelectorProps) {
  const { activeOrganization } = useOrganization();
  const [segments, setSegments] = useState<DonorSegment[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<DonorSegment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeOrganization) {
      loadSegments();
    }
  }, [activeOrganization]);

  useEffect(() => {
    if (selectedSegmentIds.length > 0 && segments.length > 0) {
      const selected = segments.filter(seg => selectedSegmentIds.includes(seg.id));
      setSelectedSegments(selected);
    } else {
      setSelectedSegments([]);
    }
  }, [selectedSegmentIds, segments]);

  const loadSegments = async () => {
    if (!activeOrganization) return;

    try {
      setIsLoading(true);
      const response = await listSegments({
        organizationId: activeOrganization.id,
        pageSize: 100,
      });
      setSegments(response.items);
    } catch (error) {
      console.error('Error loading segments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSegment = (segmentId: string) => {
    if (readOnly) return;

    const isSelected = selectedSegments.some(s => s.id === segmentId);
    let newSelected: DonorSegment[];

    if (isSelected) {
      newSelected = selectedSegments.filter(s => s.id !== segmentId);
    } else {
      const segment = segments.find(s => s.id === segmentId);
      if (segment) {
        newSelected = [...selectedSegments, segment];
      } else {
        newSelected = selectedSegments;
      }
    }

    setSelectedSegments(newSelected);
    onSegmentsChange?.(newSelected.map(s => s.id));
  };

  if (isLoading) {
    return <div className={className}>Loading segments...</div>;
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {segments.map(segment => {
          const isSelected = selectedSegments.some(s => s.id === segment.id);
          return (
            <Badge
              key={segment.id}
              variant={isSelected ? 'default' : 'secondary'}
              style={isSelected && segment.color ? { backgroundColor: segment.color, color: 'white' } : undefined}
              className={`flex items-center gap-1 cursor-pointer ${readOnly ? 'cursor-default' : ''}`}
              onClick={() => handleToggleSegment(segment.id)}
            >
              <Users className="w-3 h-3" />
              {segment.name}
              {segment.is_automatic && (
                <span className="text-xs opacity-75">(auto)</span>
              )}
            </Badge>
          );
        })}
      </div>

      {segments.length === 0 && (
        <p className="text-sm text-gray-500">No segments available</p>
      )}
    </div>
  );
}
