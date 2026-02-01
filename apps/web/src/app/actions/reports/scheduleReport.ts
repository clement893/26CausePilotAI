'use server';

/**
 * scheduleReport - Étape 4.2.3
 * Crée une planification d'envoi récurrent d'un rapport par email.
 * L'exécution réelle (cron/worker) est à implémenter séparément.
 */

import { prisma } from '@/lib/db';

export type ScheduleFrequency = 'daily' | 'weekly' | 'monthly';

export interface ScheduleReportInput {
  userId: string;
  name: string;
  frequency: ScheduleFrequency;
  recipients: string[];
  reportId?: string;
  predefinedReportType?: string;
}

function computeNextRunAt(frequency: ScheduleFrequency): Date {
  const next = new Date();
  next.setHours(9, 0, 0, 0);
  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }
  return next;
}

export async function scheduleReportAction(
  input: ScheduleReportInput
): Promise<{ scheduleId?: string; error?: string }> {
  try {
    if (!input.reportId && !input.predefinedReportType) {
      return { error: 'Indiquez un rapport (personnalisé ou prédéfini).' };
    }
    if (input.reportId && input.predefinedReportType) {
      return { error: 'Indiquez soit un rapport personnalisé, soit un type prédéfini, pas les deux.' };
    }
    const emails = input.recipients
      .map((e) => e.trim().toLowerCase())
      .filter((e) => e.length > 0 && e.includes('@'));
    if (emails.length === 0) {
      return { error: 'Ajoutez au moins une adresse email valide.' };
    }

    const nextRunAt = computeNextRunAt(input.frequency);

    const reportScheduleModel = (prisma as unknown as {
      reportSchedule: {
        create: (args: {
          data: {
            name: string;
            userId: string;
            reportId: string | null;
            predefinedReportType: string | null;
            frequency: ScheduleFrequency;
            recipients: object;
            nextRunAt: Date;
          };
        }) => Promise<{ id: string }>;
      };
    }).reportSchedule;
    const schedule = await reportScheduleModel.create({
      data: {
        name: input.name,
        userId: input.userId,
        reportId: input.reportId ?? null,
        predefinedReportType: input.predefinedReportType ?? null,
        frequency: input.frequency,
        recipients: emails as unknown as object,
        nextRunAt,
      },
    });
    return { scheduleId: schedule.id };
  } catch (e) {
    console.error('[scheduleReportAction]', e);
    return {
      error: e instanceof Error ? e.message : 'Erreur lors de la création de la planification',
    };
  }
}
