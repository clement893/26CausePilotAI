'use client';

/**
 * ActivityTimeline - Étape 1.2.2
 * Timeline des activités (profil créé, mis à jour, don, email, note, etc.).
 */

import {
  User,
  Pencil,
  DollarSign,
  Mail,
  MessageSquare,
  Phone,
  StickyNote,
  Layers,
  UserCheck,
  UserX,
  FileText,
  Activity,
} from 'lucide-react';
import type { DonorActivity } from '@modele/types';

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays < 1) return "aujourd'hui";
  if (diffDays === 1) return 'hier';
  if (diffDays < 7) return `il y a ${diffDays} jours`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`;
  return d.toLocaleDateString('fr-CA', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const typeIcons: Record<string, React.ReactNode> = {
  profile_created: <User className="h-4 w-4" />,
  profile_updated: <Pencil className="h-4 w-4" />,
  donation_made: <DollarSign className="h-4 w-4" />,
  email_sent: <Mail className="h-4 w-4" />,
  email_opened: <Mail className="h-4 w-4" />,
  sms_sent: <MessageSquare className="h-4 w-4" />,
  phone_call: <Phone className="h-4 w-4" />,
  note_added: <StickyNote className="h-4 w-4" />,
  segment_changed: <Layers className="h-4 w-4" />,
  status_activated: <UserCheck className="h-4 w-4" />,
  status_deactivated: <UserX className="h-4 w-4" />,
  consent_updated: <FileText className="h-4 w-4" />,
};

function getActivityLabel(type: string): string {
  const labels: Record<string, string> = {
    profile_created: 'Profil créé',
    profile_updated: 'Profil mis à jour',
    donation_made: 'Don effectué',
    email_sent: 'Email envoyé',
    email_opened: 'Email ouvert',
    sms_sent: 'SMS envoyé',
    phone_call: 'Appel effectué',
    note_added: 'Note ajoutée',
    segment_changed: 'Segment changé',
    status_activated: 'Statut activé',
    status_deactivated: 'Statut désactivé',
    consent_updated: 'Consentement modifié',
  };
  return labels[type] ?? type.replace(/_/g, ' ');
}

export interface ActivityTimelineProps {
  activities: DonorActivity[];
  emptyMessage?: string;
}

export function ActivityTimeline({
  activities,
  emptyMessage = 'Aucune activité enregistrée',
}: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[var(--background-secondary,#13131A)] p-12 text-center">
        <Activity className="mx-auto h-12 w-12 text-[var(--text-tertiary,#6B6B7B)]" />
        <p className="mt-4 text-[var(--text-secondary,#A0A0B0)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, i) => (
        <div key={activity.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--background-tertiary,#1C1C26)] text-[var(--text-tertiary,#6B6B7B)]">
              {typeIcons[activity.activity_type] ?? <Activity className="h-4 w-4" />}
            </div>
            {i < activities.length - 1 && (
              <div className="mt-1 h-full w-px flex-1 bg-white/10" />
            )}
          </div>
          <div className="pb-6 flex-1 min-w-0">
            <p className="font-medium text-[var(--text-primary,#FFF)]">
              {getActivityLabel(activity.activity_type)}
            </p>
            {activity.activity_data && Object.keys(activity.activity_data).length > 0 && (
              <pre className="mt-1 text-xs text-[var(--text-tertiary,#6B6B7B)] overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(activity.activity_data, null, 2)}
              </pre>
            )}
            <p className="mt-1 text-xs text-[var(--text-tertiary,#6B6B7B)]">
              {formatRelative(activity.created_at)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
