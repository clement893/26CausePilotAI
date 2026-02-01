'use client';

/**
 * ImageUploader - Étape 2.1.3
 * Composant pour uploader logo et images (couverture, fond).
 */

import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui';

export interface ImageUploaderProps {
  value: string | null;
  onChange: (url: string | null) => void;
  onUpload: (formData: FormData) => Promise<{ url?: string; error?: string }>;
  label?: string;
  accept?: string;
  className?: string;
}

export default function ImageUploader({
  value,
  onChange,
  onUpload,
  label = 'Image',
  accept = 'image/jpeg,image/png,image/gif,image/webp',
  className,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const result = await onUpload(formData);
    setUploading(false);
    if (result.url) onChange(result.url);
    else setError(result.error ?? 'Erreur upload');
    e.target.value = '';
  };

  return (
    <div className={className}>
      {label && <p className="mb-2 text-sm font-medium text-white/90">{label}</p>}
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative inline-block">
            <img
              src={value}
              alt={label}
              className="h-24 w-24 rounded-lg border border-white/20 object-cover"
            />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              aria-label="Supprimer"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : null}
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Envoi…' : value ? 'Remplacer' : 'Choisir une image'}
          </Button>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
}
