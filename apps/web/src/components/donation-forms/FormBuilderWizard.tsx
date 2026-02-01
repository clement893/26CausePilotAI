'use client';

/**
 * FormBuilderWizard - Étape 2.1.3
 * Wizard en 6 étapes, 2 colonnes (contenu + preview), navigation et sauvegarde.
 */

import { useState, useCallback } from 'react';
import { Button, Card } from '@/components/ui';
import { ChevronLeft, ChevronRight, Save, Send } from 'lucide-react';
import StepIndicator from './StepIndicator';
import PreviewPanel from './PreviewPanel';
import StepInformations from './steps/StepInformations';
import StepAmounts from './steps/StepAmounts';
import StepFields from './steps/StepFields';
import StepDesign from './steps/StepDesign';
import StepMessages from './steps/StepMessages';
import StepParams from './steps/StepParams';
import type { DonationFormDraft } from '@/lib/types/donation-form';
import { createFormAction } from '@/app/actions/donation-forms/create';
import { updateFormAction } from '@/app/actions/donation-forms/update';
import { uploadImageAction } from '@/app/actions/donation-forms/upload-image';

const STEPS = 6;

export interface FormBuilderWizardProps {
  initialData: DonationFormDraft;
  formId?: string | null;
  onSuccess?: (id: string) => void;
}

export default function FormBuilderWizard({
  initialData,
  formId,
  onSuccess,
}: FormBuilderWizardProps) {
  const [data, setData] = useState<DonationFormDraft>(initialData);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = useCallback((patch: Partial<DonationFormDraft>) => {
    setData((prev) => ({ ...prev, ...patch }));
    setError(null);
  }, []);

  const handleUpload = useCallback(async (formData: FormData) => {
    return uploadImageAction(formData);
  }, []);

  const saveDraft = async () => {
    setSaving(true);
    setError(null);
    try {
      if (formId) {
        const res = await updateFormAction(formId, { ...data });
        if (res.error) {
          setError(res.error);
          return;
        }
      } else {
        const payload = { ...data, status: (data.status === 'published' ? 'published' : 'draft') as 'draft' | 'published' };
        const res = await createFormAction(payload);
        if (res.error) {
          setError(res.error);
          return;
        }
        if (res.formId) onSuccess?.(res.formId);
      }
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    setError(null);
    try {
      const updateRes = formId
        ? await updateFormAction(formId, { ...data, status: 'published' })
        : await createFormAction({ ...data, status: 'published' } as Parameters<typeof createFormAction>[0]);
      if ('error' in updateRes && updateRes.error) {
        setError(updateRes.error);
        return;
      }
      const newId = !formId && 'formId' in updateRes ? updateRes.formId : undefined;
      if (typeof newId === 'string') onSuccess?.(newId);
    } finally {
      setPublishing(false);
    }
  };

  const canNext = step < STEPS;
  const canPrev = step > 1;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Colonne gauche 2/3 */}
      <div className="lg:col-span-2">
        <div className="mb-6 flex gap-4">
          <div className="w-48 shrink-0">
            <StepIndicator currentStep={step} onStepClick={setStep} />
          </div>
          <div className="min-w-0 flex-1">
            <Card className="p-6" title={step === 1 ? 'Informations' : step === 2 ? 'Montants' : step === 3 ? 'Champs' : step === 4 ? 'Design' : step === 5 ? 'Messages' : 'Paramètres'}>
              {step === 1 && (
                <StepInformations data={data} onChange={onChange} onUpload={handleUpload} />
              )}
              {step === 2 && <StepAmounts data={data} onChange={onChange} />}
              {step === 3 && <StepFields data={data} onChange={onChange} />}
              {step === 4 && (
                <StepDesign data={data} onChange={onChange} onUpload={handleUpload} />
              )}
              {step === 5 && <StepMessages data={data} onChange={onChange} />}
              {step === 6 && <StepParams data={data} onChange={onChange} />}
            </Card>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            disabled={!canPrev}
            onClick={() => setStep((s) => s - 1)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          {canNext ? (
            <Button onClick={() => setStep((s) => s + 1)} className="gap-2">
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            variant="outline"
            disabled={saving}
            onClick={saveDraft}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Enregistrement…' : 'Enregistrer le brouillon'}
          </Button>
          <Button
            disabled={publishing}
            onClick={publish}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {publishing ? 'Publication…' : 'Publier'}
          </Button>
        </div>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>

      {/* Colonne droite 1/3 - Preview */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <PreviewPanel data={data} />
        </div>
      </div>
    </div>
  );
}
