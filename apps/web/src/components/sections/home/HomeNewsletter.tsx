/**
 * HomeNewsletter Component - Premium Design
 * Newsletter subscription with elegant design
 */

'use client';

import { useState } from 'react';
import { Container, Badge, Button, Input } from '@/components/ui';
import { Mail, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export function HomeNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setTimeout(() => {
          setEmail('');
          setIsSubmitted(false);
        }, 5000);
      }, 1000);
    }
  };

  return (
    <section className="py-32 bg-gradient-to-br from-blue-50/20 via-purple-50/20 to-pink-50/20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float-delayed" />

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            {/* Card */}
            <div className="relative bg-[#1C1C26]/90 backdrop-blur-xl rounded-3xl p-12 md:p-16 shadow-2xl border border-gray-800/50">
              {/* Content */}
              <div className="text-center space-y-8">
                {/* Badge */}
                <div className="inline-flex animate-fade-in-up">
                  <Badge 
                    variant="info" 
                    className="px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm"
                  >
                    <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600from-blue-400to-purple-400 bg-clip-text text-transparent">
                      Stay Ahead of the Curve
                    </span>
                  </Badge>
                </div>

                {/* Heading */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in-up animation-delay-100">
                  <span className="text-white block mb-2">
                    Get the latest fundraising insights
                  </span>
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                    delivered to your inbox
                  </span>
                </h2>

                {/* Description */}
                <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
                  Join <span className="font-semibold text-white">2,000+</span> nonprofit leaders receiving our weekly{' '}
                  <span className="font-semibold text-blue-400">"Tech for Good"</span> digest. 
                  No spam, just impact.
                </p>

                {/* Form or Success State */}
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit} className="max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
                    <div className="flex flex-col sm:flex-row gap-4 p-2 bg-[#1C1C26] rounded-2xl shadow-inner">
                      <div className="flex-1 relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="name@organization.org"
                          value={email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                          required
                          disabled={isSubmitting}
                          className="w-full pl-12 pr-4 py-4 text-lg bg-[#0A0A0F] border-0 focus:ring-2 focus:ring-blue-500 rounded-xl"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={isSubmitting}
                        className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 whitespace-nowrap"
                      >
                        {isSubmitting ? (
                          <>
                            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                            Subscribing...
                          </>
                        ) : (
                          <>
                            Subscribe
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border-2 border-green-500/30 animate-scale-in">
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-xl">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Welcome aboard! 🎉
                    </h3>
                    <p className="text-lg text-gray-300">
                      Thank you for subscribing! Check your inbox for a confirmation email.
                    </p>
                  </div>
                )}

                {/* Trust indicators */}
                {!isSubmitted && (
                  <div className="flex flex-wrap items-center justify-center gap-8 pt-8 animate-fade-in-up animation-delay-400">
                    {[
                      { icon: CheckCircle2, text: 'Weekly insights' },
                      { icon: Sparkles, text: 'AI-powered tips' },
                      { icon: Mail, text: 'Unsubscribe anytime' },
                    ].map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-center gap-2 text-gray-400">
                          <Icon className="w-5 h-5 text-blue-400" />
                          <span className="text-sm font-medium">{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Social proof */}
                {!isSubmitted && (
                  <div className="pt-8 animate-fade-in-up animation-delay-500">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-whiteborder-gray-900 flex items-center justify-center text-white font-semibold text-sm"
                          >
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                      </div>
                      <span className="text-sm text-gray-400 ml-2">
                        Join 2,000+ nonprofit leaders
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </Container>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, 20px); }
        }
        .animate-float { animation: float 10s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 12s ease-in-out infinite; }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s ease-out forwards;
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
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
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
