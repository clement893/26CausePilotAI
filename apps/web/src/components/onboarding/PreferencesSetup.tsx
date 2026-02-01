/** * Preferences Setup Component * * Step for setting up user preferences during onboarding. * * @component */ 'use client';
import { useState } from 'react';
import { Card, Select, Switch, Button } from '@/components/ui';
export interface PreferencesData {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  marketingEmails: boolean;
  weeklyDigest: boolean;
}
export interface PreferencesSetupProps {
  initialData?: Partial<PreferencesData>;
  onNext?: (data: PreferencesData) => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  className?: string;
}
const defaultPreferences: PreferencesData = {
  language: 'en',
  timezone: 'UTC',
  theme: 'system',
  emailNotifications: true,
  marketingEmails: false,
  weeklyDigest: true,
};
/** * Preferences Setup Component * * Form for collecting user preferences. */ export default function PreferencesSetup({
  initialData = {},
  onNext,
  onPrevious,
  onSkip,
  className,
}: PreferencesSetupProps) {
  const [formData, setFormData] = useState<PreferencesData>({
    ...defaultPreferences,
    ...initialData,
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext) {
      onNext(formData);
    }
  };
  return (
    <div className={className}>
      {' '}
      <Card variant="glass" title="Configure Your Preferences" className="max-w-2xl mx-auto border border-gray-800">
        {' '}
        <form onSubmit={handleSubmit} className="space-y-6">
          {' '}
          {/* Language */}{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-white mb-2">
              {' '}
              Language{' '}
            </label>{' '}
            <Select
              options={[
                { label: 'English', value: 'en' },
                { label: 'Français', value: 'fr' },
                { label: 'Español', value: 'es' },
                { label: 'Deutsch', value: 'de' },
              ]}
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="border-gray-700 bg-[#1C1C26] text-white"
            />{' '}
          </div>{' '}
          {/* Timezone */}{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-white mb-2">
              {' '}
              Timezone{' '}
            </label>{' '}
            <Select
              options={[
                { label: 'UTC', value: 'UTC' },
                { label: 'America/New_York (EST)', value: 'America/New_York' },
                { label: 'America/Los_Angeles (PST)', value: 'America/Los_Angeles' },
                { label: 'Europe/London (GMT)', value: 'Europe/London' },
                { label: 'Europe/Paris (CET)', value: 'Europe/Paris' },
                { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
              ]}
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="border-gray-700 bg-[#1C1C26] text-white"
            />{' '}
          </div>{' '}
          {/* Theme */}{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-white mb-2"> Theme </label>{' '}
            <Select
              options={[
                { label: 'System Default', value: 'system' },
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
              ]}
              value={formData.theme}
              onChange={(e) =>
                setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' | 'system' })
              }
              className="border-gray-700 bg-[#1C1C26] text-white"
            />{' '}
          </div>{' '}
          {/* Email Notifications */}{' '}
          <div className="flex items-center justify-between p-4 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg">
            {' '}
            <div>
              {' '}
              <h4 className="font-medium text-white">Email Notifications</h4>{' '}
              <p className="text-sm text-gray-400">
                {' '}
                Receive email notifications for important updates{' '}
              </p>{' '}
            </div>{' '}
            <Switch
              checked={formData.emailNotifications}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
            />{' '}
          </div>{' '}
          {/* Marketing Emails */}{' '}
          <div className="flex items-center justify-between p-4 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg">
            {' '}
            <div>
              {' '}
              <h4 className="font-medium text-white">Marketing Emails</h4>{' '}
              <p className="text-sm text-gray-400">
                {' '}
                Receive emails about new features and promotions{' '}
              </p>{' '}
            </div>{' '}
            <Switch
              checked={formData.marketingEmails}
              onChange={(e) => setFormData({ ...formData, marketingEmails: e.target.checked })}
            />{' '}
          </div>{' '}
          {/* Weekly Digest */}{' '}
          <div className="flex items-center justify-between p-4 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg">
            {' '}
            <div>
              {' '}
              <h4 className="font-medium text-white">Weekly Digest</h4>{' '}
              <p className="text-sm text-gray-400">
                {' '}
                Receive a weekly summary of your activity{' '}
              </p>{' '}
            </div>{' '}
            <Switch
              checked={formData.weeklyDigest}
              onChange={(e) => setFormData({ ...formData, weeklyDigest: e.target.checked })}
            />{' '}
          </div>{' '}
          {/* Actions */}{' '}
          <div className="flex gap-4 justify-between pt-4">
            {' '}
            <div>
              {' '}
              {onPrevious && (
                <Button type="button" variant="ghost" onClick={onPrevious} className="text-gray-400 hover:bg-[#252532] hover:text-white">
                  {' '}
                  Previous{' '}
                </Button>
              )}{' '}
            </div>{' '}
            <div className="flex gap-4">
              {' '}
              {onSkip && (
                <Button type="button" variant="ghost" onClick={onSkip} className="text-gray-400 hover:bg-[#252532] hover:text-white">
                  {' '}
                  Skip{' '}
                </Button>
              )}{' '}
              <Button type="submit" variant="gradient">
                {' '}
                Continue{' '}
              </Button>{' '}
            </div>{' '}
          </div>{' '}
        </form>{' '}
      </Card>{' '}
    </div>
  );
}
