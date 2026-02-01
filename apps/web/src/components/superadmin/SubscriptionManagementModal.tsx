'use client';

/**
 * Subscription Management Modal
 * Étape 7.1.2 - Gestion des organisations (Super Admin)
 */

import { useState } from 'react';
import { Button, Input, Card, useToast } from '@/components/ui';
import { updateSubscriptionAction } from '@/app/actions/superadmin/organizations';
import type { UpdateSubscriptionParams } from '@/app/actions/superadmin/organizations';

interface SubscriptionManagementModalProps {
  organizationId: string;
  organizationName: string;
  currentSubscription?: {
    plan: string;
    status: string;
    maxUsers: number;
    maxDonors: number;
    maxForms: number;
    maxCampaigns: number;
    startDate: Date;
    endDate: Date | null;
    trialEndDate: Date | null;
  } | null;
  onClose: () => void;
  onSuccess?: () => void;
}

const PLANS = [
  { value: 'FREE', label: 'Gratuit', color: 'bg-gray-500' },
  { value: 'STARTER', label: 'Starter', color: 'bg-blue-500' },
  { value: 'PROFESSIONAL', label: 'Professionnel', color: 'bg-purple-500' },
  { value: 'ENTERPRISE', label: 'Enterprise', color: 'bg-orange-500' },
] as const;

const STATUSES = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'TRIAL', label: 'Essai' },
  { value: 'CANCELED', label: 'Annulé' },
  { value: 'EXPIRED', label: 'Expiré' },
] as const;

export function SubscriptionManagementModal({
  organizationId,
  organizationName,
  currentSubscription,
  onClose,
  onSuccess,
}: SubscriptionManagementModalProps) {
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateSubscriptionParams>({
    organizationId,
    plan: (currentSubscription?.plan as any) || 'FREE',
    status: (currentSubscription?.status as any) || 'TRIAL',
    startDate: currentSubscription?.startDate ? new Date(currentSubscription.startDate) : new Date(),
    endDate: currentSubscription?.endDate ? new Date(currentSubscription.endDate) : null,
    trialEndDate: currentSubscription?.trialEndDate
      ? new Date(currentSubscription.trialEndDate)
      : null,
    maxUsers: currentSubscription?.maxUsers || 5,
    maxDonors: currentSubscription?.maxDonors || 1000,
    maxForms: currentSubscription?.maxForms || 3,
    maxCampaigns: currentSubscription?.maxCampaigns || 5,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateSubscriptionAction(formData);
      showSuccessToast('Abonnement mis à jour avec succès');
      onSuccess?.();
      onClose();
    } catch (error) {
      showErrorToast(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Gérer l'abonnement</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-400 mb-6">Organisation: {organizationName}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Plan Selection */}
            <div>
              <label className="block text-sm font-medium text-white mb-3">Plan</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PLANS.map((plan) => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, plan: plan.value as any })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.plan === plan.value
                        ? 'border-primary bg-primary/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${plan.color} mb-2`} />
                    <p className="text-sm font-medium text-white">{plan.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Statut</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as any })
                }
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              >
                {STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date de début
                </label>
                <Input
                  type="date"
                  value={formData.startDate?.toISOString().split('T')[0] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value ? new Date(e.target.value) : new Date(),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date de fin (optionnel)
                </label>
                <Input
                  type="date"
                  value={
                    formData.endDate
                      ? formData.endDate.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Fin d'essai (optionnel)
                </label>
                <Input
                  type="date"
                  value={
                    formData.trialEndDate
                      ? formData.trialEndDate.toISOString().split('T')[0]
                      : ''
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      trialEndDate: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max utilisateurs
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxUsers}
                  onChange={(e) =>
                    setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max donateurs
                </label>
                <Input
                  type="number"
                  min="100"
                  max="100000"
                  value={formData.maxDonors}
                  onChange={(e) =>
                    setFormData({ ...formData, maxDonors: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max formulaires
                </label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.maxForms}
                  onChange={(e) =>
                    setFormData({ ...formData, maxForms: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Max campagnes
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.maxCampaigns}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxCampaigns: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
