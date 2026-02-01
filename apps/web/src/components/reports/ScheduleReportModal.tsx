'use client';

/**
 * ScheduleReportModal - Étape 4.2.3
 * Modale pour configurer l'envoi récurrent d'un rapport par email.
 */

import { useState, useCallback } from 'react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { scheduleReportAction, type ScheduleFrequency } from '@/app/actions/reports/scheduleReport';
import { CalendarClock } from 'lucide-react';

export interface ScheduleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  reportId?: string;
  predefinedReportType?: string;
  reportName: string;
  userId: string;
}

const FREQUENCY_OPTIONS: { value: ScheduleFrequency; label: string }[] = [
  { value: 'daily', label: 'Quotidien' },
  { value: 'weekly', label: 'Hebdomadaire' },
  { value: 'monthly', label: 'Mensuel' },
];

export function ScheduleReportModal({
  isOpen,
  onClose,
  onSuccess,
  reportId,
  predefinedReportType,
  reportName,
  userId,
}: ScheduleReportModalProps) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<ScheduleFrequency>('weekly');
  const [recipientsText, setRecipientsText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSubmitting(true);
      const recipients = recipientsText
        .split(/[\n,;]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await scheduleReportAction({
        userId,
        name: name.trim() || reportName,
        frequency,
        recipients,
        reportId,
        predefinedReportType,
      });
      setSubmitting(false);
      if (res.error) {
        setError(res.error);
        return;
      }
      setName('');
      setRecipientsText('');
      setFrequency('weekly');
      onSuccess?.();
      onClose();
    },
    [userId, name, frequency, recipientsText, reportId, predefinedReportType, reportName, onSuccess, onClose]
  );

  const handleClose = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Planifier l'envoi du rapport"
      size="md"
      footer={
        <>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="schedule-report-form"
            disabled={submitting || !recipientsText.trim()}
            className="inline-flex items-center gap-2"
          >
            {submitting ? 'Enregistrement…' : 'Planifier'}
            <CalendarClock className="h-4 w-4" />
          </Button>
        </>
      }
    >
      <form id="schedule-report-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[var(--text-secondary,#A0A0B0)]">
          Le rapport « {reportName} » sera envoyé par email aux destinataires selon la fréquence choisie.
        </p>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Nom de la planification</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={reportName}
            className="bg-[#1C1C26] border-gray-700 w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Fréquence</label>
          <Select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as ScheduleFrequency)}
            options={FREQUENCY_OPTIONS}
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Destinataires (emails, un par ligne ou séparés par des virgules)</label>
          <textarea
            value={recipientsText}
            onChange={(e) => setRecipientsText(e.target.value)}
            placeholder="email1@example.com&#10;email2@example.com"
            rows={4}
            className="w-full rounded-lg border border-gray-700 bg-[#1C1C26] px-4 py-2 text-white placeholder:text-gray-500 focus:border-[var(--color-primary,#3B82F6)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary,#3B82F6)]"
            required
          />
        </div>
      </form>
    </Modal>
  );
}
