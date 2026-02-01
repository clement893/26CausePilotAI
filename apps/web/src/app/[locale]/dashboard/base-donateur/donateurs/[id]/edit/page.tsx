'use client';

/**
 * Page édition profil donateur - Étape 1.2.2
 * Formulaire : Infos personnelles, Préférences, Intérêts/Segmentation, Champs personnalisés. Annuler / Enregistrer / Supprimer.
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useOrganization } from '@/hooks/useOrganization';
import { getDonor, updateDonor, deleteDonor } from '@/lib/api/donors';
import { getErrorMessage } from '@/lib/errors';
import type { Donor, DonorUpdate } from '@modele/types';
import { Container, Card, Button, Input, useToast } from '@/components/ui';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function DonorEditPage() {
  const params = useParams();
  const router = useRouter();
  const donorId = params?.id as string;
  const { activeOrganization } = useOrganization();
  const { success, error: showError } = useToast();

  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<DonorUpdate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    preferred_language: 'fr',
    opt_in_email: true,
    opt_in_sms: false,
    opt_in_postal: true,
    is_active: true,
    tags: [],
  });

  useEffect(() => {
    if (!activeOrganization || !donorId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getDonor(activeOrganization.id, donorId);
        setDonor(data);
        setForm({
          first_name: data.first_name ?? '',
          last_name: data.last_name ?? '',
          email: data.email,
          phone: data.phone ?? '',
          preferred_language: data.preferred_language ?? 'fr',
          opt_in_email: data.opt_in_email ?? true,
          opt_in_sms: data.opt_in_sms ?? false,
          opt_in_postal: data.opt_in_postal ?? true,
          is_active: data.is_active ?? true,
          tags: data.tags ?? [],
        });
      } catch (err) {
        setError(getErrorMessage(err, 'Donateur introuvable'));
      } finally {
        setLoading(false);
      }
    })();
  }, [activeOrganization?.id, donorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrganization || !donorId) return;
    setSaving(true);
    setError(null);
    try {
      await updateDonor(activeOrganization.id, donorId, form);
      success('Profil enregistré');
      router.push(`/dashboard/base-donateur/donateurs/${donorId}`);
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de l’enregistrement'));
      showError(getErrorMessage(err, 'Erreur lors de l’enregistrement'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeOrganization || !donorId) return;
    if (!confirm('Supprimer ce donateur ? Cette action est irréversible.')) return;
    setSaving(true);
    setError(null);
    try {
      await deleteDonor(activeOrganization.id, donorId);
      success('Donateur supprimé');
      router.push('/dashboard/base-donateur/donateurs');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Erreur lors de la suppression'));
      showError(getErrorMessage(err, 'Erreur lors de la suppression'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-8 lg:py-12">
        <div className="h-10 w-32 animate-pulse rounded bg-white/10 mb-6" />
        <div className="h-96 animate-pulse rounded-xl bg-white/10" />
      </Container>
    );
  }

  if (error || !donor) {
    return (
      <Container className="py-8 lg:py-12">
        <Card className="border-destructive p-6">
          <p className="text-destructive mb-4">{error ?? 'Donateur introuvable'}</p>
          <Link href="/dashboard/base-donateur/donateurs">
            <Button variant="outline">Retour à la liste</Button>
          </Link>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="py-8 lg:py-12">
      <Link href={`/dashboard/base-donateur/donateurs/${donorId}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au profil
        </Button>
      </Link>

      <h1 className="text-2xl font-bold text-white mb-6">Modifier le donateur</h1>

      {error && (
        <div className="mb-6 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Informations personnelles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={form.first_name ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                className="bg-[#1C1C26] border-gray-700"
              />
              <Input
                label="Nom"
                value={form.last_name ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                className="bg-[#1C1C26] border-gray-700"
              />
              <div className="md:col-span-2">
                <Input
                  label="Email"
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="bg-[#1C1C26] border-gray-700"
                />
              </div>
              <Input
                label="Téléphone"
                value={form.phone ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="bg-[#1C1C26] border-gray-700"
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Préférences de communication</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Langue préférée</label>
                <select
                  value={form.preferred_language ?? 'fr'}
                  onChange={(e) => setForm((f) => ({ ...f, preferred_language: e.target.value }))}
                  className="w-full rounded-lg border border-gray-700 bg-[#1C1C26] px-4 py-2 text-white"
                >
                  <option value="fr">Français</option>
                  <option value="en">Anglais</option>
                </select>
              </div>
              <div className="flex items-center gap-4 pt-8">
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.opt_in_email ?? true}
                    onChange={(e) => setForm((f) => ({ ...f, opt_in_email: e.target.checked }))}
                    className="rounded border-gray-600"
                  />
                  Email marketing
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.opt_in_sms ?? false}
                    onChange={(e) => setForm((f) => ({ ...f, opt_in_sms: e.target.checked }))}
                    className="rounded border-gray-600"
                  />
                  SMS
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={form.opt_in_postal ?? true}
                    onChange={(e) => setForm((f) => ({ ...f, opt_in_postal: e.target.checked }))}
                    className="rounded border-gray-600"
                  />
                  Courrier postal
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                  className="rounded border-gray-600"
                />
                <label htmlFor="is_active" className="text-sm text-gray-300">Donateur actif</label>
              </div>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/dashboard/base-donateur/donateurs/${donorId}`}>Annuler</Link>
          </Button>
          <Button type="submit" variant="primary" loading={saving} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
            Enregistrer
          </Button>
        </div>

        <Card className="border-red-500/20 bg-red-500/5">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-red-400 mb-2">Zone de danger</h3>
            <p className="text-sm text-gray-400 mb-4">La suppression est irréversible.</p>
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={saving}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer le donateur
            </Button>
          </div>
        </Card>
      </form>
    </Container>
  );
}
