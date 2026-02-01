# Étape 5.2.2 : Analyse de Sentiments

**Date:** 1er février 2026

## Contexte

Cette fonctionnalité analyse automatiquement les commentaires des donateurs pour en extraire le sentiment (positif, négatif, neutre) en utilisant l'IA.

**Référence cahier des charges:** Section 12.4 - Analyse de Sentiments

## Objectifs

- Analyser automatiquement les nouveaux commentaires laissés par les donateurs
- Stocker le sentiment dans le modèle `Comment`
- Afficher le sentiment sur le profil du donateur et dans les rapports

## Architecture

### Modèle de Données

Le modèle `Comment` a été ajouté au schéma Prisma :

```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  sentiment String?  // "positive", "negative", "neutral"
  donatorId String
  donator   Donator  @relation(fields: [donatorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@index([donatorId])
  @@index([sentiment])
  @@index([createdAt])
  @@map("comments")
}
```

### Composants

#### 1. Action Serveur : `analyzeSentiment`

**Fichier:** `apps/web/src/app/actions/ai/analyzeSentiment.ts`

Analyse le sentiment d'un texte en utilisant l'API AI du backend (OpenAI ou Anthropic).

**Fonction principale:**
- `analyzeSentiment(params)`: Analyse le sentiment d'un texte et retourne "positive", "negative", ou "neutral"

**Utilisation:**
```typescript
import { analyzeSentiment } from '@/app/actions/ai/analyzeSentiment';

const result = await analyzeSentiment({
  content: "Je suis très satisfait de votre organisation !",
  provider: 'auto', // ou 'openai', 'anthropic'
});

if (result.success) {
  console.log(result.sentiment); // "positive"
}
```

#### 2. Action Serveur : `createComment`

**Fichier:** `apps/web/src/app/actions/comments/createComment.ts`

Crée un nouveau commentaire pour un donateur et analyse automatiquement son sentiment.

**Fonction principale:**
- `createComment(params)`: Crée un commentaire et analyse son sentiment automatiquement

**Utilisation:**
```typescript
import { createComment } from '@/app/actions/comments/createComment';

const result = await createComment({
  content: "Merci pour votre travail !",
  donatorId: "donator-id",
  organizationId: "org-id",
});

if (result.success) {
  console.log(result.commentId);
  console.log(result.sentiment); // "positive"
}
```

#### 3. Composant UI : `SentimentBadge`

**Fichier:** `apps/web/src/components/donators/SentimentBadge.tsx`

Badge visuel pour afficher le sentiment d'un commentaire.

**Props:**
- `sentiment`: `'positive' | 'negative' | 'neutral'`
- `className?`: Classes CSS additionnelles

**Utilisation:**
```tsx
import { SentimentBadge } from '@/components/donators';

<SentimentBadge sentiment="positive" />
```

#### 4. Composant : `NotesList` (mis à jour)

**Fichier:** `apps/web/src/components/donators/NotesList.tsx`

Le composant `NotesList` a été mis à jour pour afficher le sentiment des notes si disponible.

**Interface `DonatorNote` mise à jour:**
```typescript
export interface DonatorNote {
  id: string;
  content: string;
  author_name?: string;
  author_avatar?: string;
  created_at: string;
  is_pinned?: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral'; // Nouveau champ
}
```

## Flux d'Utilisation

### 1. Création d'un Commentaire avec Analyse Automatique

```typescript
// Dans un composant ou une action serveur
import { createComment } from '@/app/actions/comments/createComment';

const result = await createComment({
  content: "Votre organisation fait un excellent travail !",
  donatorId: donorId,
  organizationId: organizationId,
});

// Le sentiment est automatiquement analysé et sauvegardé
if (result.success) {
  // Le commentaire est créé avec son sentiment
  console.log(`Commentaire créé: ${result.commentId}`);
  console.log(`Sentiment: ${result.sentiment}`);
}
```

### 2. Affichage du Sentiment dans les Notes

Le composant `NotesList` affiche automatiquement le badge de sentiment si la note en possède un :

```tsx
import { NotesList } from '@/components/donators';

<NotesList
  notes={notes} // notes avec sentiment optionnel
  onAddNote={handleAddNote}
/>
```

## Configuration Backend

L'analyse de sentiment utilise l'API AI du backend (`/api/v1/ai/chat`). Assurez-vous que :

1. **OPENAI_API_KEY** ou **ANTHROPIC_API_KEY** est configuré dans les variables d'environnement du backend
2. L'endpoint `/api/v1/ai/chat` est accessible et fonctionnel

## Migration de Base de Données

Pour créer la table `comments` dans la base de données :

```bash
cd apps/web
pnpm db:push
# ou
pnpm db:migrate dev --name add_comments_table
```

## Types TypeScript

Les types sont disponibles dans `@modele/types` :

```typescript
import type { Comment, CommentCreate } from '@modele/types';

// Comment avec sentiment
const comment: Comment = {
  id: "comment-id",
  content: "Texte du commentaire",
  sentiment: "positive",
  donatorId: "donator-id",
  createdAt: "2026-02-01T12:00:00Z",
};
```

## Exemples d'Utilisation

### Exemple 1 : Analyser le Sentiment d'un Texte Existant

```typescript
import { analyzeSentiment } from '@/app/actions/ai/analyzeSentiment';

const result = await analyzeSentiment({
  content: "Je ne suis pas satisfait du service.",
});

if (result.success && result.sentiment === 'negative') {
  // Traiter le commentaire négatif
  console.log("Commentaire négatif détecté");
}
```

### Exemple 2 : Créer un Commentaire et Afficher le Sentiment

```tsx
'use client';

import { useState } from 'react';
import { createComment } from '@/app/actions/comments/createComment';
import { SentimentBadge } from '@/components/donators';

export function CommentForm({ donatorId, organizationId }) {
  const [content, setContent] = useState('');
  const [sentiment, setSentiment] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await createComment({
      content,
      donatorId,
      organizationId,
    });

    if (result.success) {
      setSentiment(result.sentiment);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Ajouter un commentaire..."
      />
      <button type="submit">Créer</button>
      {sentiment && <SentimentBadge sentiment={sentiment} />}
    </form>
  );
}
```

## Checklist de Vérification

- [x] Le modèle `Comment` est créé dans Prisma
- [x] L'action `analyzeSentiment` fonctionne
- [x] L'action `createComment` analyse et sauvegarde le sentiment
- [x] Le composant `SentimentBadge` affiche correctement le sentiment
- [x] Le composant `NotesList` affiche le sentiment des notes
- [x] Les types TypeScript sont à jour
- [x] La documentation est complète

## Notes Techniques

1. **Performance**: L'analyse de sentiment est effectuée de manière asynchrone lors de la création du commentaire. Si l'analyse échoue, le commentaire est quand même créé sans sentiment.

2. **Fallback**: Si l'API AI ne retourne pas un sentiment valide, le système utilise "neutral" par défaut.

3. **Coût**: Chaque analyse de sentiment consomme des tokens de l'API AI. Pour réduire les coûts, vous pouvez :
   - Analyser uniquement les commentaires de plus de X caractères
   - Permettre à l'utilisateur de choisir manuellement le sentiment
   - Mettre en cache les résultats pour des textes similaires

4. **Extensibilité**: Le système peut être étendu pour :
   - Analyser d'autres types de contenu (emails, messages, etc.)
   - Ajouter des scores de confiance
   - Analyser des émotions plus spécifiques (joie, colère, tristesse, etc.)

## Prochaines Étapes

- [ ] Créer une page de rapport pour visualiser les sentiments des commentaires
- [ ] Ajouter des filtres par sentiment dans la liste des commentaires
- [ ] Implémenter des alertes pour les commentaires négatifs
- [ ] Ajouter des statistiques de sentiment dans le dashboard
