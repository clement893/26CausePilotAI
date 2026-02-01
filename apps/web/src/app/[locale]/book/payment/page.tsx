/**
 * Payment Page
 * Payment processing page - Generic placeholder
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui';
import { Lock } from 'lucide-react';
import { useEffect } from 'react';

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingReference = searchParams.get('bookingReference');

  useEffect(() => {
    // For now, redirect to confirmation as payment is not implemented
    if (bookingReference) {
      router.push(`/book/confirmation?bookingReference=${bookingReference}`);
    } else {
      router.push('/book');
    }
  }, [bookingReference, router]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <Container>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1C1C26] rounded-full mb-4">
            <Lock className="w-8 h-8 text-gray-400" aria-hidden="true" />
          </div>
          <p className="text-gray-400">Redirection en cours...</p>
        </div>
      </Container>
    </div>
  );
}
