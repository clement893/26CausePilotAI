'use client';

import { useState } from 'react';
import { Save, Eye, Code } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui';
import { getErrorMessage } from '@/lib/errors';

interface TemplateEditorProps {
  entityType: string;
  onSave?: (template: { id: number; name: string }) => void;
  templateId?: number;
  className?: string;
}

export function TemplateEditor({ entityType, onSave, templateId, className = '' }: TemplateEditorProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) {
      showToast({ message: 'Name and content are required', type: 'error' });
      return;
    }

    setIsSaving(true);

    try {
      if (templateId) {
        // Update existing template
        await apiClient.put(`/v1/templates/${templateId}`, {
          name,
          content,
          description,
          category,
          is_public: isPublic,
        });
        showToast({ message: 'Template updated successfully', type: 'success' });
      } else {
        // Create new template
        const response = await apiClient.post<{ id: number; name: string }>('/api/v1/templates/templates', {
          name,
          content,
          description,
          category,
          entity_type: entityType,
          is_public: isPublic,
        });

        if (response.data) {
          onSave?.(response.data);
          showToast({ message: 'Template created successfully', type: 'success' });
        }
      }
    } catch (error: unknown) {
      showToast({ message: getErrorMessage(error) || 'Failed to save template', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card variant="glass" className={`${className} border border-gray-800`}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{templateId ? 'Edit Template' : 'Create Template'}</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)} className="border-gray-700 text-gray-300 hover:bg-[#252532]">
              {previewMode ? <Code className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {previewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button variant="gradient" size="sm" onClick={handleSave} loading={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-input-glow">
            <Input
              label="Template Name"
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder="e.g., Welcome Email"
              required
            />
          </div>
          <div className="form-input-glow">
            <Input
              label="Category"
              value={category}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
              placeholder="e.g., email, document"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Description</label>
          <div className="form-input-glow">
            <textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Describe what this template is for..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-[#1C1C26] text-white"
            />
          </div>
        </div>

        {previewMode ? (
          <div className="p-4 glass-effect bg-[#1C1C26] rounded-lg border border-gray-800">
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-300">{content}</pre>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Template Content <span className="text-red-400">*</span>
            </label>
            <div className="form-input-glow">
              <textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
                placeholder="Enter template content. Use {{variable}} for variables..."
                rows={10}
                required
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-[#1C1C26] text-white font-mono text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsPublic(e.target.checked)}
            className="rounded border-gray-700 bg-[#1C1C26]"
          />
          <label htmlFor="isPublic" className="text-sm text-white">
            Make this template public
          </label>
        </div>

        <div className="text-xs text-gray-400">
          <p>
            Use variables in your template with <code className="bg-[#1C1C26] px-1 rounded border border-gray-800">{'{{variable_name}}'}</code> syntax.
          </p>
          <p className="mt-1">
            Example: <code className="bg-[#1C1C26] px-1 rounded border border-gray-800">Hello {'{{user_name}}'}, welcome to {'{{project_name}}'}!</code>
          </p>
        </div>
      </div>
    </Card>
  );
}
