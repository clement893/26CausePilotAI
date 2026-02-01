'use client';

import { useState } from 'react';
import Container from '@/components/ui/Container';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  Percent,
  Clock,
  ArrowUp,
  RefreshCw,
  Download,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Zap,
  Mail,
} from 'lucide-react';

/**
 * Dashboard Analytics v2 Demo Page
 * 
 * Modern analytics dashboard with KPI cards, charts, AI insights,
 * campaign performance, and recent activity timeline.
 */
export default function DemoDashboardV2Page() {
  const [timeRange, setTimeRange] = useState('30d');

  // Mock data for revenue chart
  const monthlyData = [
    { month: 'Jul 2025', amount: 18500 },
    { month: 'Aug 2025', amount: 22300 },
    { month: 'Sep 2025', amount: 19800 },
    { month: 'Oct 2025', amount: 25600 },
    { month: 'Nov 2025', amount: 28900 },
    { month: 'Dec 2025', amount: 35200 },
    { month: 'Jan 2026', amount: 42100 },
  ];

  const maxAmount = Math.max(...monthlyData.map(d => d.amount));

  // Mock data for campaigns
  const campaigns = [
    { name: 'Winter Relief Fund', raised: 45200, goal: 50000, donors: 234, color: 'from-blue-500 to-purple-500' },
    { name: 'Education Program', raised: 32800, goal: 40000, donors: 156, color: 'from-green-500 to-cyan-500' },
    { name: 'Annual Gala', raised: 78500, goal: 100000, donors: 89, color: 'from-orange-500 to-red-500' },
    { name: 'Monthly Giving', raised: 28400, goal: 30000, donors: 312, color: 'from-pink-500 to-purple-500' },
  ];

  // Mock data for recent donations
  const recentDonations = [
    { name: 'Sarah Johnson', amount: 500, campaign: 'Winter Relief Fund', time: '10:30 AM', avatar: 'SJ' },
    { name: 'Michael Chen', amount: 250, campaign: 'Education Program', time: '09:15 AM', avatar: 'MC' },
    { name: 'Emily Rodriguez', amount: 1000, campaign: 'Annual Gala', time: '08:45 AM', avatar: 'ER' },
    { name: 'David Kim', amount: 150, campaign: 'Monthly Giving', time: '07:20 AM', avatar: 'DK' },
    { name: 'Lisa Anderson', amount: 750, campaign: 'Emergency Fund', time: 'Yesterday', avatar: 'LA' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#13131A]">
        <Container>
          <div className="py-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">Analytics Dashboard</h1>
              <p className="text-gray-400">Track your campaigns, donors, and revenue in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-[#1C1C26] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="primary" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <div className="space-y-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="glass-effect p-6 rounded-lg hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-cyan-500 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <Badge variant="success" className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +23.5%
                </Badge>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Total Revenue</h3>
              <p className="text-3xl font-bold">$284,750</p>
            </div>

            {/* Active Donors */}
            <div className="glass-effect p-6 rounded-lg hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <Badge variant="info" className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +12.3%
                </Badge>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Active Donors</h3>
              <p className="text-3xl font-bold">1,923</p>
            </div>

            {/* Campaigns */}
            <div className="glass-effect p-6 rounded-lg hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <Badge className="flex items-center gap-1 bg-purple-500/20 text-purple-400">
                  <ArrowUp className="w-3 h-3" />
                  +2
                </Badge>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Active Campaigns</h3>
              <p className="text-3xl font-bold">8</p>
            </div>

            {/* Conversion Rate */}
            <div className="glass-effect p-6 rounded-lg hover-lift">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Percent className="w-6 h-6 text-white" />
                </div>
                <Badge variant="success" className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +5.2%
                </Badge>
              </div>
              <h3 className="text-gray-400 text-sm font-medium mb-1">Conversion Rate</h3>
              <p className="text-3xl font-bold">42.8%</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2 p-6 bg-[#13131A] border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-1">Revenue Trend</h3>
                  <p className="text-sm text-gray-400">Monthly revenue over the last 7 months</p>
                </div>
                <Badge variant="success">+18.2% vs last period</Badge>
              </div>

              <div className="space-y-3">
                {monthlyData.map((data, index) => {
                  const percentage = (data.amount / maxAmount) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="text-gray-400 w-24">{data.month}</span>
                        <span className="font-semibold">${data.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-[#1C1C26] rounded-full h-3 overflow-hidden">
                        <div
                          className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* AI Insights */}
            <Card className="p-6 bg-[#13131A] border border-gray-800">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xl font-semibold">AI Insights</h3>
              </div>

              <div className="space-y-4">
                {/* Insight 1 */}
                <div className="p-4 rounded-lg bg-[#1C1C26] border-l-4 border-l-yellow-500">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">High-Value Prospect</h4>
                      <p className="text-xs text-gray-400 mb-2">127 donors show major gift potential</p>
                      <button className="text-xs text-primary-400 hover:text-primary-300">
                        Review Prospects →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Insight 2 */}
                <div className="p-4 rounded-lg bg-[#1C1C26] border-l-4 border-l-red-500">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Retention Alert</h4>
                      <p className="text-xs text-gray-400 mb-2">23 donors haven't given in 60+ days</p>
                      <button className="text-xs text-primary-400 hover:text-primary-300">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Insight 3 */}
                <div className="p-4 rounded-lg bg-[#1C1C26] border-l-4 border-l-green-500">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Milestone Reached</h4>
                      <p className="text-xs text-gray-400 mb-2">Winter Fund is 90% funded</p>
                      <button className="text-xs text-primary-400 hover:text-primary-300">
                        Send Update →
                      </button>
                    </div>
                  </div>
                </div>

                {/* Insight 4 */}
                <div className="p-4 rounded-lg bg-[#1C1C26] border-l-4 border-l-blue-500">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Optimal Send Time</h4>
                      <p className="text-xs text-gray-400 mb-2">Tuesday 10 AM: 42% higher open rate</p>
                      <button className="text-xs text-primary-400 hover:text-primary-300">
                        Schedule Email →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Campaign Performance & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Campaign Performance */}
            <Card className="p-6 bg-[#13131A] border border-gray-800">
              <h3 className="text-xl font-semibold mb-6">Campaign Performance</h3>
              <div className="space-y-6">
                {campaigns.map((campaign, index) => {
                  const progress = (campaign.raised / campaign.goal) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <span className="text-sm text-gray-400">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-[#1C1C26] rounded-full h-2.5 mb-2 overflow-hidden">
                        <div
                          className={`h-2.5 rounded-full bg-gradient-to-r ${campaign.color} transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                        </span>
                        <span className="text-gray-400">{campaign.donors} donors</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Recent Donations */}
            <Card className="p-6 bg-[#13131A] border border-gray-800">
              <h3 className="text-xl font-semibold mb-6">Recent Donations</h3>
              <div className="space-y-4">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#1C1C26] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {donation.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">{donation.name}</h4>
                        <span className="text-sm font-semibold text-green-500">
                          ${donation.amount}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="truncate">{donation.campaign}</span>
                        <span className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Clock className="w-3 h-3" />
                          {donation.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </Container>
    </div>
  );
}
