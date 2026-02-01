/**
 * HomeFeatures Component - Premium Design
 * Features section with stunning cards and animations
 */

'use client';

import { Container, Card, Badge } from '@/components/ui';
import { Brain, Users, Zap, Heart, BarChart3, Shield, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI Copilot',
    description: 'Leverage generative AI for nonprofits to get intelligent recommendations on when to ask, how much to ask, and who to target.',
    gradient: 'from-blue-500 to-cyan-500',
    glowColor: 'blue',
    iconBg: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Users,
    title: 'Donor Management',
    description: 'A 360-degree view of your supporters. Track history, preferences, and engagement in one secure nonprofit CRM.',
    gradient: 'from-purple-500 to-pink-500',
    glowColor: 'purple',
    iconBg: 'from-purple-500/10 to-pink-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    icon: Zap,
    title: 'Automated Campaigns',
    description: 'Set up multi-channel communication flows that nurture donors automatically while you sleep.',
    gradient: 'from-orange-500 to-red-500',
    glowColor: 'orange',
    iconBg: 'from-orange-500/10 to-red-500/10',
    borderColor: 'border-orange-500/20',
  },
  {
    icon: Heart,
    title: 'Smart Donation Forms',
    description: 'Conversion-optimized forms that adapt suggested amounts based on donor history and profile.',
    gradient: 'from-red-500 to-pink-500',
    glowColor: 'red',
    iconBg: 'from-red-500/10 to-pink-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    icon: BarChart3,
    title: 'Impact Analytics',
    description: 'Real-time dashboards that turn complex data into actionable insights for your board and team.',
    gradient: 'from-green-500 to-emerald-500',
    glowColor: 'green',
    iconBg: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Enterprise-grade security with automated tax receipting and compliance built-in.',
    gradient: 'from-indigo-500 to-violet-500',
    glowColor: 'indigo',
    iconBg: 'from-indigo-500/10 to-violet-500/10',
    borderColor: 'border-indigo-500/20',
  },
];

export function HomeFeatures() {
  return (
    <section className="py-32 bg-[#0A0A0F] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex animate-fade-in-up">
            <Badge 
              variant="info" 
              className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm"
            >
              <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </Badge>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fade-in-up animation-delay-100">
            Everything you need to
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              scale your impact
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            Replace fragmented tools with one unified platform designed for the modern nonprofit era.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow effect on hover */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                
                {/* Card */}
                <Card className={`relative h-full p-8 bg-[#1C1C26]/80 backdrop-blur-sm border ${feature.borderColor} hover:border-${feature.glowColor}-500/40 transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl overflow-hidden`}>
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.iconBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Content */}
                  <div className="relative space-y-6">
                    {/* Icon */}
                    <div className="relative">
                      <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.iconBg} border ${feature.borderColor} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
                        <Icon className={`w-8 h-8 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent', WebkitBackgroundClip: 'text' }} />
                      </div>
                      
                      {/* Animated ring */}
                      <div className={`absolute inset-0 rounded-2xl border-2 ${feature.borderColor} opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-all duration-300">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>

                    {/* Learn more link */}
                    <div className="pt-4">
                      <button className={`inline-flex items-center gap-2 text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:gap-3`}>
                        Learn more
                        <ArrowRight className="w-4 h-4" style={{ color: 'currentColor' }} />
                      </button>
                    </div>
                  </div>

                  {/* Corner decoration */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-5 rounded-bl-full`} />
                </Card>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center animate-fade-in-up animation-delay-600">
          <p className="text-lg text-gray-300 mb-6">
            Ready to transform your fundraising?
          </p>
          <button className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300">
            Get Started Today
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </Container>

      {/* Custom animations */}
      <style jsx>{`
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
        .animation-delay-600 { animation-delay: 600ms; }
      `}</style>
    </section>
  );
}
