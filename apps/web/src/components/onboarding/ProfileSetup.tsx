/** * Profile Setup Component * * Step for setting up user profile during onboarding. * * @component */ 'use client';
import { useState } from 'react';
import { Card, Input, Button, Avatar } from '@/components/ui';
import { Upload } from 'lucide-react';
export interface ProfileData {
  firstName: string;
  lastName: string;
  displayName: string;
  bio?: string;
  avatar?: string;
}
export interface ProfileSetupProps {
  initialData?: Partial<ProfileData>;
  onNext?: (data: ProfileData) => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  className?: string;
}
/** * Profile Setup Component * * Form for collecting user profile information. */ export default function ProfileSetup({
  initialData = {},
  onNext,
  onPrevious,
  onSkip,
  className,
}: ProfileSetupProps) {
  const [formData, setFormData] = useState<ProfileData>({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    displayName: initialData.displayName || '',
    bio: initialData.bio || '',
    avatar: initialData.avatar || '',
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext) {
      onNext(formData);
    }
  };
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  const isValid =
    formData.firstName.trim() && formData.lastName.trim() && formData.displayName.trim();
  return (
    <div className={className}>
      {' '}
      <Card variant="glass" title="Set Up Your Profile" className="max-w-2xl mx-auto border border-gray-800">
        {' '}
        <form onSubmit={handleSubmit} className="space-y-6">
          {' '}
          {/* Avatar Upload */}{' '}
          <div className="flex flex-col items-center mb-6">
            {' '}
            <Avatar
              name={formData.displayName || formData.firstName}
              size="xl"
              src={formData.avatar}
              className="mb-4 border-4 border-blue-500/50"
            />{' '}
            <label className="cursor-pointer">
              {' '}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />{' '}
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-700 rounded-lg hover:bg-[#252532] transition-colors text-gray-300 hover:text-white">
                {' '}
                <Upload className="w-4 h-4" />{' '}
                <span className="text-sm font-medium">Upload Photo</span>{' '}
              </div>{' '}
            </label>{' '}
          </div>{' '}
          {/* First Name */}{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-white mb-2">
              {' '}
              First Name *{' '}
            </label>{' '}
            <div className="form-input-glow">
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                required
              />
            </div>
          </div>{' '}
          {/* Last Name */}{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-white mb-2">
              {' '}
              Last Name *{' '}
            </label>{' '}
            <div className="form-input-glow">
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                required
              />
            </div>
          </div>{' '}
          {/* Display Name */}{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-white mb-2">
              {' '}
              Display Name *{' '}
            </label>{' '}
            <div className="form-input-glow">
              <Input
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="johndoe"
                required
              />
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {' '}
              This is how your name will appear to others{' '}
            </p>{' '}
          </div>{' '}
          {/* Bio */}{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-white mb-2">
              {' '}
              Bio (Optional){' '}
            </label>{' '}
            <div className="form-input-glow">
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us a bit about yourself..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-700 rounded-lg bg-[#1C1C26] text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
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
              <Button type="submit" variant="gradient" disabled={!isValid}>
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
