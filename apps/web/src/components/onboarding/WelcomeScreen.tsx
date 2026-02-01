/** * Welcome Screen Component * * First step of onboarding - welcome message. * * @component */ 'use client';
import { Card, Button } from '@/components/ui';
import { Sparkles, ArrowRight } from 'lucide-react';
export interface WelcomeScreenProps {
  onNext?: () => void;
  onSkip?: () => void;
  className?: string;
}
/** * Welcome Screen Component * * Displays welcome message and introduction. */ export default function WelcomeScreen({
  onNext,
  onSkip,
  className,
}: WelcomeScreenProps) {
  return (
    <div className={className}>
      {' '}
      <Card variant="glass" className="max-w-2xl mx-auto text-center border border-gray-800">
        {' '}
        <div className="mb-6">
          {' '}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full glass-effect bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 mb-4">
            {' '}
            <Sparkles className="w-10 h-10 text-blue-400" />{' '}
          </div>{' '}
        </div>{' '}
        <h1 className="text-3xl font-bold text-white mb-4"> Welcome to Our Platform! </h1>{' '}
        <p className="text-lg text-gray-400 mb-6">
          {' '}
          We're excited to have you here. Let's get you set up in just a few simple steps.{' '}
        </p>{' '}
        <div className="space-y-4 mb-8 text-left max-w-md mx-auto">
          {' '}
          <div className="flex items-start gap-3">
            {' '}
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              {' '}
              1{' '}
            </div>{' '}
            <div>
              {' '}
              <h3 className="font-medium text-white">Set up your profile</h3>{' '}
              <p className="text-sm text-gray-400">Tell us a bit about yourself</p>{' '}
            </div>{' '}
          </div>{' '}
          <div className="flex items-start gap-3">
            {' '}
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              {' '}
              2{' '}
            </div>{' '}
            <div>
              {' '}
              <h3 className="font-medium text-white">Configure preferences</h3>{' '}
              <p className="text-sm text-gray-400">Customize your experience</p>{' '}
            </div>{' '}
          </div>{' '}
          <div className="flex items-start gap-3">
            {' '}
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              {' '}
              3{' '}
            </div>{' '}
            <div>
              {' '}
              <h3 className="font-medium text-white">Invite your team</h3>{' '}
              <p className="text-sm text-gray-400">Get your team started (optional)</p>{' '}
            </div>{' '}
          </div>{' '}
        </div>{' '}
        <div className="flex gap-4 justify-center">
          {' '}
          {onSkip && (
            <Button variant="ghost" onClick={onSkip} className="text-gray-400 hover:bg-[#252532] hover:text-white">
              {' '}
              Skip for now{' '}
            </Button>
          )}{' '}
          {onNext && (
            <Button variant="gradient" onClick={onNext}>
              {' '}
              Get Started <ArrowRight className="w-4 h-4 ml-2" />{' '}
            </Button>
          )}{' '}
        </div>{' '}
      </Card>{' '}
    </div>
  );
}
