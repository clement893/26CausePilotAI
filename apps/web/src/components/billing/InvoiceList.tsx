/** * Invoice List Component * Displays a list of invoices with filtering and pagination */ 'use client';
import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/ui/DataTable';
import type { Column } from '@/components/ui/DataTable';
import { Download, Eye, FileText } from 'lucide-react';
export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  description?: string;
  [key: string]: unknown;
}
export interface InvoiceListProps {
  invoices: Invoice[];
  onViewInvoice?: (invoice: Invoice) => void;
  onDownloadInvoice?: (invoice: Invoice) => void;
  className?: string;
}
export default function InvoiceList({
  invoices,
  onViewInvoice,
  onDownloadInvoice,
  className,
}: InvoiceListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const filteredInvoices = useMemo(() => {
    if (statusFilter === 'all') return invoices;
    return invoices.filter((inv) => inv.status === statusFilter);
  }, [invoices, statusFilter]);
  const getStatusBadge = (status: Invoice['status']) => {
    const variants = {
      paid: 'success' as const,
      pending: 'warning' as const,
      overdue: 'error' as const,
      cancelled: 'default' as const,
    };
    return (
      <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
    );
  };
  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      label: 'Invoice #',
      sortable: true,
      render: (_value, invoice) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gray-500 dark:text-muted-foreground" />
          <span className="font-medium text-white dark:text-foreground">{invoice.number}</span>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value) => (
        <span className="text-white dark:text-foreground">{new Date(value as string).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value) => (
        <span className="text-white dark:text-foreground">{new Date(value as string).toLocaleDateString()}</span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (_value, invoice) => (
        <span className="font-semibold text-white dark:text-foreground">
          {invoice.currency} {invoice.amount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (_value, invoice) => getStatusBadge(invoice.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, invoice) => (
        <div className="flex items-center gap-2">
          {' '}
          <Button variant="ghost" size="sm" onClick={() => onViewInvoice?.(invoice)} className="text-gray-300 dark:text-foreground hover:bg-[#1C1C26] dark:hover:bg-muted">
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" /> View
            </span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDownloadInvoice?.(invoice)} className="text-gray-300 dark:text-foreground hover:bg-[#1C1C26] dark:hover:bg-muted">
            <span className="flex items-center gap-2">
              <Download className="w-4 h-4" /> Download
            </span>
          </Button>
        </div>
      ),
    },
  ];
  return (
    <Card variant="glass" className={clsx('border border-gray-800 dark:border-border', className)}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white dark:text-foreground">Invoices</h3>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={clsx(
              'px-3 py-2 border rounded-lg text-sm form-input-glow',
              'bg-[#1C1C26] dark:bg-background',
              'text-white dark:text-foreground',
              'border-gray-700 dark:border-border',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary-400'
            )}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <DataTable<Invoice>
        data={filteredInvoices}
        columns={columns}
        pageSize={10}
        emptyMessage="No invoices found"
      />
    </Card>
  );
}
