/** * ERP Dashboard Component * * Main dashboard for ERP portal showing comprehensive statistics and overview. * * @module ERPDashboard */ 'use client';
import { memo } from 'react';
import { ERPDashboardStats } from '@/lib/api/erp-portal';
import { Card, StatsCard } from '@/components/ui';
import { useApi } from '@/hooks/useApi';
/** * ERP Dashboard Component * * Displays ERP portal dashboard with: * - Order statistics * - Invoice statistics * - Client statistics * - Inventory statistics * - Revenue metrics * - Department-specific stats (if applicable) * * @example * ```tsx * <ERPDashboard /> * ``` */ export const ERPDashboard =
  memo(function ERPDashboard() {
    const {
      data: stats,
      isLoading,
      error,
    } = useApi<ERPDashboardStats>({ url: '/v1/erp/dashboard/stats' });
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {' '}
          {[...Array(12)].map((_, i) => (
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
            title="Total Clients"
            value={stats.total_clients.toString()}
            className="bg-blue-500/20 border-blue-500/30"
          />{' '}
        </div>{' '}
        {/* Financial Overview */}{' '}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {' '}
          <Card variant="glass" title="Revenue Overview" className="border border-gray-800">
            {' '}
            <div className="space-y-4">
              {' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Total Revenue</p>{' '}
                <p className="text-2xl font-bold text-white">
                  {' '}
                  ${parseFloat(stats.total_revenue).toFixed(2)}{' '}
                </p>{' '}
              </div>{' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Pending Revenue</p>{' '}
                <p className="text-2xl font-bold text-yellow-400">
                  {' '}
                  ${parseFloat(stats.pending_revenue).toFixed(2)}{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
          </Card>{' '}
          <Card variant="glass" title="Invoices & Clients" className="border border-gray-800">
            {' '}
            <div className="space-y-4">
              {' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Paid Invoices</p>{' '}
                <p className="text-2xl font-bold text-green-400">
                  {' '}
                  {stats.paid_invoices} / {stats.total_invoices}{' '}
                </p>{' '}
              </div>{' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Active Clients</p>{' '}
                <p className="text-2xl font-bold text-white">
                  {' '}
                  {stats.active_clients} / {stats.total_clients}{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
          </Card>{' '}
        </div>{' '}
        {/* Inventory Stats */}{' '}
        {(stats.total_products > 0 || stats.low_stock_products > 0) && (
          <Card variant="glass" title="Inventory Status" className="border border-gray-800">
            {' '}
            <div className="grid grid-cols-2 gap-4">
              {' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Total Products</p>{' '}
                <p className="text-2xl font-bold text-white"> {stats.total_products} </p>{' '}
              </div>{' '}
              <div>
                {' '}
                <p className="text-sm text-gray-400">Low Stock Items</p>{' '}
                <p
                  className={`text-2xl font-bold ${stats.low_stock_products > 0 ? 'text-red-400' : 'text-green-400'}`}
                >
                  {' '}
                  {stats.low_stock_products}{' '}
                </p>{' '}
              </div>{' '}
            </div>{' '}
          </Card>
        )}{' '}
      </div>
    );
  });
