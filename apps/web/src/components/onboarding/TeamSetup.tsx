/** * Team Setup Component * * Step for setting up team during onboarding (optional). * * @component */ 'use client';
import { useState } from 'react';
import { Card, Input, Button, Badge } from '@/components/ui';
import { Users, Plus, X } from 'lucide-react';
export interface TeamMember {
  email: string;
  role: string;
}
export interface TeamSetupProps {
  initialData?: { teamName?: string; members?: TeamMember[] };
  onNext?: (data: { teamName: string; members: TeamMember[] }) => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  className?: string;
}
/** * Team Setup Component * * Form for setting up team and inviting members. */ export default function TeamSetup({
  initialData = {},
  onNext,
  onPrevious,
  onSkip,
  className,
}: TeamSetupProps) {
  const [teamName, setTeamName] = useState(initialData.teamName || '');
  const [members, setMembers] = useState<TeamMember[]>(initialData.members || []);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const handleAddMember = () => {
    if (newMemberEmail.trim() && !members.some((m) => m.email === newMemberEmail.trim())) {
      setMembers([...members, { email: newMemberEmail.trim(), role: newMemberRole }]);
      setNewMemberEmail('');
    }
  };
  const handleRemoveMember = (email: string) => {
    setMembers(members.filter((m) => m.email !== email));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onNext) {
      onNext({ teamName, members });
    }
  };
  return (
    <div className={className}>
      {' '}
      <Card variant="glass" title="Set Up Your Team (Optional)" className="max-w-2xl mx-auto border border-gray-800">
        {' '}
        <form onSubmit={handleSubmit} className="space-y-6">
          {' '}
          {/* Team Name */}{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-white mb-2">
              {' '}
              Team Name{' '}
            </label>{' '}
            <div className="form-input-glow">
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="My Team"
              />
            </div>
            <p className="mt-1 text-sm text-gray-400">
              {' '}
              You can create or join a team later if you skip this step{' '}
            </p>{' '}
          </div>{' '}
          {/* Invite Members */}{' '}
          <div>
            {' '}
            <label className="block text-sm font-medium text-white mb-2">
              {' '}
              Invite Team Members{' '}
            </label>{' '}
            <div className="flex gap-2 mb-4">
              {' '}
              <div className="form-input-glow flex-1">
                <Input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="email@example.com"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddMember();
                    }
                  }}
                />
              </div>{' '}
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="px-4 py-2 border border-gray-700 rounded-lg bg-[#1C1C26] text-white"
              >
                {' '}
                <option value="member">Member</option> <option value="admin">Admin</option>{' '}
              </select>{' '}
              <Button type="button" onClick={handleAddMember} variant="gradient">
                {' '}
                <Plus className="w-4 h-4" />{' '}
              </Button>{' '}
            </div>{' '}
            {/* Members List */}{' '}
            {members.length > 0 && (
              <div className="space-y-2">
                {' '}
                {members.map((member) => (
                  <div
                    key={member.email}
                    className="flex items-center justify-between p-3 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg"
                  >
                    {' '}
                    <div className="flex items-center gap-3">
                      {' '}
                      <Users className="w-5 h-5 text-gray-400" />{' '}
                      <span className="text-white">{member.email}</span>{' '}
                      <Badge variant="default">{member.role}</Badge>{' '}
                    </div>{' '}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.email)}
                      className="text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                    >
                      {' '}
                      <X className="w-4 h-4" />{' '}
                    </Button>{' '}
                  </div>
                ))}{' '}
              </div>
            )}{' '}
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
