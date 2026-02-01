/**
 * HomeHero Component - Premium Design
 * Main hero section with stunning visuals and animations
 */

'use client';

import { Badge, Container } from '@/components/ui';
import ButtonLink from '@/components/ui/ButtonLink';
import { Sparkles, ArrowRight, Play } from 'lucide-react';

export function HomeHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0A0A0F] via-[#13131A] to-[#1C1C26]">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      
      {/* Floating Orbs with Blur */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl animate-float" />
        <div className="absolute top-1/3 -right-48 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-indigo-400/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      {/* Gradient Mesh Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/50 via-transparent to-transparent pointer-events-none" />

      <Container className="relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge with glow effect */}
            <div className="inline-flex animate-fade-in-up">
              <Badge 
                variant="info" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm hover:scale-105 transition-transform duration-300 shadow-lg shadow-blue-500/10"
              >
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  New: AI Copilot for Fundraising
                </span>
              </Badge>
            </div>

            {/* Main Heading with gradient */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[1.1] tracking-tight animate-fade-in-up animation-delay-100">
              <span className="block text-white mb-2">
                AI Fundraising
              </span>
              <span className="block text-white mb-2">
                Software for
              </span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
                Modern Nonprofits
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up animation-delay-200">
              Empower your organization with{' '}
              <span className="font-semibold text-white">CausePilot AI</span>. 
              The all-in-one platform that combines{' '}
              <span className="text-blue-400">predictive donor analytics</span>,{' '}
              <span className="text-purple-400">automated stewardship</span>, and{' '}
              <span className="text-pink-400">intelligent insights</span>{' '}
              to maximize your impact.
            </p>

            {/* Launch Badge */}
            <div className="animate-fade-in-up animation-delay-300">
              <p className="text-lg font-semibold text-blue-400 mb-8 flex items-center justify-center lg:justify-start gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                Launching globally in 2027
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up animation-delay-400">
              <ButtonLink
                href="/auth/register"
                size="lg"
                variant="primary"
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-4 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2">
                  Join our Beta Testers
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </ButtonLink>

              <ButtonLink
                href="#demo"
                size="lg"
                variant="outline"
                className="group border-2 border-gray-700 hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </ButtonLink>
            </div>

            {/* Coming Soon Badge */}
            <div className="animate-fade-in-up animation-delay-500">
              <Badge 
                variant="default" 
                className="bg-gradient-to-r from-gray-800 to-gray-700 text-gray-300 border-0 px-6 py-2 shadow-lg"
              >
                <span className="font-bold">COMING SOON</span>
                <span className="mx-2">•</span>
                <span>2027</span>
              </Badge>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative hidden lg:block animate-fade-in-up animation-delay-300">
            {/* Floating Card with glassmorphism */}
            <div className="relative group">
              {/* Glow effect behind card */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              
              {/* Main card */}
              <div className="relative bg-[#1C1C26]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                
                {/* Content */}
                <div className="relative space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">
                      Fundraising Dashboard
                    </h3>
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total Revenue', value: '$284.7K', change: '+23%', color: 'from-green-500 to-emerald-500' },
                      { label: 'Active Donors', value: '1,923', change: '+12%', color: 'from-blue-500 to-cyan-500' },
                      { label: 'Campaigns', value: '8', change: '+2', color: 'from-purple-500 to-pink-500' },
                      { label: 'Conversion', value: '42.8%', change: '+5%', color: 'from-orange-500 to-red-500' },
                    ].map((stat, i) => (
                      <div 
                        key={i} 
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 hover:scale-105 transition-transform duration-300"
                      >
                        <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                        <p className={`text-xs font-semibold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                          {stat.change}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Chart visualization */}
                  <div className="space-y-3">
                    {[85, 92, 78, 95, 88].map((width, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-12 text-xs text-gray-400">
                          Week {i + 1}
                        </div>
                        <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-expand-width"
                            style={{ width: `${width}%`, animationDelay: `${i * 100}ms` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Insight Badge */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <p className="text-sm font-semibold text-white mb-1">
                          AI Insight
                        </p>
                        <p className="text-xs text-gray-400">
                          127 high-value prospects identified for major gift potential
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 30px) scale(0.9); }
          66% { transform: translate(20px, -20px) scale(1.1); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -15px) scale(1.05); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes expand-width {
          from { width: 0; }
        }
        .animate-float { animation: float 20s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 25s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 30s ease-in-out infinite; }
        .animate-gradient { 
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        .animate-expand-width { animation: expand-width 1s ease-out forwards; }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-400 { animation-delay: 400ms; }
        .animation-delay-500 { animation-delay: 500ms; }
      `}</style>
    </section>
  );
}
