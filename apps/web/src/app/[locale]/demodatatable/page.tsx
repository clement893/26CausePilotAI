'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MoreVertical,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Trash2,
  Edit,
  Eye,
  Star,
  Heart,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react';

/**
 * Data Tables Advanced Demo Page
 * 
 * Comprehensive data table with search, filtering, sorting, selection,
 * and bulk actions. Demonstrates modern table UI with sticky headers.
 */

type Donor = {
  id: number;
  name: string;
  email: string;
  phone: string;
  totalDonations: number;
  lastDonation: string;
  status: 'active' | 'inactive' | 'vip';
  campaigns: number;
  joinDate: string;
};

const mockDonors: Donor[] = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '+1 (555) 123-4567', totalDonations: 15420, lastDonation: '2026-01-28', status: 'vip', campaigns: 8, joinDate: '2024-03-15' },
  { id: 2, name: 'Michael Chen', email: 'mchen@email.com', phone: '+1 (555) 234-5678', totalDonations: 8950, lastDonation: '2026-01-25', status: 'active', campaigns: 5, joinDate: '2024-06-20' },
  { id: 3, name: 'Emily Rodriguez', email: 'emily.r@email.com', phone: '+1 (555) 345-6789', totalDonations: 22100, lastDonation: '2026-01-30', status: 'vip', campaigns: 12, joinDate: '2023-11-10' },
  { id: 4, name: 'David Kim', email: 'dkim@email.com', phone: '+1 (555) 456-7890', totalDonations: 5200, lastDonation: '2026-01-20', status: 'active', campaigns: 3, joinDate: '2025-01-05' },
  { id: 5, name: 'Lisa Anderson', email: 'lisa.a@email.com', phone: '+1 (555) 567-8901', totalDonations: 18750, lastDonation: '2026-01-29', status: 'vip', campaigns: 9, joinDate: '2024-02-28' },
  { id: 6, name: 'James Wilson', email: 'jwilson@email.com', phone: '+1 (555) 678-9012', totalDonations: 3400, lastDonation: '2025-12-15', status: 'inactive', campaigns: 2, joinDate: '2024-08-12' },
  { id: 7, name: 'Maria Garcia', email: 'mgarcia@email.com', phone: '+1 (555) 789-0123', totalDonations: 12600, lastDonation: '2026-01-27', status: 'active', campaigns: 7, joinDate: '2024-04-18' },
  { id: 8, name: 'Robert Taylor', email: 'rtaylor@email.com', phone: '+1 (555) 890-1234', totalDonations: 6800, lastDonation: '2026-01-22', status: 'active', campaigns: 4, joinDate: '2024-09-30' },
  { id: 9, name: 'Jennifer Lee', email: 'jlee@email.com', phone: '+1 (555) 901-2345', totalDonations: 25300, lastDonation: '2026-01-31', status: 'vip', campaigns: 15, joinDate: '2023-07-22' },
  { id: 10, name: 'Christopher Brown', email: 'cbrown@email.com', phone: '+1 (555) 012-3456', totalDonations: 4100, lastDonation: '2026-01-18', status: 'active', campaigns: 3, joinDate: '2025-02-14' },
  { id: 11, name: 'Amanda Martinez', email: 'amartinez@email.com', phone: '+1 (555) 123-4568', totalDonations: 9200, lastDonation: '2026-01-26', status: 'active', campaigns: 6, joinDate: '2024-05-09' },
  { id: 12, name: 'Daniel White', email: 'dwhite@email.com', phone: '+1 (555) 234-5679', totalDonations: 2800, lastDonation: '2025-11-20', status: 'inactive', campaigns: 1, joinDate: '2024-10-05' },
  { id: 13, name: 'Jessica Thompson', email: 'jthompson@email.com', phone: '+1 (555) 345-6780', totalDonations: 16400, lastDonation: '2026-01-29', status: 'vip', campaigns: 10, joinDate: '2024-01-12' },
  { id: 14, name: 'Matthew Davis', email: 'mdavis@email.com', phone: '+1 (555) 456-7891', totalDonations: 7500, lastDonation: '2026-01-24', status: 'active', campaigns: 5, joinDate: '2024-07-16' },
  { id: 15, name: 'Ashley Miller', email: 'amiller@email.com', phone: '+1 (555) 567-8902', totalDonations: 19800, lastDonation: '2026-01-30', status: 'vip', campaigns: 11, joinDate: '2023-12-08' },
];

export default function DemoDataTablePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Donor>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Filtering and sorting logic
  const filteredAndSortedDonors = useMemo(() => {
    let filtered = mockDonors;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(donor =>
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.phone.includes(searchQuery)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(donor => donor.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    return filtered;
  }, [searchQuery, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDonors.length / rowsPerPage);
  const paginatedDonors = filteredAndSortedDonors.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedDonors.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedDonors.map(d => d.id));
    }
  };

  const toggleSelectRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  // Sort handler
  const handleSort = (field: keyof Donor) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Donor) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-500" />;
    }
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-primary-500" />
      : <ChevronDown className="w-4 h-4 text-primary-500" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vip':
        return <Badge variant="warning" className="bg-gradient-to-r from-yellow-500 to-orange-500">VIP</Badge>;
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'inactive':
        return <Badge variant="error">Inactive</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-[#13131A]">
        <Container>
          <div className="py-8">
            <h1 className="text-4xl font-bold mb-2 gradient-text">Advanced Data Tables</h1>
            <p className="text-gray-400">
              Interactive table with search, filtering, sorting, selection, and bulk actions
            </p>
          </div>
        </Container>
      </div>

      <Container className="py-8">
        <Card className="bg-[#13131A] border border-gray-800 overflow-hidden">
          {/* Toolbar */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search donors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#1C1C26] border-gray-700"
                />
              </div>

              {/* Filters and Actions */}
              <div className="flex items-center gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-[#1C1C26] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="vip">VIP</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>

                <Button variant="primary" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedRows.length > 0 && (
              <div className="mt-4 p-3 bg-[#1C1C26] rounded-lg flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {selectedRows.length} row{selectedRows.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button variant="outline" size="sm">
                    <Star className="w-4 h-4 mr-2" />
                    Add to VIP
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full">
              <thead className="bg-[#1C1C26] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <Checkbox
                      checked={selectedRows.length === paginatedDonors.length && paginatedDonors.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Donor Name
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                    Contact
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('totalDonations')}
                  >
                    <div className="flex items-center gap-2">
                      Total Donations
                      {getSortIcon('totalDonations')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('lastDonation')}
                  >
                    <div className="flex items-center gap-2">
                      Last Donation
                      {getSortIcon('lastDonation')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center gap-2">
                      Status
                      {getSortIcon('status')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-gray-300 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('campaigns')}
                  >
                    <div className="flex items-center gap-2">
                      Campaigns
                      {getSortIcon('campaigns')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {paginatedDonors.map((donor) => (
                  <tr 
                    key={donor.id}
                    className="hover:bg-[#1C1C26] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedRows.includes(donor.id)}
                        onChange={() => toggleSelectRow(donor.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                          {donor.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-medium">{donor.name}</div>
                          <div className="text-xs text-gray-400">Joined {donor.joinDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                          <Mail className="w-4 h-4 text-gray-500" />
                          {donor.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Phone className="w-4 h-4 text-gray-500" />
                          {donor.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-green-500">
                          ${donor.totalDonations.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        {new Date(donor.lastDonation).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(donor.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary-500" />
                        <span className="font-medium">{donor.campaigns}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-[#252532] rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <button className="p-2 hover:bg-[#252532] rounded-lg transition-colors">
                          <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                        <button className="p-2 hover:bg-[#252532] rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-400 hover:text-white" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-gray-800 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, filteredAndSortedDonors.length)} of {filteredAndSortedDonors.length} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-[#1C1C26] text-gray-400 hover:text-white hover:bg-[#252532]'
                  }`}
                >
                  {page}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </Container>
    </div>
  );
}
