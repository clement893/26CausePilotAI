'use client';

/**
 * DonatorHeader - Étape 1.2.2
 * Header profil : avatar 120px, nom, email (mailto), téléphone (tel), badges (Segment, Statut, Consentements), actions (Modifier, Envoyer email, menu).
 */

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MoreVertical, Pencil, MailPlus, StickyNote, Star, UserX, Trash2, Download } from 'lucide-react';
import { DonatorAvatar } from './DonatorAvatar';
import { SegmentBadge } from './SegmentBadge';
import type { Donor } from '@modele/types';
import type { DonatorSegment } from './SegmentBadge';
import { clsx } from 'clsx';

function getDisplayName(d: Donor): string {
  if (d.first_name || d.last_name) return `${d.first_name ?? ''} ${d.last_name ?? ''}`.trim();
  return d.email;
}

function getSegment(d: Donor): DonatorSegment {
  const tags = d.tags ?? [];
  if (tags.some((t) => String(t).toLowerCase() === 'vip')) return 'VIP';
  const total = parseFloat(d.total_donated ?? '0');
  if (total >= 5000) return 'VIP';
  const created = d.created_at ? new Date(d.created_at).getTime() : 0;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  if (created >= thirtyDaysAgo) return 'New';
  if (!d.is_active) return 'Inactive';
  return 'Active';
}

export interface DonatorHeaderProps {
  donor: Donor;
  basePath?: string;
  onSendEmail?: () => void;
  onAddNote?: () => void;
  onMarkVip?: () => void;
  onDeactivate?: () => void;
  onDelete?: () => void;
  onExport?: () => void;
}

export function DonatorHeader({
  donor,
  basePath = '/dashboard/donateurs',
  onSendEmail,
  onAddNote,
  onMarkVip,
  onDeactivate,
  onDelete,
  onExport,
}: DonatorHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const name = getDisplayName(donor);
  const segment = getSegment(donor);

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <DonatorAvatar donor={donor} size="xl" className="h-[120px] w-[120px] flex-shrink-0" />
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{name}</h1>
          <a
            href={`mailto:${donor.email}`}
            className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)] hover:text-[var(--color-info,#3B82F6)]"
          >
            <Mail className="h-4 w-4" />
            {donor.email}
          </a>
          {donor.phone && (
            <a
              href={`tel:${donor.phone}`}
              className="mt-1 flex items-center gap-2 text-sm text-[var(--text-secondary,#A0A0B0)] hover:text-[var(--color-info,#3B82F6)]"
            >
              <Phone className="h-4 w-4" />
              {donor.phone}
            </a>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <SegmentBadge segment={segment} />
            <span
              className={clsx(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                donor.is_active ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
              )}
            >
              {donor.is_active ? 'Actif' : 'Inactif'}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary,#6B6B7B)]" title={donor.opt_in_email ? 'Consentement email' : donor.opt_in_sms ? 'Consentement SMS' : ''}>
              {donor.opt_in_email && <Mail className="h-3.5 w-3.5 text-green-500" aria-label="Email" />}
              {donor.opt_in_sms && <Phone className="h-3.5 w-3.5 text-green-500" aria-label="SMS" />}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:flex-shrink-0">
        <Link
          href={`${basePath}/${donor.id}/edit`}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[var(--background-tertiary,#1C1C26)] px-4 py-2 text-sm font-medium text-[var(--text-primary,#FFF)] hover:bg-white/10"
        >
          <Pencil className="h-4 w-4" />
          Modifier
        </Link>
        <button
          type="button"
          onClick={onSendEmail}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 text-sm font-medium text-white hover:from-blue-600 hover:to-purple-600"
        >
          <MailPlus className="h-4 w-4" />
          Envoyer un email
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-lg border border-white/10 p-2 text-[var(--text-secondary,#A0A0B0)] hover:bg-white/10 hover:text-white"
            aria-label="Menu"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden />
              <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-lg border border-white/10 bg-[var(--background-secondary,#13131A)] py-1 shadow-xl">
                <button
                  type="button"
                  onClick={() => { onAddNote?.(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                >
                  <StickyNote className="h-4 w-4" /> Ajouter une note
                </button>
                <button
                  type="button"
                  onClick={() => { onMarkVip?.(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                >
                  <Star className="h-4 w-4" /> Marquer comme VIP
                </button>
                <button
                  type="button"
                  onClick={() => { onDeactivate?.(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                >
                  <UserX className="h-4 w-4" /> Désactiver
                </button>
                <button
                  type="button"
                  onClick={() => { onDelete?.(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" /> Supprimer
                </button>
                <button
                  type="button"
                  onClick={() => { onExport?.(); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[var(--text-primary,#FFF)] hover:bg-white/10"
                >
                  <Download className="h-4 w-4" /> Exporter le profil
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
