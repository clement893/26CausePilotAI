/**
 * HomePhilosophy Component
 * Philosophy section about AI augmentation
 */

'use client';

import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import ButtonLink from '@/components/ui/ButtonLink';
import { CheckCircle2, ArrowRight, Target, Mail, Users } from 'lucide-react';

const keyPoints = [
  {
    icon: Target,
    text: 'Predictive donor scoring to identify major gift potential',
  },
  {
    icon: Mail,
    text: 'Automated content generation for campaign emails',
  },
  {
    icon: Users,
    text: 'Smart segmentation based on engagement behavior',
  },
];

export function HomePhilosophy() {
  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <Container>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div>
            <Badge variant="info" className="mb-4">
              Meet Your New Assistant
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              Augmenting Humans,
              <br />
              <span className="text-blue-600 dark:text-blue-400">Not Replacing Them.</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              We believe the future of fundraising isn't about replacing connection with automation—it's about amplifying human capacity with AI. CausePilot handles the data, the patterns, and the admin, so your fundraisers can focus on what only humans can do: building deep, meaningful relationships.
            </p>

            <div className="space-y-4 mb-8">
              {keyPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pt-2">
                      {point.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mb-8">
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Fundraising has fundamentally changed.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Don't just keep up—lead the transformation. Equip your team with the superpower to raise more, faster, and with greater impact.
              </p>
            </div>

            <ButtonLink
              href="/auth/register"
              size="lg"
              variant="primary"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Join our Beta Testers
              <ArrowRight className="w-5 h-5 ml-2" />
            </ButtonLink>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl p-12 shadow-2xl">
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">AI Analysis Complete</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Identified 127 high-value prospects ready for engagement
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Campaign Optimized</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Personalized messages generated for each segment
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg transform hover:scale-105 transition-transform">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Impact Predicted</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Expected 42% increase in donor engagement
                  </p>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
