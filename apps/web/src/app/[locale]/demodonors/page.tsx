/**
 * Demo Donors Page - CausePilot
 * Comprehensive donor management interface
 * Accessible at /demodonors
 */

'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Heart,
  Star,
  MoreVertical,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Mock donor data
const mockDonors = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    totalDonations: 15420,
    lastDonation: '2026-01-15',
    donationCount: 12,
    status: 'active',
    segment: 'Major Donor',
    score: 95,
    trend: 'up',
  },
  {
    id: 2,
    name: 'Michael Chen',
    email: 'm.chen@email.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    totalDonations: 8750,
    lastDonation: '2026-01-20',
    donationCount: 8,
    status: 'active',
    segment: 'Regular Donor',
    score: 82,
    trend: 'up',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    email: 'emily.r@email.com',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    totalDonations: 12300,
    lastDonation: '2026-01-10',
    donationCount: 15,
    status: 'active',
    segment: 'Major Donor',
    score: 88,
    trend: 'stable',
  },
  {
    id: 4,
    name: 'David Kim',
    email: 'd.kim@email.com',
    phone: '+1 (555) 456-7890',
    location: 'Seattle, WA',
    totalDonations: 5200,
    lastDonation: '2025-12-28',
    donationCount: 6,
    status: 'at-risk',
    segment: 'Regular Donor',
    score: 65,
    trend: 'down',
  },
  {
    id: 5,
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '+1 (555) 567-8901',
    location: 'Boston, MA',
    totalDonations: 18900,
    lastDonation: '2026-01-22',
    donationCount: 20,
    status: 'active',
    segment: 'Major Donor',
    score: 98,
    trend: 'up',
  },
  {
    id: 6,
    name: 'James Wilson',
    email: 'j.wilson@email.com',
    phone: '+1 (555) 678-9012',
    location: 'Chicago, IL',
    totalDonations: 3400,
    lastDonation: '2026-01-18',
    donationCount: 4,
    status: 'new',
    segment: 'New Donor',
    score: 72,
    trend: 'up',
  },
];

const stats = [
  {
    label: 'Total Donors',
    value: '2,847',
    change: '+12%',
    trend: 'up',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    label: 'Active Donors',
    value: '1,923',
    change: '+8%',
    trend: 'up',
    icon: Heart,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    label: 'Total Donations',
    value: '$284,750',
    change: '+23%',
    trend: 'up',
    icon: DollarSign,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    label: 'Avg. Donation',
    value: '$148',
    change: '+5%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
];

export default function DemoDonorsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');

  const filteredDonors = mockDonors.filter((donor) => {
    const matchesSearch =
      donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      donor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSegment =
      selectedSegment === 'all' || donor.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      active: 'success',
      'at-risk': 'warning',
      inactive: 'error',
      new: 'info',
    };
    return variants[status] || 'default';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <Container className="py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Donor Management
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Manage and engage with your supporters
              </p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-5 h-5 mr-2" />
              Add Donor
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <Badge
                      variant={stat.trend === 'up' ? 'success' : 'error'}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-8">
        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search donors by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="all">All Segments</option>
                <option value="Major Donor">Major Donors</option>
                <option value="Regular Donor">Regular Donors</option>
                <option value="New Donor">New Donors</option>
              </select>
              <Button variant="outline">
                <Filter className="w-5 h-5 mr-2" />
                More Filters
              </Button>
              <Button variant="outline">
                <Download className="w-5 h-5 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </Card>

        {/* Donors Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Segment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Total Donations
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Last Donation
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredDonors.map((donor) => (
                  <tr
                    key={donor.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {donor.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {donor.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {donor.location}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {donor.email}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {donor.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info" className="text-xs">
                        {donor.segment}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${donor.totalDonations.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {donor.donationCount} donations
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(donor.lastDonation).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                            style={{ width: `${donor.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {donor.score}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadge(donor.status)}>
                          {donor.status}
                        </Badge>
                        {donor.trend === 'up' && (
                          <ArrowUpRight className="w-4 h-4 text-green-600" />
                        )}
                        {donor.trend === 'down' && (
                          <ArrowDownRight className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDonors.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No donors found matching your criteria
              </p>
            </div>
          )}
        </Card>
      </Container>
    </div>
  );
}
