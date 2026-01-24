/**
 * Demo Dashboard Page - CausePilot
 * Comprehensive analytics and insights dashboard
 * Accessible at /demodashboard
 */

'use client';

import { useState } from 'react';
import { Container, Card, Badge, Button } from '@/components/ui';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Zap,
  Heart,
  Gift,
  Bell,
} from 'lucide-react';

// Mock data
const kpiStats = [
  {
    label: 'Total Revenue',
    value: '$284,750',
    change: '+23.5%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'vs last month',
  },
  {
    label: 'Active Donors',
    value: '1,923',
    change: '+12.3%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'vs last month',
  },
  {
    label: 'Campaigns',
    value: '8',
    change: '+2',
    trend: 'up',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'active campaigns',
  },
  {
    label: 'Conversion Rate',
    value: '42.8%',
    change: '+5.2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    description: 'vs last month',
  },
];

const recentDonations = [
  {
    id: 1,
    donor: 'Sarah Johnson',
    amount: 500,
    campaign: 'Winter Relief Fund',
    date: '2026-01-24 10:30 AM',
    status: 'completed',
  },
  {
    id: 2,
    donor: 'Michael Chen',
    amount: 250,
    campaign: 'Education Program',
    date: '2026-01-24 09:15 AM',
    status: 'completed',
  },
  {
    id: 3,
    donor: 'Emily Rodriguez',
    amount: 1000,
    campaign: 'Annual Gala',
    date: '2026-01-24 08:45 AM',
    status: 'completed',
  },
  {
    id: 4,
    donor: 'David Kim',
    amount: 150,
    campaign: 'Monthly Giving',
    date: '2026-01-24 07:20 AM',
    status: 'completed',
  },
  {
    id: 5,
    donor: 'Lisa Anderson',
    amount: 750,
    campaign: 'Emergency Fund',
    date: '2026-01-23 11:50 PM',
    status: 'completed',
  },
];

const campaignPerformance = [
  {
    name: 'Winter Relief Fund',
    raised: 45200,
    goal: 50000,
    donors: 234,
    progress: 90.4,
    status: 'active',
  },
  {
    name: 'Education Program',
    raised: 32800,
    goal: 40000,
    donors: 156,
    progress: 82.0,
    status: 'active',
  },
  {
    name: 'Annual Gala',
    raised: 78500,
    goal: 100000,
    donors: 89,
    progress: 78.5,
    status: 'active',
  },
  {
    name: 'Monthly Giving',
    raised: 28400,
    goal: 30000,
    donors: 312,
    progress: 94.7,
    status: 'active',
  },
];

const aiInsights = [
  {
    id: 1,
    type: 'opportunity',
    icon: Zap,
    title: 'High-Value Prospect Identified',
    description: '127 donors show major gift potential based on engagement patterns',
    action: 'Review Prospects',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 2,
    type: 'alert',
    icon: Bell,
    title: 'Donor Retention Alert',
    description: '23 regular donors haven\'t given in 60+ days and may need re-engagement',
    action: 'View Details',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  {
    id: 3,
    type: 'success',
    icon: Heart,
    title: 'Campaign Milestone Reached',
    description: 'Winter Relief Fund is 90% funded - perfect time for final push',
    action: 'Send Update',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    id: 4,
    type: 'insight',
    icon: Activity,
    title: 'Optimal Send Time Detected',
    description: 'Tuesday 10 AM shows 42% higher open rates for your audience',
    action: 'Schedule Email',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
];

const monthlyData = [
  { month: 'Jul', amount: 18500 },
  { month: 'Aug', amount: 22300 },
  { month: 'Sep', amount: 19800 },
  { month: 'Oct', amount: 25600 },
  { month: 'Nov', amount: 28900 },
  { month: 'Dec', amount: 35200 },
  { month: 'Jan', amount: 42100 },
];

export default function DemoDashboardPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const maxAmount = Math.max(...monthlyData.map((d) => d.amount));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Container className="py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Welcome back! Here's what's happening with your fundraising.
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline">
                <RefreshCw className="w-5 h-5 mr-2" />
                Refresh
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="w-5 h-5 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        {/* KPI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <Badge
                    variant={stat.trend === 'up' ? 'success' : 'error'}
                    className="flex items-center gap-1"
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {stat.description}
                </p>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Revenue Trend
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly donation revenue over time
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <BarChart3 className="w-5 h-5" />
              </Button>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-12">
                    {data.month}
                  </span>
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                      style={{ width: `${(data.amount / maxAmount) * 100}%` }}
                    >
                      <span className="text-xs font-semibold text-white">
                        ${(data.amount / 1000).toFixed(1)}k
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* AI Insights */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  AI Insights
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Smart recommendations
                </p>
              </div>
              <Badge variant="info" className="text-xs">
                4 New
              </Badge>
            </div>

            <div className="space-y-4">
              {aiInsights.map((insight) => {
                const Icon = insight.icon;
                return (
                  <div
                    key={insight.id}
                    className={`p-4 rounded-lg ${insight.bgColor} border-l-4 border-${insight.color.split('-')[1]}-500`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className={`w-5 h-5 ${insight.color} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {insight.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {insight.description}
                        </p>
                        <button className={`text-xs font-semibold ${insight.color} hover:underline`}>
                          {insight.action} →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Performance */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Campaign Performance
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Active fundraising campaigns
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Target className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-6">
              {campaignPerformance.map((campaign, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {campaign.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {campaign.donors} donors
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        ${campaign.raised.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        of ${campaign.goal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${campaign.progress}%` }}
                      />
                    </div>
                    <span className="absolute right-0 -top-5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {campaign.progress.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Donations */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  Recent Donations
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Latest contributions
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Gift className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div
                  key={donation.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {donation.donor.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {donation.donor}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {donation.campaign}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400 text-sm">
                      +${donation.amount}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {donation.date.split(' ')[1]} {donation.date.split(' ')[2]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              View All Donations
            </Button>
          </Card>
        </div>
      </Container>
    </div>
  );
}
