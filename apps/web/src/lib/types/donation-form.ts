/**
 * Types pour le Form Builder de formulaires de don - Étape 2.1.3
 * Alignés sur le schéma Prisma DonationForm
 */

export type AmountType = 'flexible' | 'fixed';
export type Currency = 'CAD' | 'USD' | 'EUR';
export type FrequencyKey = 'monthly' | 'quarterly' | 'yearly';
export type FormStatus = 'draft' | 'published' | 'archived';
export type ButtonStyle = 'solid' | 'outline' | 'gradient';
export type FontOption = 'Inter' | 'Lato' | 'Roboto' | 'Open Sans' | 'Poppins';

export const REQUIRED_FIELD_OPTIONS = [
  { id: 'email', label: 'Email' },
  { id: 'firstName', label: 'Prénom' },
  { id: 'lastName', label: 'Nom' },
] as const;

export const OPTIONAL_FIELD_OPTIONS = [
  { id: 'phone', label: 'Téléphone' },
  { id: 'address', label: 'Adresse' },
  { id: 'city', label: 'Ville' },
  { id: 'province', label: 'Province' },
  { id: 'postalCode', label: 'Code postal' },
  { id: 'country', label: 'Pays' },
  { id: 'message', label: 'Message' },
  { id: 'dedication', label: 'Dédicace' },
] as const;

export type CustomFieldType = 'text' | 'select' | 'textarea' | 'number';

export interface CustomFieldConfig {
  id: string;
  type: CustomFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

export interface DonationFormDraft {
  id?: string;
  title: string;
  description: string;
  slug: string;
  coverImage: string | null;

  amountType: AmountType;
  suggestedAmounts: number[];
  minAmount: number | null;
  maxAmount: number | null;
  currency: Currency;
  allowRecurring: boolean;
  frequencies: FrequencyKey[];

  requiredFields: string[];
  optionalFields: string[];
  customFields: CustomFieldConfig[];

  primaryColor: string;
  logo: string | null;
  coverImageDesign?: string | null;
  font: FontOption;
  buttonStyle: ButtonStyle;

  welcomeMessage: string;
  thankYouMessage: string;
  emailTemplate: string;
  redirectUrl: string;

  enableConsents: boolean;
  consentText: string;
  enableCaptcha: boolean;
  maxDonations: number | null;
  startDate: string | null;
  endDate: string | null;
  goalAmount: number | null;

  organizationId: string;
  status: FormStatus;
  /** Pour affichage public (barre de progression) */
  totalCollected?: number;
}

export const DEFAULT_DONATION_FORM_DRAFT = (organizationId: string): DonationFormDraft => ({
  title: '',
  description: '',
  slug: '',
  coverImage: null,
  amountType: 'flexible',
  suggestedAmounts: [25, 50, 100, 250, 500],
  minAmount: null,
  maxAmount: null,
  currency: 'CAD',
  allowRecurring: false,
  frequencies: [],
  requiredFields: ['email', 'firstName', 'lastName'],
  optionalFields: [],
  customFields: [],
  primaryColor: '#3B82F6',
  logo: null,
  coverImageDesign: null,
  font: 'Inter',
  buttonStyle: 'gradient',
  welcomeMessage: '',
  thankYouMessage: '',
  emailTemplate: '',
  redirectUrl: '',
  enableConsents: true,
  consentText: '',
  enableCaptcha: false,
  maxDonations: null,
  startDate: null,
  endDate: null,
  goalAmount: null,
  organizationId,
  status: 'draft',
});
