'use server';

/**
 * getFormsDashboardData - Étape 4.1.2
 * Données pour le dashboard Formulaires (formulaires de don).
 */

import { prisma } from '@/lib/db';

export interface FormsDashboardData {
  totalForms: number;
  totalSubmissions: number;
  totalCollected: number;
  avgConversionRate: number;
  submissionsThisMonth: number;
  chartSubmissionsByMonth: { label: string; value: number }[];
  chartByForm: { label: string; value: number }[];
  error?: string;
}

export async function getFormsDashboardData(
  organizationId: string
): Promise<FormsDashboardData> {
  try {
    const [forms, totalSubmissions, submissionsThisMonthAgg, submissionsByMonth] = await Promise.all([
      prisma.donationForm.findMany({
        where: { organizationId },
        select: { id: true, title: true, submissionCount: true, conversionRate: true, totalCollected: true },
      }),
      prisma.donationFormSubmission.count({
        where: {
          form: { organizationId },
        },
      }),
      prisma.donationFormSubmission.count({
        where: {
          form: { organizationId },
          submittedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
      prisma.donationFormSubmission.findMany({
        where: { form: { organizationId } },
        select: { submittedAt: true, formId: true },
      }),
    ]);

    type FormRow = (typeof forms)[number];
    type SubmissionRow = (typeof submissionsByMonth)[number];
    const totalCollected = forms.reduce((sum: number, f: FormRow) => sum + Number(f.totalCollected ?? 0), 0);
    const avgConversionRate =
      forms.length > 0
        ? forms.reduce((sum: number, f: FormRow) => sum + Number(f.conversionRate ?? 0), 0) / forms.length
        : 0;

    const now = new Date();
    const chartSubmissionsByMonth: { label: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const count = submissionsByMonth.filter(
        (s: SubmissionRow) => s.submittedAt >= d && s.submittedAt <= end
      ).length;
      chartSubmissionsByMonth.push({
        label: d.toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' }),
        value: count,
      });
    }

    const chartByForm = forms.slice(0, 6).map((f: FormRow) => ({
      label: f.title.length > 20 ? f.title.slice(0, 20) + '…' : f.title,
      value: f.submissionCount ?? 0,
    }));

    return {
      totalForms: forms.length,
      totalSubmissions,
      totalCollected,
      avgConversionRate: Math.round(avgConversionRate * 100) / 100,
      submissionsThisMonth: submissionsThisMonthAgg,
      chartSubmissionsByMonth,
      chartByForm,
    };
  } catch (e) {
    console.error('[getFormsDashboardData]', e);
    return {
      totalForms: 0,
      totalSubmissions: 0,
      totalCollected: 0,
      avgConversionRate: 0,
      submissionsThisMonth: 0,
      chartSubmissionsByMonth: [],
      chartByForm: [],
      error: e instanceof Error ? e.message : 'Erreur chargement dashboard formulaires',
    };
  }
}
