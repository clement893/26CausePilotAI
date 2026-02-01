'use client';
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Mail, Edit2, Trash2, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { useToast } from '@/components/ui';
import { getErrorMessage } from '@/lib/errors';
interface EmailTemplate {
  id: number;
  key: string;
  name: string;
  category?: string;
  subject: string;
  html_body: string;
  text_body?: string;
  variables?: string[];
  is_active: boolean;
  is_system: boolean;
  language: string;
  description?: string;
  created_at: string;
}
interface EmailTemplateManagerProps {
  className?: string;
}
export function EmailTemplateManager({ className = '' }: EmailTemplateManagerProps) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EmailTemplate>>({});
  const { showToast } = useToast();
  useEffect(() => {
    fetchTemplates();
  }, []);
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<EmailTemplate[]>(
        '/api/v1/email-templates/email-templates'
      );
      if (response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      logger.error('', 'Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name,
      subject: template.subject,
      html_body: template.html_body,
      text_body: template.text_body,
      category: template.category,
      description: template.description,
      is_active: template.is_active,
    });
    setIsEditing(true);
  };
  const handleSave = async () => {
    if (!selectedTemplate) return;
    try {
      await apiClient.put(`/v1/email-templates/${selectedTemplate.id}`, editForm);
      showToast({ message: 'Template updated successfully', type: 'success' });
      setIsEditing(false);
      fetchTemplates();
    } catch (error: unknown) {
      showToast({ message: getErrorMessage(error) || 'Failed to update template', type: 'error' });
    }
  };
  const handleDelete = async (templateId: number, isSystem: boolean) => {
    if (isSystem) {
      showToast({ message: 'Cannot delete system templates', type: 'error' });
      return;
    }
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await apiClient.delete(`/v1/email-templates/${templateId}`);
      showToast({ message: 'Template deleted successfully', type: 'success' });
      fetchTemplates();
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setIsEditing(false);
      }
    } catch (error: unknown) {
      showToast({ message: getErrorMessage(error) || 'Failed to delete template', type: 'error' });
    }
  };
  if (isLoading) {
    return (
      <Card variant="glass" className={className}>
        <div className="text-center py-8 text-gray-400">Loading templates...</div>
      </Card>
    );
  }
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      <Card variant="glass" className="border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
            <Mail className="h-5 w-5 text-blue-400" /> Email Templates
          </h3>
          <Button variant="gradient" size="sm">
            New Template
          </Button>
        </div>
        {templates.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p className="text-white">No templates found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors hover-lift ${selectedTemplate?.id === template.id ? 'border-blue-500 bg-gradient-to-r from-blue-500/20 to-purple-500/20' : 'border-gray-800 glass-effect bg-[#1C1C26] hover:bg-[#252532]'}`}
                onClick={() => {
                  setSelectedTemplate(template);
                  setIsEditing(false);
                }}
              >
                {' '}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{template.name}</span>
                      {template.is_system && (
                        <span className="text-xs glass-effect bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/50 text-blue-300 px-2 py-0.5 rounded">
                          System
                        </span>
                      )}
                      {!template.is_active && (
                        <span className="text-xs glass-effect bg-[#13131A] border border-gray-800 px-2 py-0.5 rounded text-gray-400"> Inactive </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{template.key}</p>
                    {template.category && (
                      <span className="text-xs text-gray-400">{template.category}</span>
                    )}
                  </div>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-1 hover:bg-[#252532] rounded text-gray-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    {!template.is_system && (
                      <button
                        onClick={() => handleDelete(template.id, template.is_system)}
                        className="p-1 hover:bg-[#252532] rounded text-red-400 hover:text-red-300 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {selectedTemplate && (
        <Card variant="glass" className="border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Template Details</h3>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => handleEdit(selectedTemplate)} className="border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white">
                <Edit2 className="h-4 w-4 mr-2" /> Edit
              </Button>
            )}
          </div>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Name</label>
                <div className="form-input-glow">
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Subject</label>
                <div className="form-input-glow">
                  <Input
                    value={editForm.subject || ''}
                    onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">HTML Body</label>
                <div className="form-input-glow">
                  <textarea
                    value={editForm.html_body || ''}
                    onChange={(e) => setEditForm({ ...editForm, html_body: e.target.value })}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-[#1C1C26] font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Text Body</label>
                <div className="form-input-glow">
                  <textarea
                    value={editForm.text_body || ''}
                    onChange={(e) => setEditForm({ ...editForm, text_body: e.target.value })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-[#1C1C26] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="gradient" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" /> Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-400">Key</label>
                <p className="font-mono text-sm text-gray-300">{selectedTemplate.key}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">Subject</label>
                <p className="text-white">{selectedTemplate.subject}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-400">HTML Body</label>
                <div className="p-3 glass-effect bg-[#13131A] border border-gray-800 rounded max-h-64 overflow-y-auto custom-scrollbar">
                  <pre className="text-xs whitespace-pre-wrap font-mono text-gray-300">
                    {selectedTemplate.html_body}
                  </pre>
                </div>
              </div>
              {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Variables
                  </label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedTemplate.variables.map((varName) => (
                      <span key={varName} className="px-2 py-1 glass-effect bg-[#13131A] border border-gray-800 rounded text-sm font-mono text-gray-300">
                        {`{{${varName}}}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
