/** * Contact Support Component * * Form for contacting support team. Allows users to submit support tickets * with category, priority, and message details. * * @component * @example * ```tsx * <ContactSupport * onSubmit={async (data) => { * await supportTicketsAPI.create(data); * }} * /> * ``` * * @features * - Support ticket creation * - Category selection (technical, billing, feature, general, bug) * - Priority selection (low, medium, high, urgent) * - Form validation * - Success/error handling * * @see {@link https://github.com/clement893/26CausePilotAI/docs/components/contact-support} Component Documentation */ 'use client';
import { useState } from 'react';
import { Card, Input, Textarea, Button, Select, Alert } from '@/components/ui';
import { Send, Mail, MessageSquare } from 'lucide-react';
export interface ContactSupportProps {
  onSubmit?: (data: {
    email: string;
    subject: string;
    message: string;
    category: string;
    priority: string;
  }) => Promise<void>;
  className?: string;
}
/** * Contact Support Component * * Form for users to contact support. */ export default function ContactSupport({
  onSubmit,
  className,
}: ContactSupportProps) {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
    category: '',
    priority: 'medium',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setSuccess(true);
      setFormData({ email: '', subject: '', message: '', category: '', priority: 'medium' });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className={className}>
      {' '}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {' '}
        {/* Contact Form */}{' '}
        <div className="lg:col-span-2">
          {' '}
          <Card variant="glass" title="Contact Support" className="border border-gray-800">
            {' '}
            {success && (
              <div className="mb-4">
                {' '}
                <Alert variant="success">
                  {' '}
                  Your message has been sent successfully! We'll get back to you soon.{' '}
                </Alert>{' '}
              </div>
            )}{' '}
            {error && (
              <div className="mb-4">
                {' '}
                <Alert variant="error" onClose={() => setError(null)}>
                  {' '}
                  {error}{' '}
                </Alert>{' '}
              </div>
            )}{' '}
            <form onSubmit={handleSubmit} className="space-y-4">
              {' '}
              <div>
                {' '}
                <label className="block text-sm font-medium text-white mb-2">
                  {' '}
                  Email *{' '}
                </label>{' '}
                <div className="form-input-glow">
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>{' '}
              <div>
                {' '}
                <label className="block text-sm font-medium text-white mb-2">
                  {' '}
                  Category *{' '}
                </label>{' '}
                <Select
                  options={[
                    { label: 'Select a category', value: '' },
                    { label: 'Technical Issue', value: 'technical' },
                    { label: 'Billing Question', value: 'billing' },
                    { label: 'Feature Request', value: 'feature' },
                    { label: 'General Inquiry', value: 'general' },
                    { label: 'Bug Report', value: 'bug' },
                  ]}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="border-gray-700 bg-[#1C1C26] text-white"
                />{' '}
              </div>{' '}
              <div>
                {' '}
                <label className="block text-sm font-medium text-white mb-2">
                  {' '}
                  Priority{' '}
                </label>{' '}
                <Select
                  options={[
                    { label: 'Low', value: 'low' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'High', value: 'high' },
                    { label: 'Urgent', value: 'urgent' },
                  ]}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="border-gray-700 bg-[#1C1C26] text-white"
                />{' '}
              </div>{' '}
              <div>
                {' '}
                <label className="block text-sm font-medium text-white mb-2">
                  {' '}
                  Subject *{' '}
                </label>{' '}
                <div className="form-input-glow">
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
              </div>{' '}
              <div>
                {' '}
                <label className="block text-sm font-medium text-white mb-2">
                  {' '}
                  Message *{' '}
                </label>{' '}
                <div className="form-input-glow">
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Please provide as much detail as possible..."
                    rows={8}
                    required
                  />
                </div>
              </div>{' '}
              <div className="flex justify-end">
                {' '}
                <Button type="submit" variant="gradient" disabled={isSubmitting}>
                  {' '}
                  <Send className="w-4 h-4 mr-2" />{' '}
                  {isSubmitting ? 'Sending...' : 'Send Message'}{' '}
                </Button>{' '}
              </div>{' '}
            </form>{' '}
          </Card>{' '}
        </div>{' '}
        {/* Contact Info Sidebar */}{' '}
        <div className="space-y-6">
          {' '}
          <Card variant="glass" title="Other Ways to Reach Us" className="border border-gray-800">
            {' '}
            <div className="space-y-4">
              {' '}
              <div className="flex items-start gap-3">
                {' '}
                <Mail className="w-5 h-5 text-blue-400 mt-0.5" />{' '}
                <div>
                  {' '}
                  <h4 className="font-medium text-white">Email</h4>{' '}
                  <p className="text-sm text-gray-400"> support@example.com </p>{' '}
                </div>{' '}
              </div>{' '}
              <div className="flex items-start gap-3">
                {' '}
                <MessageSquare className="w-5 h-5 text-blue-400 mt-0.5" />{' '}
                <div>
                  {' '}
                  <h4 className="font-medium text-white">Response Time</h4>{' '}
                  <p className="text-sm text-gray-400">
                    {' '}
                    We typically respond within 24 hours{' '}
                  </p>{' '}
                </div>{' '}
              </div>{' '}
            </div>{' '}
          </Card>{' '}
          <Card variant="glass" title="Before You Contact Us" className="border border-gray-800">
            {' '}
            <ul className="space-y-2 text-sm text-gray-400">
              {' '}
              <li>• Check our FAQ page for common questions</li>{' '}
              <li>• Search our knowledge base</li> <li>• Review our user guides</li>{' '}
              <li>• Include relevant screenshots if applicable</li>{' '}
            </ul>{' '}
          </Card>{' '}
        </div>{' '}
      </div>{' '}
    </div>
  );
}
