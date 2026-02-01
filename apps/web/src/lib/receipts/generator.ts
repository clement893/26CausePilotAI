/**
 * Générateur de reçus fiscaux PDF - Étape 2.2.3
 * Génère un PDF avec jspdf et l’upload sur S3 si configuré.
 */

import { jsPDF } from 'jspdf';
import type { ReceiptData } from './types';
import {
  CANADA_LEGAL,
  getCanadaReceiptNumber,
  formatCanadaAddress,
  formatCanadaDonorAddress,
} from './templates/canada';
import {
  USA_LEGAL,
  getUSAReceiptNumber,
  formatUSAAddress,
  formatUSADonorAddress,
} from './templates/usa';
import {
  FRANCE_LEGAL,
  getFranceReceiptNumber,
  formatFranceAddress,
  formatFranceDonorAddress,
} from './templates/france';

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Génère le PDF du reçu et retourne le buffer.
 */
export function generateReceiptPdf(data: ReceiptData): Uint8Array {
  const doc = new jsPDF({ format: 'a4', unit: 'mm' });
  const margin = 20;
  let y = margin;
  const lineHeight = 6;
  const sectionGap = 8;

  const country = data.country;
  let receiptNumber: string;
  let orgAddress: string;
  let donatorAddress: string;
  let legalTitle: string;
  let legalSubtitle: string;
  let legalDisclaimer: string;

  if (country === 'CA') {
    receiptNumber = getCanadaReceiptNumber(data);
    orgAddress = formatCanadaAddress(data.organization);
    donatorAddress = formatCanadaDonorAddress(data.donator);
    legalTitle = CANADA_LEGAL.title;
    legalSubtitle = CANADA_LEGAL.subtitle;
    legalDisclaimer = `${CANADA_LEGAL.disclaimer} ${CANADA_LEGAL.disclaimerFr}`;
  } else if (country === 'US') {
    receiptNumber = getUSAReceiptNumber(data);
    orgAddress = formatUSAAddress(data.organization);
    donatorAddress = formatUSADonorAddress(data.donator);
    legalTitle = USA_LEGAL.title;
    legalSubtitle = USA_LEGAL.subtitle;
    legalDisclaimer = USA_LEGAL.disclaimer;
  } else {
    receiptNumber = getFranceReceiptNumber(data);
    orgAddress = formatFranceAddress(data.organization);
    donatorAddress = formatFranceDonorAddress(data.donator);
    legalTitle = FRANCE_LEGAL.title;
    legalSubtitle = FRANCE_LEGAL.subtitle;
    legalDisclaimer = FRANCE_LEGAL.disclaimer;
  }

  doc.setFontSize(16);
  doc.text(legalTitle, margin, y);
  y += lineHeight;
  doc.setFontSize(10);
  doc.text(legalSubtitle, margin, y);
  y += sectionGap;

  doc.setFontSize(10);
  doc.text(`Receipt # / Reçu n°: ${receiptNumber}`, margin, y);
  y += lineHeight;
  doc.text(`Date: ${formatDate(data.donatedAt)}`, margin, y);
  y += sectionGap;

  doc.setFontSize(11);
  doc.text('Organization / Organisation', margin, y);
  y += lineHeight;
  doc.setFontSize(10);
  doc.text(orgAddress, margin, y);
  y += sectionGap + 4;

  doc.setFontSize(11);
  doc.text('Donor / Donateur', margin, y);
  y += lineHeight;
  doc.setFontSize(10);
  const donorLines = doc.splitTextToSize(donatorAddress, 170);
  doc.text(donorLines, margin, y);
  y += donorLines.length * lineHeight + sectionGap;

  doc.setFontSize(12);
  doc.text(`Amount / Montant: ${formatAmount(data.amount, data.currency)}`, margin, y);
  y += sectionGap;

  doc.setFontSize(9);
  const disclaimerLines = doc.splitTextToSize(legalDisclaimer, 170);
  doc.text(disclaimerLines, margin, y);

  const arrayBuffer = doc.output('arraybuffer') as ArrayBuffer;
  return new Uint8Array(arrayBuffer);
}

/**
 * Upload le PDF sur S3 et retourne l’URL publique ou signée.
 * Retourne null si S3 n’est pas configuré.
 */
export async function uploadReceiptToS3(
  buffer: Uint8Array,
  key: string
): Promise<string | null> {
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION ?? 'us-east-1';

  if (!accessKey || !secretKey || !bucket) {
    return null;
  }

  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const client = new S3Client({
    region,
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    ...(process.env.AWS_S3_ENDPOINT_URL && {
      endpoint: process.env.AWS_S3_ENDPOINT_URL,
      forcePathStyle: true,
    }),
  });

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: 'application/pdf',
    })
  );

  const baseUrl = process.env.AWS_S3_PUBLIC_BASE_URL;
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, '')}/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Génère le reçu PDF et l’upload sur S3.
 * Retourne { buffer, url } où url est null si S3 non configuré.
 */
export async function generateReceipt(data: ReceiptData): Promise<{
  buffer: Uint8Array;
  url: string | null;
  receiptNumber: string;
}> {
  const buffer = generateReceiptPdf(data);
  const country = data.country;
  const receiptNumber =
    country === 'CA'
      ? getCanadaReceiptNumber(data)
      : country === 'US'
        ? getUSAReceiptNumber(data)
        : getFranceReceiptNumber(data);
  const key = `receipts/${data.organization.name.replace(/[^a-z0-9-_]/gi, '_')}/${data.donationId}.pdf`;
  const url = await uploadReceiptToS3(buffer, key);
  return { buffer, url, receiptNumber };
}
