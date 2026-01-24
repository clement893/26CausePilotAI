/**
 * Demo Home Page - CausePilot
 * Modern landing page inspired by causepilot.ai/en
 * Accessible at /demohome
 */

'use client';

import {
  HomeHero,
  HomeFeatures,
  HomeDemo,
  HomePhilosophy,
  HomeNewsletter,
} from '@/components/sections/home';

export default function DemoHomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <HomeHero />
      <HomeFeatures />
      <HomeDemo />
      <HomePhilosophy />
      <HomeNewsletter />
    </div>
  );
}
