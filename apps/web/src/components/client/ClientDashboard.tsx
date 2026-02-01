/** * Client Dashboard Component * * Main dashboard for client portal showing statistics and overview. * * @module ClientDashboard */ 'use client';
import { memo } from 'react';
import { ClientDashboardStats } from '@/lib/api/client-portal';
import { Card, StatsCard } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
/** * Client Dashboard Component * * Displays client portal dashboard with: * - Order statistics * - Invoice statistics * - Project statistics * - Support ticket statistics * - Financial overview * * @example * ```tsx * <ClientDashboard /> * ``` */ export const ClientDashboard =
  memo(function ClientDashboard() {
    const {
      data: stats,
      isLoading,
      error,
    } = useApi<ClientDashboardStats>({ url: '/v1/client/dashboard/stats' });
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {' '}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-[#1C1C26] border border-gray-800 rounded-lg animate-pulse" />
          ))}{' '}
        </div>
      );
    }
    if (error) {
      return (
        <Card variant="glass" title="Error" className="border border-gray-800">
          {' '}
          <p className="text-red-400">
            {' '}
            Failed to load dashboard statistics. Please try again later.{' '}
          </p>{' '}
        </Card>
      );
    }
    if (!stats) {
      return null;
    }
    return (
      <div className="space-y-6">
        {' '}
        {/* Overview Stats */}{' '}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {' '}
          <StatsCard
            title="Total Orders"
            value={stats.total_orders.toString()}
            className="bg-blue-500/20 border-blue-500/30"
          />{' '}
          <StatsCard
            title="Pending Orders"
            value={stats.pending_orders.toString()}
            className="bg-yellow-500/20 border-yellow-500/30"
          />{' '}
          <StatsCard
            title="Completed Orders"
            value={stats.completed_orders.toString()}
            className="bg-green-500/20 border-green-500/30"
          />{' '}
          <StatsCard
            title="Open Tickets"
            value={stats.open_tickets.toString()}
            className="bg-blue-500/20 border-blue-500/30"
          />{' '}
        </div>{' '}
        {/* Financial Overview */}{' '}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {' '}
          <Card variant="glass" title="Financial Overview" className="border border-gray-800">
            {' '}
            <div className="space-y-4">
              {' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Total Spent</p>{' '}
                <p className="text-2xl font-bold text-white">
                  {' '}
                  ${parseFloat(stats.total_spent).toFixed(2)}{' '}
                </p>{' '}
              </div>{' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Pending Amount</p>{' '}
                <p className="text-2xl font-bold text-yellow-400">
                  {' '}
                  ${parseFloat(stats.pending_amount).toFixed(2)}{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
          </Card>{' '}
          <Card variant="glass" title="Projects & Invoices" className="border border-gray-800">
            {' '}
            <div className="space-y-4">
              {' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Active Projects</p>{' '}
                <p className="text-2xl font-bold text-white">
                  {' '}
                  {stats.active_projects} / {stats.total_projects}{' '}
                </p>{' '}
              </div>{' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Paid Invoices</p>{' '}
                <p className="text-2xl font-bold text-green-400">
                  {' '}
                  {stats.paid_invoices} / {stats.total_invoices}{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
          </Card>{' '}
        </div>{' '}
      </div>
    );
  });
