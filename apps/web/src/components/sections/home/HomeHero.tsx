/**
 * HomeHero Component
 * Main hero section for the CausePilot homepage
 */

'use client';

import { Badge, Container } from '@/components/ui';
import ButtonLink from '@/components/ui/ButtonLink';
import { Sparkles, ArrowRight } from 'lucide-react';

export function HomeHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-white dark:from-gray-900 dark:via-blue-900/10 dark:to-gray-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-300/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <Container className="relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            <Badge variant="info" className="mb-6 inline-flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              New: AI Copilot for Fundraising
            </Badge>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gray-900 dark:text-white">AI Fundraising</span>
              <br />
              <span className="text-gray-900 dark:text-white">Software for</span>
              <br />
              <span className="text-blue-600 dark:text-blue-400">Modern Nonprofits</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Empower your organization with CausePilot AI. The all-in-one platform that combines predictive donor analytics, automated stewardship, and intelligent insights to maximize your impact.
            </p>

            <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold mb-8">
              Launching globally in 2027.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <ButtonLink
                href="/auth/register"
                size="lg"
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 shadow-xl hover:shadow-2xl transition-all"
              >
                Join our Beta Testers
                <ArrowRight className="w-5 h-5 ml-2" />
              </ButtonLink>
            </div>

            <Badge variant="default" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-0">
              COMING SOON • 2027
            </Badge>
          </div>

          {/* Right Column - Image */}
          <div className="relative hidden lg:block">
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm" />
              {/* Placeholder for dashboard image */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Fundraising Dashboard</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Real-time analytics & insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
