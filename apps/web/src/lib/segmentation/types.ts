/**
 * Types pour le moteur de segmentation - Étape 3.2.1
 * Structure des règles stockées dans Audience.rules (JSON)
 */

export type SegmentField =
  | 'totalDonations'
  | 'donationCount'
  | 'lastDonationDate'
  | 'firstDonationDate'
  | 'segment'
  | 'score'
  | 'country'
  | 'preferredLanguage'
  | 'unsubscribedAt';

export type SegmentOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'contains'
  | 'before'
  | 'after'
  | 'within_days'; // pour dates: dans les X derniers jours

export interface SegmentCondition {
  id: string;
  field: SegmentField;
  operator: SegmentOperator;
  value: string | number | boolean;
}

export interface SegmentRuleGroup {
  logic: 'AND' | 'OR';
  conditions: SegmentCondition[];
}

export interface SegmentRules {
  group: SegmentRuleGroup;
}

export const SEGMENT_FIELDS: { value: SegmentField; label: string; valueType: 'number' | 'string' | 'date' | 'boolean' }[] = [
  { value: 'totalDonations', label: 'Total des dons', valueType: 'number' },
  { value: 'donationCount', label: 'Nombre de dons', valueType: 'number' },
  { value: 'lastDonationDate', label: 'Date du dernier don', valueType: 'date' },
  { value: 'firstDonationDate', label: 'Date du premier don', valueType: 'date' },
  { value: 'segment', label: 'Segment (VIP, Active, etc.)', valueType: 'string' },
  { value: 'score', label: 'Score (0-100)', valueType: 'number' },
  { value: 'country', label: 'Pays', valueType: 'string' },
  { value: 'preferredLanguage', label: 'Langue préférée', valueType: 'string' },
  { value: 'unsubscribedAt', label: 'Désinscrit email', valueType: 'boolean' },
];

export const OPERATORS_BY_TYPE: Record<string, { value: SegmentOperator; label: string }[]> = {
  number: [
    { value: 'eq', label: 'égal à' },
    { value: 'ne', label: 'différent de' },
    { value: 'gt', label: 'supérieur à' },
    { value: 'gte', label: 'supérieur ou égal à' },
    { value: 'lt', label: 'inférieur à' },
    { value: 'lte', label: 'inférieur ou égal à' },
  ],
  string: [
    { value: 'eq', label: 'égal à' },
    { value: 'ne', label: 'différent de' },
    { value: 'contains', label: 'contient' },
  ],
  date: [
    { value: 'before', label: 'avant le' },
    { value: 'after', label: 'après le' },
    { value: 'within_days', label: 'dans les X derniers jours' },
  ],
  boolean: [
    { value: 'eq', label: 'égal à' },
    { value: 'ne', label: 'différent de' },
  ],
};

export function createEmptyCondition(id?: string): SegmentCondition {
  return {
    id: id ?? `cond-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    field: 'totalDonations',
    operator: 'gte',
    value: 0,
  };
}

export function createEmptyRuleGroup(): SegmentRuleGroup {
  return { logic: 'AND', conditions: [createEmptyCondition()] };
}
