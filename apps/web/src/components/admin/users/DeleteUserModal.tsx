'use client';

/**
 * DeleteUserModal - Étape 1.1.4
 * Confirmation suppression : message, input "DELETE", Annuler / Supprimer
 */

import { useState } from 'react';
import { AuthButton } from '@/components/auth';

const CONFIRM_TEXT = 'DELETE';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userName?: string;
  userEmail: string;
}

export function DeleteUserModal({
  isOpen,
  onClose,
  onConfirm,
  userName,
  userEmail,
}: DeleteUserModalProps) {
  const [confirmValue, setConfirmValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (confirmValue !== CONFIRM_TEXT) return;
    setLoading(true);
    try {
      await onConfirm();
      setConfirmValue('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayName = userName?.trim() || userEmail;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6 shadow-xl"
        role="dialog"
        aria-labelledby="delete-user-title"
        aria-modal="true"
      >
        <h2 id="delete-user-title" className="mb-2 text-lg font-semibold text-white">
          Confirmer la suppression
        </h2>
        <p className="mb-4 text-[var(--text-secondary,#A0A0B0)]">
          Êtes-vous sûr de vouloir supprimer l&apos;utilisateur <strong>{displayName}</strong> ?
          Cette action est irréversible.
        </p>
        <p className="mb-2 text-sm text-[var(--text-secondary,#A0A0B0)]">
          Tapez <strong>{CONFIRM_TEXT}</strong> pour confirmer :
        </p>
        <input
          type="text"
          value={confirmValue}
          onChange={(e) => setConfirmValue(e.target.value)}
          placeholder={CONFIRM_TEXT}
          className="mb-6 w-full rounded-lg border border-white/20 bg-[var(--background-tertiary,#1C1C26)] px-4 py-2 text-white placeholder-[var(--text-disabled,#4A4A5A)] focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
          aria-label="Confirmer en tapant DELETE"
        />
        <div className="flex justify-end gap-2">
          <AuthButton variant="outline" onClick={onClose}>
            Annuler
          </AuthButton>
          <AuthButton
            variant="primary"
            onClick={handleConfirm}
            disabled={confirmValue !== CONFIRM_TEXT}
            loading={loading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500/50"
          >
            Supprimer
          </AuthButton>
        </div>
      </div>
    </div>
  );
}
