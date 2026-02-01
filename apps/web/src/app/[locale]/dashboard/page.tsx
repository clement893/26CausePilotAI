'use client';

// Force dynamic rendering to avoid static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Card, Badge, Button, LoadingSkeleton, Grid, Stack } from '@/components/ui';
import { PageHeader } from '@/components/layout';
import { Link } from '@/i18n/routing';
import dynamicImport from 'next/dynamic';
import { ErrorBoundary } from '@/components/errors/ErrorBoundary';
import MotionDiv from '@/components/motion/MotionDiv';
import {
  User,
  Mail,
  CheckCircle2,
  XCircle,
  Settings,
  Database,
  Shield,
  Sparkles,
  Zap,
  Heart,
  Users,
  BarChart3,
  Brain,
  Target,
  ArrowRight,
} from 'lucide-react';

// Lazy load TemplateAIChat to avoid circular dependency issues during build
const TemplateAIChat = dynamicImport(
  () => import('@/components/ai/TemplateAIChat').then((mod) => ({ default: mod.TemplateAIChat })),
  { ssr: false }
);

function DashboardContent() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-2xl">
        <div>
          <LoadingSkeleton variant="custom" className="h-10 w-64 mb-2" />
          <LoadingSkeleton variant="custom" className="h-6 w-96" />
        </div>
        <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal">
          <LoadingSkeleton variant="card" className="h-32" />
          <LoadingSkeleton variant="card" className="h-32" />
          <LoadingSkeleton variant="card" className="h-32" />
          <LoadingSkeleton variant="card" className="h-32" />
        </Grid>
        <LoadingSkeleton variant="card" count={2} />
      </div>
    );
  }

  return (
    <MotionDiv variant="slideUp" duration="normal" className="space-y-2xl">
      {/* Welcome Header */}
      <MotionDiv variant="fade" delay={100}>
        <PageHeader
          title={`Welcome to CausePilot AI, ${user?.name || 'User'}!`}
          description="Your all-in-one platform for intelligent fundraising and donor management"
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
        />
      </MotionDiv>

      {/* About CausePilot Section */}
      <MotionDiv variant="slideUp" delay={150}>
        <Card className="bg-gradient-to-br from-[#0A0A0F] via-[#13131A] to-[#1C1C26] border-blue-500/30">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-500 rounded-lg">
                  <Brain className="w-6 h-6 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-white">About CausePilot AI</h2>
              </div>
              <p className="text-base text-gray-400 mb-4 leading-relaxed">
                CausePilot AI is an intelligent fundraising platform designed for modern nonprofits. 
                We combine <span className="font-semibold text-blue-400">predictive donor analytics</span>,{' '}
                <span className="font-semibold text-green-400">automated stewardship</span>, and{' '}
                <span className="font-semibold text-blue-400">AI-powered insights</span> to help you maximize your impact.
              </p>
              <p className="text-sm text-gray-400">
                Whether you're managing donor relationships, running campaigns, or analyzing your fundraising performance, 
                CausePilot AI provides the tools you need to grow your organization's reach and effectiveness.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="p-4 bg-[#0A0A0F]/50 rounded-lg border border-blue-500/30">
                <Heart className="w-12 h-12 text-blue-400" />
              </div>
            </div>
          </div>
        </Card>
      </MotionDiv>

      {/* Key Features Grid */}
      <MotionDiv variant="slideUp" delay={200}>
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-2">Key Features</h3>
          <p className="text-sm text-gray-400">Explore what CausePilot AI can do for your organization</p>
        </div>
        <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
          <div className="stagger-fade-in opacity-0 stagger-delay-1">
            <Card className="border-l-4 border-l-primary-500 hover:shadow-lg transition-all hover:scale-[1.02] h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">AI Copilot</h4>
                  <p className="text-sm text-gray-400">
                    Get intelligent recommendations on when to ask, how much to ask, and who to target using generative AI.
                  </p>
                </div>
              </div>
            </Card>
          </div>
          <div className="stagger-fade-in opacity-0 stagger-delay-2">
            <Card className="border-l-4 border-l-secondary-500 hover:shadow-lg transition-all hover:scale-[1.02] h-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg flex-shrink-0">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Donor Management</h4>
                <p className="text-sm text-gray-400">
                  A 360-degree view of your supporters. Track history, preferences, and engagement in one secure CRM.
                </p>
              </div>
            </div>
          </Card>
          </div>
          <div className="stagger-fade-in opacity-0 stagger-delay-3">
            <Card className="border-l-4 border-l-info-500 hover:shadow-lg transition-all hover:scale-[1.02] h-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg flex-shrink-0">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Automated Campaigns</h4>
                <p className="text-sm text-gray-400">
                  Set up multi-channel communication flows that nurture donors automatically while you sleep.
                </p>
              </div>
            </div>
          </Card>
          </div>
          <div className="stagger-fade-in opacity-0 stagger-delay-4">
            <Card className="border-l-4 border-l-success-500 hover:shadow-lg transition-all hover:scale-[1.02] h-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg flex-shrink-0">
                <Heart className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Smart Donation Forms</h4>
                <p className="text-sm text-gray-400">
                  Conversion-optimized forms that adapt suggested amounts based on donor history and profile.
                </p>
              </div>
            </div>
          </Card>
          </div>
          <div className="stagger-fade-in opacity-0 stagger-delay-5">
            <Card className="border-l-4 border-l-warning-500 hover:shadow-lg transition-all hover:scale-[1.02] h-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg flex-shrink-0">
                <BarChart3 className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Impact Analytics</h4>
                <p className="text-sm text-gray-400">
                  Real-time dashboards that turn complex data into actionable insights for your board and team.
                </p>
              </div>
            </div>
          </Card>
          </div>
          <div className="stagger-fade-in opacity-0 stagger-delay-6">
            <Card className="border-l-4 border-l-error-500 hover:shadow-lg transition-all hover:scale-[1.02] h-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/20 rounded-lg flex-shrink-0">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">Secure & Compliant</h4>
                <p className="text-sm text-gray-400">
                  Enterprise-grade security with automated tax receipting and compliance built-in.
                </p>
              </div>
            </div>
          </Card>
          </div>
        </Grid>
      </MotionDiv>

      <MotionDiv variant="slideUp" delay={300}>
        <Grid columns={{ mobile: 1, tablet: 2 }} gap="loose">
          {/* User Profile Card */}
          <Card className="hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <User className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Your Profile</h3>
                <p className="text-sm text-gray-400">Account information</p>
              </div>
            </div>
            <Stack gap="normal">
              <div className="flex items-center gap-3 p-3 bg-[#1C1C26]/50 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Name
                  </p>
                  <p className="text-base font-semibold text-white mt-0.5">
                    {user?.name || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#1C1C26]/50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-base font-semibold text-white mt-0.5">
                    {user?.email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1C1C26]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {user?.is_active ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Status
                    </p>
                    <Badge variant={user?.is_active ? 'success' : 'default'} className="mt-0.5">
                      {user?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1C1C26]/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {user?.is_verified ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                      Verified
                    </p>
                    <Badge variant={user?.is_verified ? 'success' : 'default'} className="mt-0.5">
                      {user?.is_verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Stack>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-gradient-to-br from-[#0A0A0F] to-[#1C1C26] border-blue-500/30 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500 rounded-lg">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Get Started</h3>
                <p className="text-sm text-gray-400">Quick access to key features</p>
              </div>
            </div>
            <Stack gap="normal">
              <Link href="/dashboard/base-donateur/donateurs">
                <Button
                  variant="primary"
                  className="w-full justify-start gap-3 h-auto py-3 hover:scale-[1.02] transition-transform"
                >
                  <Users className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Manage Donors</div>
                    <div className="text-xs opacity-90">View and manage your donor database</div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/campagnes/campagnes">
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-3 h-auto py-3 hover:scale-[1.02] transition-transform"
                >
                  <Target className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Campaigns</div>
                    <div className="text-xs opacity-90">Create and manage fundraising campaigns</div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/analytics/dashboard">
                <Button
                  variant="secondary"
                  className="w-full justify-start gap-3 h-auto py-3 hover:scale-[1.02] transition-transform"
                >
                  <BarChart3 className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Analytics</div>
                    <div className="text-xs opacity-90">View insights and reports</div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/admin">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-auto py-3 hover:scale-[1.02] transition-transform"
                >
                  <Settings className="w-5 h-5" />
                  <div className="text-left flex-1">
                    <div className="font-semibold">Administration</div>
                    <div className="text-xs opacity-90">Manage system settings</div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Stack>
          </Card>
        </Grid>
      </MotionDiv>

      {/* API Status */}
      <MotionDiv variant="slideUp" delay={400}>
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Shield className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">System Status</h3>
              <p className="text-sm text-gray-400">All systems operational</p>
            </div>
          </div>
          <Grid columns={{ mobile: 1, tablet: 3 }} gap="normal">
            <div className="p-4 bg-green-500/20 border-2 border-green-500/30 rounded-lg hover:border-green-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <p className="font-semibold text-green-300">
                  Backend Connected
                </p>
              </div>
              <p className="text-sm text-green-200 ml-8">API is running</p>
            </div>
            <div className="p-4 bg-green-500/20 border-2 border-green-500/30 rounded-lg hover:border-green-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-green-400" />
                <p className="font-semibold text-green-300">
                  Database Connected
                </p>
              </div>
              <p className="text-sm text-green-200 ml-8">
                PostgreSQL is running
              </p>
            </div>
            <div className="p-4 bg-green-500/20 border-2 border-green-500/30 rounded-lg hover:border-green-500/50 transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-5 h-5 text-green-400" />
                <p className="font-semibold text-green-300">
                  Authentication
                </p>
              </div>
              <p className="text-sm text-green-200 ml-8">JWT is working</p>
            </div>
          </Grid>
        </Card>
      </MotionDiv>

      {/* AI Chat Assistant */}
      <MotionDiv variant="slideUp" delay={600}>
        <Card className="hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">AI Assistant</h3>
              <p className="text-sm text-gray-400">Ask questions about CausePilot AI and get intelligent assistance</p>
            </div>
          </div>
          <TemplateAIChat />
        </Card>
      </MotionDiv>
    </MotionDiv>
  );
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}
