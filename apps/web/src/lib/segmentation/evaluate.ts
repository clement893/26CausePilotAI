/**
 * Évaluation des règles de segmentation -> clause Prisma where - Étape 3.2.1
 */

import type { Prisma } from '@prisma/client';
import type { SegmentCondition, SegmentRuleGroup } from './types';

function conditionToWhere(condition: SegmentCondition): Prisma.DonatorWhereInput | null {
  const { field, operator, value } = condition;
  const v = value;

  switch (field) {
    case 'totalDonations': {
      const num = typeof v === 'number' ? v : Number(v);
      if (Number.isNaN(num)) return null;
      switch (operator) {
        case 'eq': return { totalDonations: { equals: num } };
        case 'ne': return { totalDonations: { not: num } };
        case 'gt': return { totalDonations: { gt: num } };
        case 'gte': return { totalDonations: { gte: num } };
        case 'lt': return { totalDonations: { lt: num } };
        case 'lte': return { totalDonations: { lte: num } };
        default: return null;
      }
    }
    case 'donationCount': {
      const num = typeof v === 'number' ? v : Number(v);
      if (Number.isNaN(num)) return null;
      switch (operator) {
        case 'eq': return { donationCount: { equals: num } };
        case 'ne': return { donationCount: { not: num } };
        case 'gt': return { donationCount: { gt: num } };
        case 'gte': return { donationCount: { gte: num } };
        case 'lt': return { donationCount: { lt: num } };
        case 'lte': return { donationCount: { lte: num } };
        default: return null;
      }
    }
    case 'lastDonationDate': {
      if (operator === 'within_days') {
        const days = typeof v === 'number' ? v : Number(v);
        if (Number.isNaN(days) || days < 0) return null;
        const since = new Date();
        since.setDate(since.getDate() - days);
        return { lastDonationDate: { gte: since } };
      }
      const date = typeof v === 'string' ? new Date(v) : null;
      if (!date || Number.isNaN(date.getTime())) return null;
      switch (operator) {
        case 'before': return { lastDonationDate: { lt: date } };
        case 'after': return { lastDonationDate: { gt: date } };
        default: return null;
      }
    }
    case 'firstDonationDate': {
      const date = typeof v === 'string' ? new Date(v) : null;
      if (!date || Number.isNaN(date.getTime())) return null;
      switch (operator) {
        case 'before': return { firstDonationDate: { lt: date } };
        case 'after': return { firstDonationDate: { gt: date } };
        default: return null;
      }
    }
    case 'segment':
      switch (operator) {
        case 'eq': return { segment: { equals: String(v) } };
        case 'ne': return { segment: { not: String(v) } };
        case 'contains': return { segment: { contains: String(v), mode: 'insensitive' } };
        default: return null;
      }
    case 'score': {
      const num = typeof v === 'number' ? v : Number(v);
      if (Number.isNaN(num)) return null;
      switch (operator) {
        case 'eq': return { score: { equals: num } };
        case 'ne': return { score: { not: num } };
        case 'gt': return { score: { gt: num } };
        case 'gte': return { score: { gte: num } };
        case 'lt': return { score: { lt: num } };
        case 'lte': return { score: { lte: num } };
        default: return null;
      }
    }
    case 'country':
      switch (operator) {
        case 'eq': return { country: { equals: String(v) } };
        case 'ne': return { country: { not: String(v) } };
        case 'contains': return { country: { contains: String(v), mode: 'insensitive' } };
        default: return null;
      }
    case 'preferredLanguage':
      switch (operator) {
        case 'eq': return { preferredLanguage: { equals: String(v) } };
        case 'ne': return { preferredLanguage: { not: String(v) } };
        default: return null;
      }
    case 'unsubscribedAt':
      const isUnsub = v === true || v === 'true';
      if (operator === 'eq') {
        return isUnsub ? { unsubscribedAt: { not: null } } : { unsubscribedAt: null };
      }
      if (operator === 'ne') {
        return isUnsub ? { unsubscribedAt: null } : { unsubscribedAt: { not: null } };
      }
      return null;
    default:
      return null;
  }
}

export function ruleGroupToWhere(
  group: SegmentRuleGroup,
  organizationId: string
): Prisma.DonatorWhereInput {
  const clauses: Prisma.DonatorWhereInput[] = [];
  for (const cond of group.conditions) {
    const w = conditionToWhere(cond);
    if (w) clauses.push(w);
  }
  if (clauses.length === 0) {
    return { organizationId };
  }
  const combined = group.logic === 'AND' ? { AND: clauses } : { OR: clauses };
  return { organizationId, ...combined };
}
