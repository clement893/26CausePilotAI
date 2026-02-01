/** * Help Center Component * * Main hub for help and support resources. * * @component */ 'use client';
import { Card, Button } from '@/components/ui';
import { Link } from '@/i18n/routing';
import { HelpCircle, MessageSquare, BookOpen, Video, FileText, Search } from 'lucide-react';
export interface HelpCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  color: string;
}
export interface HelpCenterProps {
  categories?: HelpCategory[];
  className?: string;
}
const defaultCategories: HelpCategory[] = [
  {
    id: 'faq',
    title: 'FAQ',
    description: 'Frequently asked questions and answers',
    icon: <HelpCircle className="w-6 h-6" />,
    link: '/help/faq',
    color:
      'bg-blue-500/20 border-blue-500/30',
  },
  {
    id: 'guides',
    title: 'User Guides',
    description: 'Step-by-step guides and tutorials',
    icon: <BookOpen className="w-6 h-6" />,
    link: '/help/guides',
    color:
      'bg-purple-500/20 border-purple-500/30',
  },
  {
    id: 'videos',
    title: 'Video Tutorials',
    description: 'Watch video tutorials and demos',
    icon: <Video className="w-6 h-6" />,
    link: '/help/videos',
    color:
      'bg-cyan-500/20 border-cyan-500/30',
  },
  {
    id: 'contact',
    title: 'Contact Support',
    description: 'Get in touch with our support team',
    icon: <MessageSquare className="w-6 h-6" />,
    link: '/help/contact',
    color:
      'bg-green-500/20 border-green-500/30',
  },
  {
    id: 'tickets',
    title: 'Support Tickets',
    description: 'View and manage your support tickets',
    icon: <FileText className="w-6 h-6" />,
    link: '/help/tickets',
    color:
      'bg-yellow-500/20 border-yellow-500/30',
  },
];
/** * Help Center Component * * Displays help categories and quick links. */ export default function HelpCenter({
  categories = defaultCategories,
  className,
}: HelpCenterProps) {
  return (
    <div className={className}>
      {' '}
      {/* Search Bar */}{' '}
      <Card variant="glass" className="mb-8 border border-gray-800">
        {' '}
        <div className="flex items-center gap-4">
          {' '}
          <Search className="w-5 h-5 text-gray-400" />{' '}
          <div className="form-input-glow flex-1">
            <input
              type="text"
              placeholder="Search for help..."
              className="flex-1 px-4 py-2 border border-gray-700 rounded-lg bg-[#1C1C26] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button variant="gradient">Search</Button>{' '}
        </div>{' '}
      </Card>{' '}
      {/* Help Categories */}{' '}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {' '}
        {categories.map((category) => (
          <Link key={category.id} href={category.link}>
            {' '}
            <Card variant="glass" hover className="h-full border-2 border-gray-800 hover:border-blue-500 transition-all hover-lift">
              {' '}
              <div className="flex flex-col items-center text-center p-6">
                {' '}
                <div className="mb-4 text-blue-400">
                  {' '}
                  {category.icon}{' '}
                </div>{' '}
                <h3 className="text-xl font-semibold text-white mb-2">
                  {' '}
                  {category.title}{' '}
                </h3>{' '}
                <p className="text-sm text-gray-400">
                  {' '}
                  {category.description}{' '}
                </p>{' '}
              </div>{' '}
            </Card>{' '}
          </Link>
        ))}{' '}
      </div>{' '}
      {/* Quick Links */}{' '}
      <Card variant="glass" title="Quick Links" className="mt-8 border border-gray-800">
        {' '}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {' '}
          <Link href="/help/faq">
            {' '}
            <div className="p-4 border border-gray-800 rounded-lg glass-effect bg-[#1C1C26] hover:bg-[#252532] transition-colors hover-lift">
              {' '}
              <h4 className="font-medium text-white">Common Questions</h4>{' '}
              <p className="text-sm text-gray-400 mt-1">
                Find answers to common questions
              </p>{' '}
            </div>{' '}
          </Link>{' '}
          <Link href="/help/contact">
            {' '}
            <div className="p-4 border border-gray-800 rounded-lg glass-effect bg-[#1C1C26] hover:bg-[#252532] transition-colors hover-lift">
              {' '}
              <h4 className="font-medium text-white">Need More Help?</h4>{' '}
              <p className="text-sm text-gray-400 mt-1">
                Contact our support team
              </p>{' '}
            </div>{' '}
          </Link>{' '}
        </div>{' '}
      </Card>{' '}
    </div>
  );
}
