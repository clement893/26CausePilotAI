'use client';
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Heart, Tag, FileText, Folder, User, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui';
import { getErrorMessage } from '@/lib/errors';
import { formatDistanceToNow } from '@/lib/utils/dateUtils';
interface Favorite {
  id: number;
  entity_type: string;
  entity_id: number;
  notes?: string;
  tags?: string;
  created_at: string;
}
interface FavoritesListProps {
  entityType?: string;
  className?: string;
  onFavoriteClick?: (favorite: Favorite) => void;
}
const getEntityIcon = (entityType: string) => {
  switch (entityType.toLowerCase()) {
    case 'project':
    case 'file':
      return <FileText className="h-4 w-4" />;
    case 'folder':
      return <Folder className="h-4 w-4" />;
    case 'user':
      return <User className="h-4 w-4" />;
    default:
      return <Heart className="h-4 w-4" />;
  }
};
export function FavoritesList({ entityType, className = '', onFavoriteClick }: FavoritesListProps) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  useEffect(() => {
    fetchFavorites();
  }, [entityType]);
  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<Favorite[]>('/api/v1/favorites/favorites', {
        params: { entity_type: entityType, limit: 50 },
      });
      if (response.data) {
        setFavorites(response.data);
      }
    } catch (error) {
      logger.error('', 'Failed to fetch favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleRemove = async (favorite: Favorite) => {
    try {
      await apiClient.delete(`/v1/favorites/${favorite.entity_type}/${favorite.entity_id}`);
      setFavorites(favorites.filter((f) => f.id !== favorite.id));
      showToast({ message: 'Removed from favorites', type: 'success' });
    } catch (error: unknown) {
      showToast({ message: getErrorMessage(error) || 'Failed to remove favorite', type: 'error' });
    }
  };
  if (isLoading) {
    return (
      <Card variant="glass" className={className}>
        <div className="text-center py-8 text-gray-400">Loading favorites...</div>
      </Card>
    );
  }
  if (favorites.length === 0) {
    return (
      <Card variant="glass" className={className}>
        <div className="text-center py-8 text-gray-400">
          <Heart className="h-12 w-12 mx-auto mb-4 text-gray-500" /> <p className="text-white">No favorites yet</p>
          <p className="text-sm mt-2 text-gray-400">Start favoriting items to see them here</p>
        </div>
      </Card>
    );
  }
  return (
    <Card variant="glass" className={`border border-gray-800 ${className}`}>
      <div className="space-y-3">
        {favorites.map((favorite) => (
          <div
            key={favorite.id}
            className="flex items-start gap-3 p-3 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg hover:bg-[#252532] cursor-pointer hover-lift transition-colors"
            onClick={() => onFavoriteClick?.(favorite)}
          >
            <div className="flex-shrink-0 mt-1 text-gray-400"> {getEntityIcon(favorite.entity_type)} </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm text-white capitalize">
                    {favorite.entity_type} #{favorite.entity_id}
                  </p>
                  {favorite.notes && (
                    <p className="text-xs text-gray-400 mt-1"> {favorite.notes} </p>
                  )}
                  {favorite.tags && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="h-3 w-3 text-gray-500" />
                      <span className="text-xs text-gray-400"> {favorite.tags} </span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(favorite.created_at))}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(favorite);
                  }}
                  className="p-1 hover:bg-[#252532] rounded text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
