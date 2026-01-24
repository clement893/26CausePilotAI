/**
 * HomeNewsletter Component
 * Newsletter subscription section
 */

'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Mail, CheckCircle2 } from 'lucide-react';

export function HomeNewsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Here you would typically send the email to your backend
      console.log('Newsletter subscription:', email);
      setIsSubmitted(true);
      setTimeout(() => {
        setEmail('');
        setIsSubmitted(false);
      }, 3000);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="info" className="mb-4">
            Stay Ahead of the Curve
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            Get the latest fundraising insights
            <br />
            delivered to your inbox.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Join 2,000+ nonprofit leaders receiving our weekly "Tech for Good" digest. No spam, just impact.
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="name@organization.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-6 py-4 text-lg"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 whitespace-nowrap"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Subscribe to Newsletter
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-3 py-4 mb-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                Thank you for subscribing!
              </p>
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Unsubscribe at any time.
          </p>
        </div>
      </Container>
    </section>
  );
}
