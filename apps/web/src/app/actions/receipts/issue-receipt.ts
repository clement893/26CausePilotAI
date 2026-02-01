'use server';

/**
 * issueReceiptAction - Étape 2.2.3
 * Génère le reçu fiscal PDF, l’upload sur S3, et envoie l’email au donateur.
 * À appeler après un don réussi (ex. depuis le webhook ou après confirmation).
 */

import { prisma } from '@/lib/db';
import { generateReceipt } from '@/lib/receipts/generator';
import type { ReceiptData, ReceiptCountry } from '@/lib/receipts/types';
import { emailAPI } from '@/lib/email/client';

function countryFromOrg(orgCountry: string): ReceiptCountry {
  const u = orgCountry?.toUpperCase() ?? 'CA';
  if (u === 'US' || u === 'USA') return 'US';
  if (u === 'FR' || u === 'FRA') return 'FR';
  return 'CA';
}

export interface IssueReceiptResult {
  success?: true;
  receiptNumber?: string;
  receiptUrl?: string | null;
  error?: string;
}

export async function issueReceiptAction(donationId: string): Promise<IssueReceiptResult> {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: {
        donator: true,
        organization: true,
      },
    });

    if (!donation) {
      return { error: 'Donation not found' };
    }
    if (!donation.donator) {
      return { error: 'Donator not found for this donation' };
    }
    if (!donation.organization) {
      return { error: 'Organization not found for this donation' };
    }

    const org = donation.organization;
    const donator = donation.donator;
    const country = countryFromOrg(org.country);

    const receiptData: ReceiptData = {
      receiptNumber: '', // filled by template
      donationId: donation.id,
      amount: Number(donation.amount),
      currency: donation.currency,
      donatedAt: donation.donatedAt,
      donator: {
        email: donator.email,
        firstName: donator.firstName,
        lastName: donator.lastName,
        address: donator.address,
        city: donator.city,
        province: donator.province,
        postalCode: donator.postalCode,
        country: donator.country,
      },
      organization: {
        name: org.name,
        address: org.address,
        city: org.city,
        province: org.province,
        postalCode: org.postalCode,
        country: org.country,
      },
      country,
    };

    const { url, receiptNumber } = await generateReceipt(receiptData);

    const donorName =
      [donator.firstName, donator.lastName].filter(Boolean).join(' ').trim() || donator.email;
    const amountStr = `${donation.currency} ${Number(donation.amount).toFixed(2)}`;

    let htmlContent: string;
    if (url) {
      htmlContent = `
        <p>Dear ${donorName},</p>
        <p>Thank you for your donation of ${amountStr}.</p>
        <p>Please find your official tax receipt attached below. You can download it for your records.</p>
        <p><a href="${url}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:6px;">Download your receipt (PDF)</a></p>
        <p>If the button does not work, copy this link: ${url}</p>
        <p>Receipt number: ${receiptNumber}</p>
        <p>Thank you for your generosity.</p>
      `;
    } else {
      htmlContent = `
        <p>Dear ${donorName},</p>
        <p>Thank you for your donation of ${amountStr}.</p>
        <p>Your official tax receipt has been generated. Receipt number: ${receiptNumber}</p>
        <p>If you need a copy of your receipt, please contact us.</p>
        <p>Thank you for your generosity.</p>
      `;
    }

    await emailAPI.send({
      to_email: donator.email,
      subject: `Your tax receipt – Receipt ${receiptNumber}`,
      html_content: htmlContent,
    });

    return {
      success: true,
      receiptNumber,
      receiptUrl: url ?? undefined,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to issue receipt';
    return { error: message };
  }
}
