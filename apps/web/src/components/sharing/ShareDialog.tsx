'use client';
import { useState } from 'react';
import { Share2, User, Users, Lock, Calendar, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui';
import { getErrorMessage } from '@/lib/errors';
interface ShareDialogProps {
  entityType: string;
  entityId: number;
  onClose: () => void;
  onShare?: () => void;
}
type PermissionLevel = 'view' | 'comment' | 'edit' | 'admin';
type ShareWithType = 'user' | 'team';
export function ShareDialog({ entityType, entityId, onClose, onShare }: ShareDialogProps) {
  const [shareWithType, setShareWithType] = useState<ShareWithType>('user');
  const [shareWithId, setShareWithId] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>('view');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isPublicLink, setIsPublicLink] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const { showToast } = useToast();
  const handleShare = async () => {
    if (!shareWithId.trim() && !isPublicLink) {
      showToast({ message: 'Please enter a user/team ID or enable public link', type: 'error' });
      return;
    }
    if (requiresPassword && !password.trim()) {
      showToast({ message: 'Password is required', type: 'error' });
      return;
    }
    setIsSharing(true);
    try {
      await apiClient.post('/v1/shares', {
        entity_type: entityType,
        entity_id: entityId,
        shared_with_type: isPublicLink ? 'public' : shareWithType,
        shared_with_id: isPublicLink ? 0 : parseInt(shareWithId),
        permission_level: permissionLevel,
        requires_password: requiresPassword,
        password: requiresPassword ? password : undefined,
        is_public_link: isPublicLink,
        expires_at: expiresAt || undefined,
      });
      showToast({
        message: isPublicLink ? 'Public link created successfully' : 'Shared successfully',
        type: 'success',
      });
      onShare?.();
      onClose();
    } catch (error: unknown) {
      showToast({ message: getErrorMessage(error) || 'Failed to share', type: 'error' });
    } finally {
      setIsSharing(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Share</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#252532] rounded text-gray-400 hover:text-white transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">
          {/* Share type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Share with
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShareWithType('user');
                  setIsPublicLink(false);
                }}
                className={`flex-1 p-2 border rounded-lg transition-colors ${shareWithType === 'user' && !isPublicLink ? 'border-blue-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white' : 'border-gray-700 text-gray-400 hover:bg-[#252532]'}`}
              >
                <User className="h-4 w-4 mx-auto mb-1" /> <span className="text-xs">User</span>
              </button>
              <button
                onClick={() => {
                  setShareWithType('team');
                  setIsPublicLink(false);
                }}
                className={`flex-1 p-2 border rounded-lg transition-colors ${shareWithType === 'team' && !isPublicLink ? 'border-blue-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white' : 'border-gray-700 text-gray-400 hover:bg-[#252532]'}`}
              >
                <Users className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs">Team</span>
              </button>
              <button
                onClick={() => setIsPublicLink(!isPublicLink)}
                className={`flex-1 p-2 border rounded-lg transition-colors ${isPublicLink ? 'border-blue-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white' : 'border-gray-700 text-gray-400 hover:bg-[#252532]'}`}
              >
                <Share2 className="h-4 w-4 mx-auto mb-1" />
                <span className="text-xs">Public Link</span>
              </button>
            </div>
          </div>
          {/* Share with ID */}
          {!isPublicLink && (
            <div className="form-input-glow">
              <Input
                label={shareWithType === 'user' ? 'User ID' : 'Team ID'}
                type="number"
                value={shareWithId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setShareWithId(e.target.value)}
                placeholder={`Enter ${shareWithType} ID`}
              />
            </div>
          )}
          {/* Permission level */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Permission Level
            </label>
            <select
              value={permissionLevel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setPermissionLevel(e.target.value as PermissionLevel)
              }
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-[#1C1C26] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="view">View Only</option>
              <option value="comment">View & Comment</option>
              <option value="edit">View, Comment & Edit</option>
              <option value="admin">Admin (Full Access)</option>
            </select>
          </div>
          {/* Password protection */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requiresPassword"
              checked={requiresPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setRequiresPassword(e.target.checked)
              }
              className="rounded border-gray-700 bg-[#1C1C26] text-blue-500 focus:ring-blue-500"
            />
            <label
              htmlFor="requiresPassword"
              className="text-sm text-gray-300 flex items-center gap-1"
            >
              <Lock className="h-3 w-3" /> Require password
            </label>
          </div>
          {requiresPassword && (
            <div className="form-input-glow">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
          )}
          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Expires At (Optional)
            </label>
            <div className="form-input-glow">
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1 border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white">
              Cancel
            </Button>
            <Button variant="gradient" onClick={handleShare} loading={isSharing} className="flex-1">
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
