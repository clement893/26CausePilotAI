/** * Integration Configuration Component * Setup and configure integrations */ 'use client';
import { useState } from 'react';
import { clsx } from 'clsx';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { Save, X, CheckCircle, AlertCircle, Key } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
export interface IntegrationConfigField {
  id: string;
  label: string;
  type: 'text' | 'password' | 'url' | 'email' | 'number';
  value: string;
  required: boolean;
  placeholder?: string;
  helperText?: string;
  sensitive?: boolean;
}
export interface IntegrationConfigProps {
  integration: { id: string; name: string; description: string; icon?: string; category: string };
  fields?: IntegrationConfigField[];
  onSave?: (config: Record<string, string>) => void | Promise<void>;
  onCancel?: () => void;
  onTest?: () => void | Promise<boolean>;
  className?: string;
}
export default function IntegrationConfig({
  integration,
  fields = [],
  onSave,
  onCancel,
  onTest,
  className,
}: IntegrationConfigProps) {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.id]: field.value || '' }), {})
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: '' }));
    }
    setTestResult(null);
  };
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.id]?.trim()) {
        newErrors[field.id] = `${field.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleTest = async () => {
    if (!validate()) return;
    setTestResult(null);
    try {
      const result = await onTest?.();
      setTestResult(result ? 'success' : 'error');
    } catch (_error) {
      setTestResult('error');
    }
  };
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSave?.(formData);
    } catch (_error) {
      setErrors({ submit: 'Failed to save configuration. Please try again.' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Card variant="glass" className={clsx('border border-gray-800', className)}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {integration.icon ? (
              <Avatar src={integration.icon} name={integration.name} size="lg" />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <Key className="w-6 h-6 text-blue-400" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-white">
                Configure {integration.name}
              </h3>
              <p className="text-sm text-gray-400">{integration.description}</p>
            </div>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-300 hover:bg-[#252532] hover:text-white">
              <span className="flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </span>
            </Button>
          )}
        </div>
        {/* Configuration Fields */}
        {fields.length > 0 ? (
          <div className="space-y-4">
            {fields.map((field) => (
              <div key={field.id}>
                <Input
                  label={field.label}
                  type={field.type === 'password' ? 'password' : field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  helperText={field.helperText}
                  error={errors[field.id]}
                  required={field.required}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200">
                <div className="font-medium mb-1">No Configuration Required</div>
                <div>This integration doesn't require any additional configuration.</div>
              </div>
            </div>
          </div>
        )}
        {/* Test Connection */}
        {onTest && fields.length > 0 && (
          <div className="flex items-center justify-between p-4 glass-effect bg-[#1C1C26] rounded-lg border border-gray-800">
            <div>
              <div className="text-sm font-medium text-white mb-1">Test Connection</div>
              <div className="text-xs text-gray-400">
                Verify your configuration before saving
              </div>
            </div>
            <div className="flex items-center gap-3">
              {testResult === 'success' && (
                <Badge variant="success">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Connection Successful
                  </span>
                </Badge>
              )}
              {testResult === 'error' && (
                <Badge variant="error">
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Connection Failed
                  </span>
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleTest} className="border-gray-700 text-gray-300 hover:bg-[#252532] hover:text-white">
                Test
              </Button>
            </div>
          </div>
        )}
        {/* Error Message */}
        {errors.submit && (
          <div className="p-3 bg-red-500/20 rounded-lg border border-red-500/30 text-sm text-red-400">
            {errors.submit}
          </div>
        )}
        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={loading} className="text-gray-300 hover:bg-[#252532] hover:text-white">
              Cancel
            </Button>
          )}
          <Button variant="gradient" onClick={handleSave} loading={loading}>
            <span className="flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Configuration
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
