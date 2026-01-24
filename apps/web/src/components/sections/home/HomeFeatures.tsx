/**
 * HomeFeatures Component
 * Features section showcasing the 6 main capabilities
 */

'use client';

import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Brain, Users, Zap, Heart, BarChart3, Shield } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Copilot',
    description: 'Leverage generative AI for nonprofits to get intelligent recommendations on when to ask, how much to ask, and who to target.',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Users,
    title: 'Donor Management',
    description: 'A 360-degree view of your supporters. Track history, preferences, and engagement in one secure nonprofit CRM.',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    icon: Zap,
    title: 'Automated Campaigns',
    description: 'Set up multi-channel communication flows that nurture donors automatically while you sleep.',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    icon: Heart,
    title: 'Smart Donation Forms',
    description: 'Conversion-optimized forms that adapt suggested amounts based on donor history and profile.',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
  },
  {
    icon: BarChart3,
    title: 'Impact Analytics',
    description: 'Real-time dashboards that turn complex data into actionable insights for your board and team.',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Enterprise-grade security with automated tax receipting and compliance built-in.',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
  },
];

export function HomeFeatures() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <Container>
        <div className="text-center mb-16">
          <Badge variant="info" className="mb-4">
            Powerful Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Everything you need to scale your impact
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Replace fragmented tools with one unified platform designed for the modern nonprofit era.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                hover
                className="p-8 group transition-all duration-300 hover:shadow-2xl border border-gray-200 dark:border-gray-700"
              >
                <div className={`inline-flex p-4 rounded-2xl ${feature.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
