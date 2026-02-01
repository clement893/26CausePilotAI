/**
 * HomeDemo Component - Premium Design
 * Interactive demo with stunning animations and transitions
 */

'use client';

import { useState } from 'react';
import { Container, Badge, Card, Button } from '@/components/ui';
import { Sparkles, ArrowRight, Check, Wand2 } from 'lucide-react';

const demoMessages = [
  {
    id: 1,
    original: 'We need money for our new program.',
    enhanced: 'Your past support has enabled us to serve 500 families this year. Now, we\'re ready to expand our impact with a new program that will reach 200 more families in need. Would you consider a gift of $250 to help us launch this initiative?',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    original: 'Please donate to help us reach our goal.',
    enhanced: 'Thanks to generous supporters like you, we\'re 75% of the way to our $50,000 goal. Your contribution of $100 today will directly fund clean water access for 10 families. Will you help us cross the finish line?',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    original: 'Our annual gala is coming up soon.',
    enhanced: 'You\'re invited to our Annual Impact Gala on March 15th! Join 200+ supporters for an evening celebrating the incredible difference we\'ve made together. Your presence and support have been instrumental in our success. Reserve your seat today.',
    color: 'from-orange-500 to-red-500',
  },
];

export function HomeDemo() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleSelectMessage = (id: number) => {
    setSelectedMessage(id);
    setShowEnhanced(false);
    setIsEnhancing(false);
  };

  const handleEnhance = () => {
    if (selectedMessage) {
      setIsEnhancing(true);
      setTimeout(() => {
        setIsEnhancing(false);
        setShowEnhanced(true);
      }, 1500);
    }
  };

  const selectedMsg = demoMessages.find((m) => m.id === selectedMessage);

  return (
    <section className="py-32 bg-gradient-to-br from-[#0A0A0F] via-[#13131A] to-[#1C1C26] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />

      <Container className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex animate-fade-in-up">
            <Badge 
              variant="success" 
              className="px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm"
            >
              <span className="font-semibold bg-gradient-to-r from-green-600 to-emerald-600from-green-400to-emerald-400 bg-clip-text text-transparent">
                Try It Yourself
              </span>
            </Badge>
          </div>

          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight animate-fade-in-up animation-delay-100">
            Experience the
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Magic
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
            See how CausePilot AI transforms generic fundraising appeals into compelling, donor-centric messages in seconds.
          </p>
        </div>

        {/* Demo Interface */}
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 md:p-12 bg-[#1C1C26]/90 backdrop-blur-xl border border-gray-800/50 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Left Side - Input */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Select a draft message
                  </h3>
                </div>

                <div className="space-y-4">
                  {demoMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg.id)}
                      className={`group relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 ${
                        selectedMessage === msg.id
                          ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-xl scale-[1.02]'
                          : 'border-gray-800 hover:border-blue-500 hover:shadow-lg hover:scale-[1.01]'
                      }`}
                    >
                      {/* Gradient border on hover */}
                      {selectedMessage === msg.id && (
                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${msg.color} rounded-2xl blur opacity-20`} />
                      )}
                      
                      <div className="relative flex items-start gap-4">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          selectedMessage === msg.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-700 group-hover:border-blue-500'
                        }`}>
                          {selectedMessage === msg.id && (
                            <Check className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {msg.original}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {selectedMessage && !showEnhanced && !isEnhancing && (
                  <Button
                    onClick={handleEnhance}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6 text-lg font-semibold shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all duration-300 group"
                    size="lg"
                  >
                    <Wand2 className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                    Enhance with AI
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                )}
              </div>

              {/* Right Side - Output */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white font-bold shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    See AI Enhancement
                  </h3>
                </div>

                {/* Empty state */}
                {!selectedMessage && (
                  <div className="h-full min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl bg-[#1C1C26]/50">
                    <div className="text-center p-8">
                      <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500text-gray-400">
                        Select a message to see the AI-enhanced version
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isEnhancing && selectedMsg && (
                  <div className="h-full min-h-[300px] flex items-center justify-center border-2 border-dashed border-blue-500/30 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <div className="text-center p-8">
                      <div className="relative w-16 h-16 mx-auto mb-6">
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${selectedMsg.color} animate-ping opacity-20`} />
                        <div className={`relative w-16 h-16 rounded-full bg-gradient-to-r ${selectedMsg.color} flex items-center justify-center animate-pulse`}>
                          <Sparkles className="w-8 h-8 text-white animate-spin" />
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-white mb-2">
                        AI is enhancing your message...
                      </p>
                      <p className="text-sm text-gray-400">
                        Analyzing tone, context, and donor psychology
                      </p>
                    </div>
                  </div>
                )}

                {/* Waiting state */}
                {selectedMessage && !showEnhanced && !isEnhancing && (
                  <div className="h-full min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-800 rounded-2xl bg-[#1C1C26]/50">
                    <div className="text-center p-8">
                      <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500text-gray-400">
                        Click "Enhance with AI" to see the transformation
                      </p>
                    </div>
                  </div>
                )}

                {/* Enhanced result */}
                {showEnhanced && selectedMsg && (
                  <div className="relative animate-scale-in">
                    {/* Glow effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-r ${selectedMsg.color} rounded-2xl blur-xl opacity-30`} />
                    
                    {/* Content */}
                    <div className="relative p-8 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl border-2 border-green-500/30 shadow-2xl">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-green-400 mb-1">
                            AI-Enhanced Message
                          </p>
                          <p className="text-xs text-gray-400">
                            Optimized for engagement and conversion
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-800text-gray-200 leading-relaxed text-lg">
                        {selectedMsg.enhanced}
                      </p>
                      
                      {/* Metrics */}
                      <div className="mt-6 pt-6 border-t border-green-500/30 grid grid-cols-3 gap-4">
                        {[
                          { label: 'Engagement', value: '+156%', color: 'text-green-600' },
                          { label: 'Clarity', value: '+89%', color: 'text-blue-600' },
                          { label: 'Impact', value: '+124%', color: 'text-purple-600' },
                        ].map((metric, i) => (
                          <div key={i} className="text-center">
                            <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                            <p className="text-xs text-gray-400">{metric.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Container>

      {/* Custom animations */}
      <style jsx>{`
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
      `}</style>
    </section>
  );
}
