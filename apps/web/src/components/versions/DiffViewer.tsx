'use client';
import { Plus, Minus, Edit } from 'lucide-react';
import Card from '@/components/ui/Card';
interface DiffViewerProps {
  diff: {
    added?: Record<string, unknown>;
    removed?: Record<string, unknown>;
    modified?: Record<string, { old: unknown; new: unknown }>;
  };
  className?: string;
}
export function DiffViewer({ diff, className = '' }: DiffViewerProps) {
  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };
  return (
    <Card variant="glass" className={`border border-gray-800 ${className}`}>
      <div className="space-y-4">
        {/* Added fields */}
        {diff.added && Object.keys(diff.added).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Added Fields
            </h4>
            <div className="space-y-2 pl-6">
              {Object.entries(diff.added).map(([key, value]) => (
                <div key={key} className="glass-effect bg-green-500/10 border border-green-500/50 p-2 rounded">
                  <div className="font-mono text-xs">
                    <span className="text-green-400">+ {key}:</span>
                    {''} <span className="text-gray-300">{renderValue(value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Removed fields */}
        {diff.removed && Object.keys(diff.removed).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
              <Minus className="h-4 w-4" /> Removed Fields
            </h4>
            <div className="space-y-2 pl-6">
              {Object.entries(diff.removed).map(([key, value]) => (
                <div key={key} className="glass-effect bg-red-500/10 border border-red-500/50 p-2 rounded">
                  <div className="font-mono text-xs">
                    <span className="text-red-400">- {key}:</span>
                    {''}
                    <span className="text-gray-300 line-through">
                      {renderValue(value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Modified fields */}
        {diff.modified && Object.keys(diff.modified).length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Edit className="h-4 w-4" /> Modified Fields
            </h4>
            <div className="space-y-2 pl-6">
              {Object.entries(diff.modified).map(([key, change]) => (
                <div key={key} className="glass-effect bg-blue-500/10 border border-blue-500/50 p-2 rounded">
                  <div className="font-mono text-xs space-y-1">
                    <div>
                      <span className="text-red-400">- {key}:</span>
                      {''}
                      <span className="text-gray-300 line-through">
                        {renderValue(change.old)}
                      </span>
                    </div>
                    <div>
                      <span className="text-green-400">+ {key}:</span>
                      {''} <span className="text-gray-300"> {renderValue(change.new)} </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {(!diff.added || Object.keys(diff.added).length === 0) &&
          (!diff.removed || Object.keys(diff.removed).length === 0) &&
          (!diff.modified || Object.keys(diff.modified).length === 0) && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-white">No differences found</p>
            </div>
          )}
      </div>
    </Card>
  );
}
