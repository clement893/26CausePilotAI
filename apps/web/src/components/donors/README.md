# Donors Components

Composants React pour la gestion des donateurs et du CRM.

## Composants Disponibles

### TagSelector
Composant pour sélectionner et assigner des tags aux donateurs.

```tsx
import { TagSelector } from '@/components/donors';

<TagSelector
  donorId={donor.id}
  assignedTagIds={donor.tagIds}
  onTagsChange={(tagIds) => console.log('Tags changed:', tagIds)}
/>
```

**Props:**
- `donorId` (string, required) - ID du donateur
- `assignedTagIds` (string[]) - IDs des tags déjà assignés
- `onTagsChange` (function) - Callback appelé quand les tags changent
- `className` (string) - Classes CSS additionnelles

### TagManager
Composant pour gérer les tags (créer, modifier, supprimer).

```tsx
import { TagManager } from '@/components/donors';

<TagManager />
```

Utilisé dans les pages de paramètres pour gérer tous les tags de l'organisation.

### SegmentSelector
Composant pour sélectionner des segments.

```tsx
import { SegmentSelector } from '@/components/donors';

<SegmentSelector
  donorId={donor.id}
  selectedSegmentIds={donor.segmentIds}
  onSegmentsChange={(segmentIds) => console.log('Segments changed:', segmentIds)}
/>
```

**Props:**
- `donorId` (string, optional) - ID du donateur
- `selectedSegmentIds` (string[]) - IDs des segments sélectionnés
- `onSegmentsChange` (function) - Callback appelé quand les segments changent
- `className` (string) - Classes CSS additionnelles
- `readOnly` (boolean) - Mode lecture seule

### CommunicationList
Composant pour afficher l'historique des communications avec un donateur.

```tsx
import { CommunicationList } from '@/components/donors';

<CommunicationList donorId={donor.id} />
```

**Props:**
- `donorId` (string, required) - ID du donateur
- `className` (string) - Classes CSS additionnelles

Affiche toutes les communications (emails, SMS, appels, lettres) avec leur statut.

### CampaignCard
Composant pour afficher une campagne dans un format carte.

```tsx
import { CampaignCard } from '@/components/donors';

<CampaignCard
  campaign={campaign}
  stats={campaignStats}
  onView={() => router.push(`/campaigns/${campaign.id}`)}
/>
```

**Props:**
- `campaign` (Campaign, required) - Données de la campagne
- `stats` (CampaignStats, optional) - Statistiques de la campagne
- `className` (string) - Classes CSS additionnelles
- `onView` (function) - Callback pour voir les détails

## Utilisation

Tous les composants nécessitent qu'une organisation soit active (via `useOrganization` hook).

```tsx
'use client';

import { TagSelector, CommunicationList } from '@/components/donors';
import { useOrganization } from '@/hooks/useOrganization';

export default function DonorPage({ donorId }: { donorId: string }) {
  const { activeOrganization } = useOrganization();

  if (!activeOrganization) {
    return <div>Please select an organization</div>;
  }

  return (
    <div>
      <TagSelector donorId={donorId} />
      <CommunicationList donorId={donorId} />
    </div>
  );
}
```

## Dépendances

- `@/lib/api/donors` - Client API pour les endpoints donateurs
- `@/hooks/useOrganization` - Hook pour obtenir l'organisation active
- `@/components/ui` - Composants UI de base (Card, Button, Badge, etc.)
- `lucide-react` - Icônes
- `date-fns` - Formatage de dates

## Types

Tous les types sont importés depuis `@modele/types`:
- `DonorTag`
- `DonorSegment`
- `DonorCommunication`
- `Campaign`
- `CampaignStats`
