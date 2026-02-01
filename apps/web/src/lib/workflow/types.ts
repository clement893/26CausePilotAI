/**
 * Types pour l'éditeur de workflows - Étape 3.3.2
 * Déclencheurs et actions disponibles.
 */

export type TriggerType =
  | 'new_donator'
  | 'donation_anniversary'
  | 'segment_entered'
  | 'campaign_clicked';

export type ActionType =
  | 'send_email'
  | 'send_sms'
  | 'wait_days'
  | 'add_to_segment';

export const TRIGGERS: { type: TriggerType; label: string }[] = [
  { type: 'new_donator', label: 'Nouveau donateur' },
  { type: 'donation_anniversary', label: 'Anniversaire de don' },
  { type: 'segment_entered', label: 'Entrée dans un segment' },
  { type: 'campaign_clicked', label: 'Clic sur une campagne' },
];

export const ACTIONS: { type: ActionType; label: string }[] = [
  { type: 'send_email', label: 'Envoyer un email' },
  { type: 'send_sms', label: 'Envoyer un SMS' },
  { type: 'wait_days', label: 'Attendre X jours' },
  { type: 'add_to_segment', label: 'Ajouter à un segment' },
];

export interface TriggerNodeData {
  label: string;
  triggerType: TriggerType;
}

export interface ActionNodeData {
  label: string;
  actionType: ActionType;
  config?: Record<string, unknown>;
}
