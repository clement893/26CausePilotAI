/**
 * Billing Dashboard Component
 *
 * Overview dashboard displaying subscription information, usage metrics,
 * upcoming invoices, and payment method details.
 *
 * @example
 * ```tsx
 * <BillingDashboard
 *   subscription={{
 *     plan: 'Pro',
 *     status: 'active',
 *     currentPeriodEnd: '2024-04-15',
 *     amount: 29,
 *     currency: 'USD',
 *   }}
 *   usage={{
 *     current: 750,
 *     limit: 1000,
 *     unit: 'API calls',
 *   }}
 * />
 * ```
 */
'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Chart } from '@/components/ui';
import type { ChartDataPoint } from '@/components/ui';
import {
  CreditCard,
  TrendingUp,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
} from '@/lib/icons';

export interface BillingDashboardProps {
  /** Additional CSS classes */
  className?: string;
  /** Subscription information */
  subscription?: {
    /** Subscription plan name */
    plan: string;
    /** Subscription status */
    status: 'active' | 'cancelled' | 'past_due' | 'trialing';
    /** Current period end date */
    currentPeriodEnd: string;
    /** Subscription amount */
    amount: number;
    /** Currency code */
    currency: string;
  };
  /** Usage metrics */
  usage?: {
    /** Current usage value */
    current: number;
    /** Usage limit */
    limit: number;
    /** Unit of measurement */
    unit: string;
  };
  /** Upcoming invoice information */
  upcomingInvoice?: {
    /** Invoice amount */
    amount: number;
    /** Currency code */
    currency: string;
    /** Invoice date */
    date: string;
  };
  /** Payment method information */
  paymentMethod?: {
    /** Payment method type */
    type: string;
    /** Last 4 digits of card */
    last4: string;
    /** Card brand */
    brand: string;
  };
}

export default function BillingDashboard({
  className,
  subscription,
  usage,
  upcomingInvoice,
  paymentMethod,
}: BillingDashboardProps) {
  const [billingHistory, setBillingHistory] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    // Simulate billing history data
    const history: ChartDataPoint[] = [
      { label: 'Jan', value: 99 },
      { label: 'Feb', value: 99 },
      { label: 'Mar', value: 149 },
      { label: 'Apr', value: 149 },
      { label: 'May', value: 149 },
      { label: 'Jun', value: 149 },
    ];
    setBillingHistory(history);
  }, []);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="success">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Active
            </span>
          </Badge>
        );
      case 'trialing':
        return <Badge variant="info">Trial</Badge>;
      case 'past_due':
        return (
          <Badge variant="warning">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Past Due
            </span>
          </Badge>
        );
      case 'cancelled':
        return <Badge variant="error">Cancelled</Badge>;
      default:
        return null;
    }
  };

  const usagePercentage = usage ? (usage.current / usage.limit) * 100 : 0;

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Subscription Overview */}
      <Card variant="glass" title="Subscription Overview" className="border border-gray-800 dark:border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 glass-effect bg-[#1C1C26] dark:bg-muted rounded-lg border border-gray-800 dark:border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 dark:text-muted-foreground">Current Plan</span>
              {getStatusBadge(subscription?.status)}
            </div>
            <div className="text-2xl font-bold text-white dark:text-foreground">
              {subscription?.plan || 'Free Plan'}
            </div>
            <div className="text-sm text-gray-400 dark:text-muted-foreground mt-1">
              {subscription?.amount
                ? `${subscription.currency} ${subscription.amount}/month`
                : 'No active subscription'}
            </div>
          </div>
          <div className="p-4 glass-effect bg-[#1C1C26] dark:bg-muted rounded-lg border border-gray-800 dark:border-border">
            <div className="text-sm text-gray-400 dark:text-muted-foreground mb-2">Next Billing Date</div>
            <div className="text-2xl font-bold text-white dark:text-foreground">
              {subscription?.currentPeriodEnd
                ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                : 'N/A'}
            </div>
            <div className="text-sm text-gray-400 dark:text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              Auto-renewal enabled
            </div>
          </div>
          <div className="p-4 glass-effect bg-[#1C1C26] dark:bg-muted rounded-lg border border-gray-800 dark:border-border">
            <div className="text-sm text-gray-400 dark:text-muted-foreground mb-2">Payment Method</div>
            <div className="text-lg font-semibold text-white dark:text-foreground flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {paymentMethod
                ? `${paymentMethod.brand} •••• ${paymentMethod.last4}`
                : 'No payment method'}
            </div>
            <div className="text-sm text-gray-400 dark:text-muted-foreground mt-1">
              {paymentMethod?.type || 'Add payment method'}
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Overview */}
      {usage && (
        <Card variant="glass" title="Usage This Month" className="border border-gray-800 dark:border-border">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white dark:text-foreground">
                {usage.current} / {usage.limit} {usage.unit}
              </span>
              <span className="text-sm text-gray-400 dark:text-muted-foreground">
                {Math.round(usagePercentage)}% used
              </span>
            </div>
            <div className="w-full bg-[#1C1C26] dark:bg-muted rounded-full h-3">
              <div
                className={clsx(
                  'h-3 rounded-full transition-all',
                  usagePercentage >= 90
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : usagePercentage >= 70
                      ? 'bg-gradient-to-r from-orange-500 to-yellow-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500'
                )}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            {usagePercentage >= 90 && (
              <div className="flex items-center gap-2 text-sm text-orange-400 dark:text-warning-400">
                <AlertCircle className="w-4 h-4" />
                You're approaching your usage limit
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Upcoming Invoice */}
      {upcomingInvoice && (
        <Card variant="glass" title="Upcoming Invoice" className="border border-gray-800 dark:border-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-white dark:text-foreground">
                {upcomingInvoice.currency} {upcomingInvoice.amount}
              </div>
              <div className="text-sm text-gray-400 dark:text-muted-foreground mt-1">
                Due on {new Date(upcomingInvoice.date).toLocaleDateString()}
              </div>
            </div>
            <Button variant="gradient">View Invoice</Button>
          </div>
        </Card>
      )}

      {/* Billing History Chart */}
      {billingHistory.length > 0 && (
        <Card variant="glass" title="Billing History" className="border border-gray-800 dark:border-border">
          <Chart type="line" data={billingHistory} title="Monthly Billing" height={200} />
        </Card>
      )}

      {/* Quick Actions */}
      <Card variant="glass" title="Quick Actions" className="border border-gray-800 dark:border-border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button variant="outline" fullWidth className="border-gray-700 dark:border-primary-500 text-gray-300 dark:text-primary-400 hover:bg-[#1C1C26] dark:hover:bg-primary-900/20">
            <CreditCard className="w-4 h-4 mr-2" />
            Update Payment Method
          </Button>
          <Button variant="outline" fullWidth className="border-gray-700 dark:border-primary-500 text-gray-300 dark:text-primary-400 hover:bg-[#1C1C26] dark:hover:bg-primary-900/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
          <Button variant="outline" fullWidth className="border-gray-700 dark:border-primary-500 text-gray-300 dark:text-primary-400 hover:bg-[#1C1C26] dark:hover:bg-primary-900/20">
            <DollarSign className="w-4 h-4 mr-2" />
            View Invoices
          </Button>
        </div>
      </Card>
    </div>
  );
}
