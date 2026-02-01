/**
 * SegmentSelector Component
 * 
 * Component for selecting segments for donors.
 */

'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui';
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
    return <div className={className}><p className="text-gray-400">Loading segments...</p></div>;
  }

  return (
    <div className={className}>
      {segments.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {segments.map(segment => {
            const isSelected = selectedSegments.some(s => s.id === segment.id);
            return (
              <Badge
                key={segment.id}
                variant={isSelected ? 'default' : 'default'}
                style={isSelected && segment.color ? { backgroundColor: segment.color, color: 'white' } : undefined}
                className={`
                  flex items-center gap-2 px-3 py-1.5 text-sm font-medium shadow-sm
                  transition-all duration-200
                  ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-105 hover:shadow-md'}
                  ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0A0A0F]' : 'glass-effect bg-[#1C1C26] border border-gray-800'}
                  ${!isSelected ? 'text-gray-300' : ''}
                `}
                onClick={() => handleToggleSegment(segment.id)}
              >
                <Users className={`w-3.5 h-3.5 ${isSelected ? 'animate-pulse' : ''}`} />
                <span>{segment.name}</span>
                {segment.is_automatic && (
                  <span className="text-xs opacity-75 bg-black/20 px-1.5 py-0.5 rounded">auto</span>
                )}
              </Badge>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-lg glass-effect bg-[#1C1C26]">
          <Users className="w-8 h-8 text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Aucun segment disponible</p>
        </div>
      )}
    </div>
  );
}
