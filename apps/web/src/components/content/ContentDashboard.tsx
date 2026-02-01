/** * Content Dashboard Component * * Overview dashboard for content management with statistics and quick links. * * @component */ 'use client';
import { Card, StatsCard } from '@/components/ui';
import { FileText, Image, Tag, Folder, Calendar, Layout, BookOpen } from 'lucide-react';
import Link from 'next/link';
export interface ContentStats {
  totalPages: number;
  totalPosts: number;
  totalMedia: number;
  totalCategories: number;
  totalTags: number;
  scheduledContent: number;
}
export interface ContentDashboardProps {
  stats?: ContentStats;
  className?: string;
}
/** * Content Dashboard Component * * Displays content management overview with statistics and navigation cards. */ export default function ContentDashboard({
  stats = {
    totalPages: 0,
    totalPosts: 0,
    totalMedia: 0,
    totalCategories: 0,
    totalTags: 0,
    scheduledContent: 0,
  },
  className,
}: ContentDashboardProps) {
  const quickLinks = [
    {
      title: 'Pages',
      description: 'Manage static pages',
      icon: FileText,
      href: '/content/pages',
      iconBgClass: 'bg-primary-100 dark:bg-primary-900/20',
      iconTextClass: 'text-primary-600 dark:text-primary-400',
      count: stats.totalPages,
    },
    {
      title: 'Blog Posts',
      description: 'Manage blog articles',
      icon: BookOpen,
      href: '/content/posts',
      iconBgClass: 'bg-secondary-100 dark:bg-secondary-900/20',
      iconTextClass: 'text-secondary-600 dark:text-secondary-400',
      count: stats.totalPosts,
    },
    {
      title: 'Media Library',
      description: 'Upload and manage media',
      icon: Image,
      href: '/content/media',
      iconBgClass: 'bg-success-100 dark:bg-success-900/20',
      iconTextClass: 'text-success-600 dark:text-success-400',
      count: stats.totalMedia,
    },
    {
      title: 'Categories',
      description: 'Organize content by category',
      icon: Folder,
      href: '/content/categories',
      iconBgClass: 'bg-warning-100 dark:bg-warning-900/20',
      iconTextClass: 'text-warning-600 dark:text-warning-400',
      count: stats.totalCategories,
    },
    {
      title: 'Tags',
      description: 'Manage content tags',
      icon: Tag,
      href: '/content/tags',
      iconBgClass: 'bg-info-100 dark:bg-info-900/20',
      iconTextClass: 'text-info-600 dark:text-info-400',
      count: stats.totalTags,
    },
    {
      title: 'Templates',
      description: 'Manage content templates',
      icon: Layout,
      href: '/content/templates',
      iconBgClass: 'bg-primary-100 dark:bg-primary-900/20',
      iconTextClass: 'text-primary-600 dark:text-primary-400',
    },
    {
      title: 'Scheduled Content',
      description: 'View scheduled publications',
      icon: Calendar,
      href: '/content/schedule',
      iconBgClass: 'bg-secondary-100 dark:bg-secondary-900/20',
      iconTextClass: 'text-secondary-600 dark:text-secondary-400',
      count: stats.scheduledContent,
    },
  ];
  return (
    <div className={className}>
      {' '}
      {/* Statistics Cards */}{' '}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {' '}
        <StatsCard
          title="Total Pages"
          value={stats.totalPages}
          icon={<FileText className="w-6 h-6" />}
        />{' '}
        <StatsCard
          title="Blog Posts"
          value={stats.totalPosts}
          icon={<BookOpen className="w-6 h-6" />}
        />{' '}
        <StatsCard
          title="Media Files"
          value={stats.totalMedia}
          icon={<Image className="w-6 h-6" />}
        />{' '}
        <StatsCard
          title="Scheduled"
          value={stats.scheduledContent}
          icon={<Calendar className="w-6 h-6" />}
        />{' '}
      </div>{' '}
      {/* Quick Links */}{' '}
      <Card variant="glass" title="Content Management" className="border border-gray-800">
        {' '}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {' '}
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group p-4 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg hover:border-blue-500/50 hover-lift transition-all"
              >
                {' '}
                <div className="flex items-start justify-between">
                  {' '}
                  <div className="flex-1">
                    {' '}
                    <div className="flex items-center gap-3 mb-2">
                      {' '}
                      <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        {' '}
                        <Icon className="w-5 h-5 text-blue-400" />{' '}
                      </div>{' '}
                      <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {' '}
                        {link.title}{' '}
                      </h3>{' '}
                    </div>{' '}
                    <p className="text-sm text-gray-400 mb-2"> {link.description} </p>{' '}
                    {link.count !== undefined && (
                      <p className="text-xs text-gray-500">
                        {' '}
                        {link.count} {link.count === 1 ? 'item' : 'items'}{' '}
                      </p>
                    )}{' '}
                  </div>{' '}
                </div>{' '}
              </Link>
            );
          })}{' '}
        </div>{' '}
      </Card>{' '}
    </div>
  );
}
