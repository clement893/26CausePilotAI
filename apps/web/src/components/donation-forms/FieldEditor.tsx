'use client';

/**
 * FieldEditor - Étape 2.1.3
 * Interface pour gérer les champs personnalisés (ajout, suppression, config).
 */

import { useState } from 'react';
import { Button, Input, Select, Modal } from '@/components/ui';
import { Plus, GripVertical, Trash2, Pencil } from 'lucide-react';
import type { CustomFieldConfig, CustomFieldType } from '@/lib/types/donation-form';

const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'text', label: 'Texte' },
  { value: 'textarea', label: 'Zone de texte' },
  { value: 'number', label: 'Nombre' },
  { value: 'select', label: 'Liste déroulante' },
];

export interface FieldEditorProps {
  fields: CustomFieldConfig[];
  onChange: (fields: CustomFieldConfig[]) => void;
}

export default function FieldEditor({ fields, onChange }: FieldEditorProps) {
  const [editing, setEditing] = useState<CustomFieldConfig | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => {
    setEditing({
      id: `custom_${Date.now()}`,
      type: 'text',
      label: '',
      placeholder: '',
      required: false,
    });
    setIsNew(true);
  };

  const openEdit = (f: CustomFieldConfig) => {
    setEditing({ ...f });
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.label.trim()) return;
    if (isNew) {
      onChange([...fields, editing]);
    } else {
      onChange(fields.map((f) => (f.id === editing.id ? editing : f)));
    }
    setEditing(null);
    setIsNew(false);
  };

  const remove = (id: string) => {
    onChange(fields.filter((f) => f.id !== id));
  };

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-white/90">Champs personnalisés</p>
      <div className="space-y-2">
        {fields.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2"
          >
            <GripVertical className="h-4 w-4 shrink-0 text-white/50" aria-hidden />
            <span className="flex-1 text-sm text-white/90">{f.label || f.id}</span>
            <span className="text-xs text-white/50">{f.type}</span>
            <button
              type="button"
              onClick={() => openEdit(f)}
              className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Modifier"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => remove(f.id)}
              className="rounded p-1 text-red-400 hover:bg-red-500/20"
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" className="mt-3 gap-2" onClick={openNew}>
        <Plus className="h-4 w-4" />
        Ajouter un champ
      </Button>

      {editing && (
        <Modal
          isOpen={!!editing}
          onClose={() => setEditing(null)}
          title={isNew ? 'Nouveau champ' : 'Modifier le champ'}
          footer={
            <>
              <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
              <Button onClick={save}>Enregistrer</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Label"
              value={editing.label}
              onChange={(e) => setEditing({ ...editing, label: e.target.value })}
              placeholder="Ex: Nom de l'entreprise"
              required
            />
            <Select
              label="Type"
              value={editing.type}
              onChange={(e) => setEditing({ ...editing, type: e.target.value as CustomFieldType })}
              options={FIELD_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            />
            <Input
              label="Placeholder"
              value={editing.placeholder ?? ''}
              onChange={(e) => setEditing({ ...editing, placeholder: e.target.value || undefined })}
              placeholder="Optionnel"
            />
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={editing.required}
                onChange={(e) => setEditing({ ...editing, required: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-white/90">Requis</span>
            </label>
            {editing.type === 'select' && (
              <Input
                label="Options (séparées par des virgules)"
                value={(editing.options ?? []).join(', ')}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Option 1, Option 2, Option 3"
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
