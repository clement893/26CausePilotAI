/**
 * HomePhilosophy Component - Premium Design
 * Philosophy section with elegant visuals
 */

'use client';

import { Container, Badge } from '@/components/ui';
import ButtonLink from '@/components/ui/ButtonLink';
import { ArrowRight, Target, Mail, Users, Check, Sparkles } from 'lucide-react';

const keyPoints = [
  {
    icon: Target,
    text: 'Predictive donor scoring to identify major gift potential',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Mail,
    text: 'Automated content generation for campaign emails',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Users,
    text: 'Smart segmentation based on engagement behavior',
    gradient: 'from-orange-500 to-red-500',
  },
];

const aiFeatures = [
  { label: 'High-value prospects', value: '127', status: 'identified' },
  { label: 'Personalized messages', value: '100%', status: 'generated' },
  { label: 'Engagement increase', value: '+42%', status: 'predicted' },
];

export function HomePhilosophy() {
  return (
    <section className="py-32 bg-[#0A0A0F] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-1/2 right-0 w-[800px] h-[800px] bg-gradient-to-l from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="inline-flex animate-fade-in-up">
              <Badge 
                variant="info" 
                className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm"
              >
                <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600from-blue-400to-purple-400 bg-clip-text text-transparent">
                  Meet Your New Assistant
                </span>
              </Badge>
            </div>

            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in-up animation-delay-100">
              <span className="text-white block mb-2">
                Augmenting Humans,
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                Not Replacing Them.
              </span>
            </h2>

            <p className="text-xl text-gray-300 leading-relaxed animate-fade-in-up animation-delay-200">
              We believe the future of fundraising isn't about replacing connection with automation—it's about{' '}
              <span className="font-semibold text-white">amplifying human capacity</span>{' '}
              with AI. CausePilot handles the data, the patterns, and the admin, so your fundraisers can focus on what only humans can do:{' '}
              <span className="font-semibold text-blue-400">building deep, meaningful relationships</span>.
            </p>

            <div className="space-y-4 animate-fade-in-up animation-delay-300">
              {keyPoints.map((point, index) => {
                const Icon = point.icon;
                return (
                  <div 
                    key={index} 
                    className="group flex items-start gap-4 p-4 rounded-2xl hover:bg-[#252532] transition-all duration-300"
                  >
                    <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${point.gradient} bg-opacity-10 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className="text-lg text-gray-300 group-hover:text-gray-900group-hover:text-white transition-colors duration-300">
                        {point.text}
                      </p>
                    </div>
                    <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                );
              })}
            </div>

            <div className="pt-8 space-y-6 animate-fade-in-up animation-delay-400">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                <p className="text-2xl font-bold text-white mb-3">
                  Fundraising has fundamentally changed.
                </p>
                <p className="text-lg text-gray-300">
                  Don't just keep up—<span className="font-semibold text-blue-400">lead the transformation</span>. 
                  Equip your team with the superpower to raise more, faster, and with greater impact.
                </p>
              </div>

              <ButtonLink
                href="/auth/register"
                size="lg"
                variant="primary"
                className="group inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
              >
                Join our Beta Testers
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
              </ButtonLink>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative animate-fade-in-up animation-delay-300">
            {/* Main Card */}
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
              
              {/* Card */}
              <div className="relative bg-[#1C1C26]/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-800/50 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
                
                {/* Content */}
                <div className="relative space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">
                      AI Analysis
                    </h3>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100bg-green-900/30 border border-green-500/30">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-xs font-semibold text-green-400">Live</span>
                    </div>
                  </div>

                  {/* AI Features */}
                  <div className="space-y-4">
                    {aiFeatures.map((feature, i) => (
                      <div 
                        key={i}
                        className="group/item p-5 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100from-gray-800to-gray-900 border border-gray-800 hover:scale-[1.02] hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-semibold text-gray-400">
                              {feature.status}
                            </span>
                          </div>
                          <Sparkles className="w-4 h-4 text-blue-400 opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                        </div>
                        <div className="flex items-end justify-between">
                          <p className="text-sm text-gray-300">
                            {feature.label}
                          </p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600from-blue-400to-purple-400 bg-clip-text text-transparent">
                            {feature.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress bars */}
                  <div className="pt-6 space-y-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Campaign Optimization</span>
                      <span className="font-semibold text-white">94%</span>
                    </div>
                    <div className="h-3 bg-gray-200bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-expand-width" style={{ width: '94%' }} />
                    </div>

                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-400">Donor Insights</span>
                      <span className="font-semibold text-white">87%</span>
                    </div>
                    <div className="h-3 bg-gray-200bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-expand-width animation-delay-200" style={{ width: '87%' }} />
                    </div>
                  </div>

                  {/* Bottom badge */}
                  <div className="pt-6 mt-6 border-t border-gray-800">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          AI-Powered Recommendations
                        </p>
                        <p className="text-xs text-gray-400">
                          Updated in real-time
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl animate-float" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl animate-float-delayed" />
          </div>
        </div>
      </Container>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(10px, -10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-10px, 10px); }
        }
        @keyframes expand-width {
          from { width: 0; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .animate-expand-width { animation: expand-width 1.5s ease-out forwards; }
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
      `}</style>
    </section>
  );
}
