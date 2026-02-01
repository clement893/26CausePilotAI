/** * Audit Trail Component * System audit trail with detailed change tracking */ 'use client';
import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import type { ColorVariant } from '@/components/ui/types';
import DataTable from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { Shield, Filter } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Modal from '@/components/ui/Modal';
export interface AuditTrailEntry extends Record<string, unknown> {
  id: string;
  timestamp: string;
  user: { id: string; name: string; email: string; avatar?: string };
  action: 'create' | 'update' | 'delete' | 'view' | 'export' | 'login' | 'logout';
  resourceType: string;
  resourceId: string;
  resourceName?: string;
  changes?: { field: string; oldValue: unknown; newValue: unknown }[];
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'warning';
  reason?: string;
}
export interface AuditTrailProps {
  entries: AuditTrailEntry[];
  onFilterChange?: (filters: AuditFilters) => void;
  className?: string;
}
export interface AuditFilters {
  user?: string;
  action?: AuditTrailEntry['action'];
  resourceType?: string;
  status?: AuditTrailEntry['status'];
  dateRange?: { start: string; end: string };
}
const actionColors: Record<AuditTrailEntry['action'], ColorVariant> = {
  create: 'success',
  update: 'info',
  delete: 'error',
  view: 'default',
  export: 'info',
  login: 'success',
  logout: 'default',
};
export default function AuditTrail({ entries, onFilterChange, className }: AuditTrailProps) {
  const [filters, setFilters] = useState<AuditFilters>({});
  const [selectedEntry, setSelectedEntry] = useState<AuditTrailEntry | null>(null);
  const filteredEntries = useMemo(() => {
    let filtered = entries;
    if (filters.user) {
      filtered = filtered.filter((e) => e.user.id === filters.user);
    }
    if (filters.action) {
      filtered = filtered.filter((e) => e.action === filters.action);
    }
    if (filters.resourceType) {
      filtered = filtered.filter((e) => e.resourceType === filters.resourceType);
    }
    if (filters.status) {
      filtered = filtered.filter((e) => e.status === filters.status);
    }
    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      filtered = filtered.filter((e) => {
        const date = new Date(e.timestamp);
        return date >= start && date <= end;
      });
    }
    return filtered;
  }, [entries, filters]);
  const uniqueActions = useMemo(() => {
    const actions = new Set(entries.map((e) => e.action));
    return Array.from(actions) as AuditTrailEntry['action'][];
  }, [entries]);
  const uniqueResourceTypes = useMemo(() => {
    const types = new Set(entries.map((e) => e.resourceType));
    return Array.from(types);
  }, [entries]);
  const columns: Column<AuditTrailEntry>[] = [
    {
      key: 'timestamp',
      label: 'Time',
      sortable: true,
      render: (value) => (
        <div className="text-white">
          {' '}
          <div className="font-medium text-sm">
            {' '}
            {new Date(value as string).toLocaleDateString()}{' '}
          </div>{' '}
          <div className="text-xs text-gray-400">
            {' '}
            {new Date(value as string).toLocaleTimeString()}{' '}
          </div>{' '}
        </div>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (_, entry) => (
        <div className="flex items-center gap-2">
          {' '}
          <Avatar src={entry.user.avatar} name={entry.user.name} size="sm" />{' '}
          <div>
            {' '}
            <div className="text-sm font-medium text-white"> {entry.user.name} </div>{' '}
            <div className="text-xs text-gray-400"> {entry.user.email} </div>{' '}
          </div>{' '}
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      sortable: true,
      render: (value) => {
        const action = value as AuditTrailEntry['action'];
        const color = actionColors[action] || 'default';
        return <Badge variant={color}>{action}</Badge>;
      },
    },
    {
      key: 'resourceType',
      label: 'Resource',
      render: (value, entry) => (
        <div>
          {' '}
          <div className="text-sm font-medium text-white"> {value as string} </div>{' '}
          {entry.resourceName && (
            <div className="text-xs text-gray-400"> {entry.resourceName} </div>
          )}{' '}
          <div className="text-xs text-gray-400 font-mono">
            {' '}
            ID: {entry.resourceId}{' '}
          </div>{' '}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const status = value as AuditTrailEntry['status'];
        const variants = {
          success: 'success' as const,
          failure: 'error' as const,
          warning: 'warning' as const,
        };
        return <Badge variant={variants[status]}>{status}</Badge>;
      },
    },
    {
      key: 'actions',
      label: 'Details',
      render: (_, entry) => (
        <button
          onClick={() => setSelectedEntry(entry)}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
        >
          {' '}
          View Details{' '}
        </button>
      ),
    },
  ];
  return (
    <>
      {' '}
      <Card variant="glass" className={clsx('border border-gray-800', className)}>
        {' '}
        <div className="mb-6">
          {' '}
          <div className="flex items-center justify-between mb-4">
            {' '}
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              {' '}
              <Shield className="w-5 h-5 text-blue-400" /> Audit Trail{' '}
            </h3>{' '}
            <div className="text-sm text-gray-400">
              {' '}
              {filteredEntries.length} of {entries.length} entries{' '}
            </div>{' '}
          </div>{' '}
          {/* Filters */}{' '}
          <div className="flex items-center gap-4 flex-wrap">
            {' '}
            <div className="flex items-center gap-2">
              {' '}
              <Filter className="w-4 h-4 text-gray-500" />{' '}
              <select
                value={filters.action || ''}
                onChange={(e) => {
                  const newFilters = {
                    ...filters,
                    action: e.target.value as AuditTrailEntry['action'] | undefined,
                  };
                  setFilters(newFilters);
                  onFilterChange?.(newFilters);
                }}
                className={clsx(
                  'px-3 py-2 border rounded-lg text-sm',
                  'bg-[#1C1C26]',
                  'text-white',
                  'border-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                {' '}
                <option value="">All Actions</option>{' '}
                {uniqueActions.map((action) => (
                  <option key={action} value={action}>
                    {' '}
                    {action.charAt(0).toUpperCase() + action.slice(1)}{' '}
                  </option>
                ))}{' '}
              </select>{' '}
              <select
                value={filters.resourceType || ''}
                onChange={(e) => {
                  const newFilters = { ...filters, resourceType: e.target.value || undefined };
                  setFilters(newFilters);
                  onFilterChange?.(newFilters);
                }}
                className={clsx(
                  'px-3 py-2 border rounded-lg text-sm',
                  'bg-[#1C1C26]',
                  'text-white',
                  'border-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                {' '}
                <option value="">All Resources</option>{' '}
                {uniqueResourceTypes.map((type) => (
                  <option key={type} value={type}>
                    {' '}
                    {type}{' '}
                  </option>
                ))}{' '}
              </select>{' '}
              <select
                value={filters.status || ''}
                onChange={(e) => {
                  const newFilters = {
                    ...filters,
                    status: e.target.value as AuditTrailEntry['status'] | undefined,
                  };
                  setFilters(newFilters);
                  onFilterChange?.(newFilters);
                }}
                className={clsx(
                  'px-3 py-2 border rounded-lg text-sm',
                  'bg-[#1C1C26]',
                  'text-white',
                  'border-gray-700',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500'
                )}
              >
                {' '}
                <option value="">All Status</option> <option value="success">Success</option>{' '}
                <option value="failure">Failure</option>{' '}
                <option value="warning">Warning</option>{' '}
              </select>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <DataTable
          data={filteredEntries as unknown as Record<string, unknown>[]}
          columns={columns as unknown as Column<Record<string, unknown>>[]}
          pageSize={20}
          emptyMessage="No audit entries found"
        />{' '}
      </Card>{' '}
      {/* Details Modal */}{' '}
      {selectedEntry && (
        <Modal
          isOpen={!!selectedEntry}
          onClose={() => setSelectedEntry(null)}
          title="Audit Entry Details"
          size="lg"
        >
          {' '}
          <div className="space-y-4">
            {' '}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {' '}
              <div>
                {' '}
                <div className="text-gray-400">Timestamp</div>{' '}
                <div className="font-medium text-white">
                  {' '}
                  {new Date(selectedEntry.timestamp).toLocaleString()}{' '}
                </div>{' '}
              </div>{' '}
              <div>
                {' '}
                <div className="text-gray-400">User</div>{' '}
                <div className="font-medium text-white"> {selectedEntry.user.name} </div>{' '}
              </div>{' '}
              <div>
                {' '}
                <div className="text-gray-400">Action</div>{' '}
                <div className="font-medium text-white"> {selectedEntry.action} </div>{' '}
              </div>{' '}
              <div>
                {' '}
                <div className="text-gray-400">Resource</div>{' '}
                <div className="font-medium text-white">
                  {' '}
                  {selectedEntry.resourceType} ({selectedEntry.resourceId}){' '}
                </div>{' '}
              </div>{' '}
              {selectedEntry.ipAddress && (
                <div>
                  {' '}
                  <div className="text-gray-400">IP Address</div>{' '}
                  <div className="font-medium text-white font-mono">
                    {' '}
                    {selectedEntry.ipAddress}{' '}
                  </div>{' '}
                </div>
              )}{' '}
              {selectedEntry.userAgent && (
                <div>
                  {' '}
                  <div className="text-gray-400">User Agent</div>{' '}
                  <div className="font-medium text-white text-xs">
                    {' '}
                    {selectedEntry.userAgent}{' '}
                  </div>{' '}
                </div>
              )}{' '}
            </div>{' '}
            {selectedEntry.changes && selectedEntry.changes.length > 0 && (
              <div>
                {' '}
                <div className="text-sm font-medium text-white mb-2"> Changes </div>{' '}
                <div className="space-y-2">
                  {' '}
                  {selectedEntry.changes.map((change, index) => (
                    <div key={index} className="p-3 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg">
                      {' '}
                      <div className="font-medium text-sm text-white mb-1">
                        {' '}
                        {change.field}{' '}
                      </div>{' '}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {' '}
                        <div>
                          {' '}
                          <div className="text-gray-400">Old Value</div>{' '}
                          <div className="text-gray-300 font-mono">
                            {' '}
                            {JSON.stringify(change.oldValue)}{' '}
                          </div>{' '}
                        </div>{' '}
                        <div>
                          {' '}
                          <div className="text-gray-400">New Value</div>{' '}
                          <div className="text-gray-300 font-mono">
                            {' '}
                            {JSON.stringify(change.newValue)}{' '}
                          </div>{' '}
                        </div>{' '}
                      </div>{' '}
                    </div>
                  ))}{' '}
                </div>{' '}
              </div>
            )}{' '}
            {selectedEntry.reason && (
              <div>
                {' '}
                <div className="text-sm font-medium text-white mb-2"> Reason </div>{' '}
                <div className="text-sm text-gray-300"> {selectedEntry.reason} </div>{' '}
              </div>
            )}{' '}
          </div>{' '}
        </Modal>
      )}{' '}
    </>
  );
}
