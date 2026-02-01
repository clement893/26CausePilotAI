/**
 * File Validation Utilities
 *
 * Server-side file validation for security. Provides comprehensive validation
 * including file size, MIME type, extension matching, and filename sanitization.
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
}

export const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  all: [] as string[],
};

ALLOWED_MIME_TYPES.all = [...ALLOWED_MIME_TYPES.images, ...ALLOWED_MIME_TYPES.documents];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_FILE_SIZE_IMAGE = undefined;

export function sanitizeFileName(fileName: string): string {
  const baseName = fileName.split(/[/\\]/).pop() || fileName;
  let sanitized = baseName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '')
    .replace(/_+/g, '_')
    .substring(0, 255);
  if (!sanitized || sanitized.length === 0) {
    sanitized = `file_${Date.now()}`;
  }
  return sanitized;
}

export function validateMimeType(
  mimeType: string,
  allowedTypes: string[] = ALLOWED_MIME_TYPES.all
): boolean {
  return allowedTypes.includes(mimeType);
}

export function validateFileSize(
  size: number,
  maxSize: number | undefined = MAX_FILE_SIZE
): boolean {
  if (maxSize === undefined || maxSize === null) {
    return size > 0;
  }
  return size > 0 && size <= maxSize;
}

export function getFileExtension(fileName: string): string {
  const parts = fileName.split('.');
  if (parts.length < 2) return '';
  const extension = parts[parts.length - 1];
  return extension ? extension.toLowerCase() : '';
}

export function validateExtensionMatchesMimeType(fileName: string, mimeType: string): boolean {
  const extension = getFileExtension(fileName);
  const mimeToExt: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/jpg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/gif': ['gif'],
    'image/webp': ['webp'],
    'image/svg+xml': ['svg'],
    'application/pdf': ['pdf'],
    'application/msword': ['doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.ms-excel': ['xls'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'text/plain': ['txt'],
    'text/csv': ['csv'],
  };
  const allowedExtensions = mimeToExt[mimeType];
  if (!allowedExtensions) return false;
  return allowedExtensions.includes(extension);
}

export function validateFile(
  file: { name: string; size: number; type: string },
  options: {
    allowedTypes?: string[];
    maxSize?: number | undefined;
    requireExtensionMatch?: boolean;
  } = {}
): FileValidationResult {
  const { allowedTypes = ALLOWED_MIME_TYPES.all, maxSize, requireExtensionMatch = true } = options;
  const isImage = file.type.startsWith('image/');
  const effectiveMaxSize =
    maxSize !== undefined ? maxSize : isImage ? MAX_FILE_SIZE_IMAGE : MAX_FILE_SIZE;

  if (effectiveMaxSize !== undefined && effectiveMaxSize !== null) {
    if (!validateFileSize(file.size, effectiveMaxSize)) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${Math.round(effectiveMaxSize / 1024 / 1024)}MB`,
      };
    }
  } else if (file.size <= 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (!validateMimeType(file.type, allowedTypes)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }

  if (requireExtensionMatch && !validateExtensionMatchesMimeType(file.name, file.type)) {
    return {
      valid: false,
      error: `File extension does not match MIME type. File: ${file.name}, MIME: ${file.type}`,
    };
  }

  const sanitizedName = sanitizeFileName(file.name);
  return { valid: true, sanitizedName };
}

export function generateUniqueFileName(originalFileName: string): string {
  const sanitized = sanitizeFileName(originalFileName);
  const extension = getFileExtension(sanitized);
  const baseName = sanitized.replace(/\.[^/.]+$/, '') || 'file';
  const uuid = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  return extension ? `${baseName}-${uuid}.${extension}` : `${baseName}-${uuid}`;
}
