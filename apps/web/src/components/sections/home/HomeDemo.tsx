/**
 * HomeDemo Component
 * Interactive demo section showing AI transformation
 */

'use client';

import { useState } from 'react';
import { Container, Badge, Card, Button } from '@/components/ui';
import { Sparkles, ArrowRight } from 'lucide-react';

const demoMessages = [
  {
    id: 1,
    original: 'We need money for our new program.',
    enhanced: 'Your past support has enabled us to serve 500 families this year. Now, we\'re ready to expand our impact with a new program that will reach 200 more families in need. Would you consider a gift of $250 to help us launch this initiative?',
  },
  {
    id: 2,
    original: 'Please donate to help us reach our goal.',
    enhanced: 'Thanks to generous supporters like you, we\'re 75% of the way to our $50,000 goal. Your contribution of $100 today will directly fund clean water access for 10 families. Will you help us cross the finish line?',
  },
  {
    id: 3,
    original: 'Our annual gala is coming up soon.',
    enhanced: 'You\'re invited to our Annual Impact Gala on March 15th! Join 200+ supporters for an evening celebrating the incredible difference we\'ve made together. Your presence and support have been instrumental in our success. Reserve your seat today.',
  },
];

export function HomeDemo() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(false);

  const handleSelectMessage = (id: number) => {
    setSelectedMessage(id);
    setShowEnhanced(false);
  };

  const handleEnhance = () => {
    if (selectedMessage) {
      setShowEnhanced(true);
    }
  };

  const selectedMsg = demoMessages.find((m) => m.id === selectedMessage);

  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-800">
      <Container>
        <div className="text-center mb-16">
          <Badge variant="success" className="mb-4">
            Try It Yourself
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Experience the Magic
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            See how CausePilot AI transforms generic fundraising appeals into compelling, donor-centric messages in seconds.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <Card className="p-8 md:p-12 bg-white dark:bg-gray-900">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Side - Selection */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 mr-3 text-sm font-bold">
                    1
                  </span>
                  Select a draft message
                </h3>
                <div className="space-y-3">
                  {demoMessages.map((msg) => (
                    <button
                      key={msg.id}
                      onClick={() => handleSelectMessage(msg.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedMessage === msg.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                      }`}
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300">{msg.original}</p>
                    </button>
                  ))}
                </div>

                {selectedMessage && !showEnhanced && (
                  <Button
                    onClick={handleEnhance}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Enhance with AI
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>

              {/* Right Side - Result */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 mr-3 text-sm font-bold">
                    2
                  </span>
                  See AI Enhancement
                </h3>

                {!selectedMessage && (
                  <div className="h-full min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-gray-400 dark:text-gray-600 text-center px-4">
                      Select a message to see the AI-enhanced version
                    </p>
                  </div>
                )}

                {selectedMessage && !showEnhanced && (
                  <div className="h-full min-h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-gray-400 dark:text-gray-600 text-center px-4">
                      Click "Enhance with AI" to see the transformation
                    </p>
                  </div>
                )}

                {showEnhanced && selectedMsg && (
                  <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border-2 border-green-200 dark:border-green-800 animate-fade-in">
                    <div className="flex items-start gap-3 mb-3">
                      <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                        AI-Enhanced Message
                      </p>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {selectedMsg.enhanced}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Container>
    </section>
  );
}
