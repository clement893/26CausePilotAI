/**
 * Media Library Component
 *
 * Media file management with grid/gallery/list views.
 *
 * @component
 */
'use client';

import { useState } from 'react';
import { Card, Button, FileUpload, Badge, Modal, Input, Alert } from '@/components/ui';
import {
  Upload,
  Grid3x3,
  List,
  Image as ImageIcon,
  Video,
  File,
  Search,
  Trash2,
  Eye,
} from 'lucide-react';

export interface MediaItem extends Record<string, unknown> {
  id: number;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document' | 'audio' | 'other';
  mime_type: string;
  size: number;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'grid' | 'gallery' | 'list';

export interface MediaLibraryProps {
  media?: MediaItem[];
  onUpload?: (files: File[]) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  onSelect?: (media: MediaItem) => void;
  className?: string;
}

/**
 * Media Library Component
 *
 * Displays media files in grid, gallery, or list view with upload functionality.
 */
export default function MediaLibrary({
  media = [],
  onUpload,
  onDelete,
  onSelect,
  className,
}: MediaLibraryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredMedia = media.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

      const getMediaIcon = (item: MediaItem) => {
    switch (item.type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-red-400" />;
      case 'audio':
        return <File className="w-5 h-5 text-purple-400" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleUpload = async (files: File[]) => {
    try {
      setIsUploading(true);
      setError(null);
      if (onUpload) {
        await onUpload(files);
      }
      setIsUploadModalOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this media file?')) {
      return;
    }
    try {
      if (onDelete) {
        await onDelete(id);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete media');
    }
  };

  const handleSelect = (item: MediaItem) => {
    if (onSelect) {
      onSelect(item);
    } else {
      setSelectedMedia(item);
    }
  };

  return (
    <div className={className}>
      <Card variant="glass" title="Media Library" className="border border-gray-800">
        {/* Toolbar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search media..."
                className="pl-10 form-input-glow"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-700 rounded-lg overflow-hidden bg-[#1C1C26]">
              <Button
                variant={viewMode === 'grid' ? 'gradient' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0 text-gray-300 hover:text-white"
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'gallery' ? 'gradient' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('gallery')}
                className="rounded-none border-0 text-gray-300 hover:text-white"
              >
                <ImageIcon className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'gradient' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none border-0 text-gray-300 hover:text-white"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="gradient" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4">
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </div>
        )}

        {/* Media Display */}
        {filteredMedia.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">No media files found</p>
            <Button variant="gradient" onClick={() => setIsUploadModalOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Media
            </Button>
          </div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="group relative glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover-lift transition-shadow cursor-pointer"
                    onClick={() => handleSelect(item)}
                  >
                    {item.type === 'image' ? (
                      <div className="aspect-square relative bg-[#0A0A0F]">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(item);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white hover:bg-white/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square flex flex-col items-center justify-center bg-[#0A0A0F] p-4">
                        {getMediaIcon(item)}
                        <p className="text-xs text-gray-400 mt-2 text-center truncate w-full">
                          {item.name}
                        </p>
                      </div>
                    )}
                    <div className="p-2 bg-[#1C1C26]">
                      <p className="text-xs font-medium text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{formatFileSize(item.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {viewMode === 'gallery' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMedia
                  .filter((item) => item.type === 'image')
                  .map((item) => (
                    <div
                      key={item.id}
                      className="group relative glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover-lift transition-shadow cursor-pointer"
                      onClick={() => handleSelect(item)}
                    >
                      <div className="aspect-video relative bg-[#0A0A0F]">
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(item);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white hover:bg-white/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-white hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-4 bg-[#1C1C26]">
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="default">{item.type}</Badge>
                          <span className="text-xs text-gray-400">
                            {formatFileSize(item.size)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-2">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 glass-effect bg-[#1C1C26] border border-gray-800 rounded-lg hover:bg-[#252532] hover-lift transition-colors cursor-pointer"
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex-shrink-0">
                      {item.type === 'image' ? (
                        <img
                          src={item.url}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 flex items-center justify-center bg-[#0A0A0F] rounded">
                          {getMediaIcon(item)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="default">{item.type}</Badge>
                        <span className="text-xs text-gray-400">
                          {formatFileSize(item.size)}
                        </span>
                        {item.width && item.height && (
                          <span className="text-xs text-gray-400">
                            {item.width} × {item.height}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(item);
                        }}
                        className="text-gray-400 hover:bg-[#252532] hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="text-gray-400 hover:bg-[#252532] hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Media"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
              disabled={isUploading}
              className="border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white"
            >
              Cancel
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FileUpload
            accept="image/*,video/*,audio/*,application/pdf"
            multiple
            onFileSelect={handleUpload}
            helperText="Supported: Images (no size limit), Videos, Audio, PDF (max 50MB)"
          />
          {isUploading && <Alert variant="info">Uploading files...</Alert>}
        </div>
      </Modal>

      {/* Media Preview Modal */}
      {selectedMedia && !onSelect && (
        <Modal
          isOpen={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
          title={selectedMedia.name}
          size="xl"
        >
          <div className="space-y-4">
            {selectedMedia.type === 'image' && (
              <img src={selectedMedia.url} alt={selectedMedia.name} className="w-full rounded-lg" />
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Type</p>
                <p className="font-medium text-white">{selectedMedia.type}</p>
              </div>
              <div>
                <p className="text-gray-400">Size</p>
                <p className="font-medium text-white">{formatFileSize(selectedMedia.size)}</p>
              </div>
              {selectedMedia.width && selectedMedia.height && (
                <>
                  <div>
                    <p className="text-gray-400">Dimensions</p>
                    <p className="font-medium text-white">
                      {selectedMedia.width} × {selectedMedia.height}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Created</p>
                    <p className="font-medium text-white">
                      {new Date(selectedMedia.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
