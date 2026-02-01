# Étape 5.3.2 : Recommandation de Montant de Don

**Date:** 1er février 2026

## Contexte

Cette fonctionnalité suggère des montants de don personnalisés sur les formulaires de don, basés sur l'historique de dons du donateur s'il est connecté, ou des montants par défaut pour les donateurs anonymes.

**Référence cahier des charges:** Section 12.6 - Recommandation de Montant

## Objectifs

- Afficher des montants suggérés personnalisés pour chaque donateur connecté sur les formulaires de don
- Utiliser l'historique de dons (don moyen, plus gros don, dernier don) pour calculer les montants suggérés
- Afficher des montants par défaut pour les donateurs anonymes

## Architecture

### Action Serveur : `getDonationAmountSuggestions`

**Fichier:** `apps/web/src/app/actions/donations/getDonationAmountSuggestions.ts`

Action serveur qui calcule des montants suggérés personnalisés basés sur l'historique du donateur.

**Fonction principale:**
- `getDonationAmountSuggestions(params)`: Calcule les montants suggérés

**Paramètres:**
- `formId`: ID du formulaire de don
- `organizationId`: ID de l'organisation
- `donorEmail?`: Email du donateur (optionnel)
- `donorId?`: ID du donateur (optionnel)

**Logique de calcul:**

1. **Si aucun donateur n'est fourni** : Retourne les montants par défaut du formulaire

2. **Si le donateur existe et a des dons** :
   - Calcule le don moyen
   - Identifie le plus gros don
   - Récupère le dernier don
   - Génère 4-5 montants autour de ces valeurs :
     - Un peu moins que le minimum (70% du min)
     - Le minimum
     - Entre min et max (si différent)
     - Le maximum
     - Un peu plus que le maximum (120% du max)
   - Arrondit tous les montants à 5 près

3. **Si le donateur n'existe pas ou n'a pas de dons** : Retourne les montants par défaut

**Utilisation:**
```typescript
import { getDonationAmountSuggestions } from '@/app/actions/donations/getDonationAmountSuggestions';

const result = await getDonationAmountSuggestions({
  formId: 'form-id',
  organizationId: 'org-id',
  donorEmail: 'donor@example.com',
});

if (result.success) {
  console.log('Montants suggérés:', result.suggestedAmounts);
  console.log('Personnalisé:', result.isPersonalized);
}
```

### Composant : `AmountSelector` (mis à jour)

**Fichier:** `apps/web/src/components/donation-forms/public/AmountSelector.tsx`

Le composant `AmountSelector` a été mis à jour pour accepter des montants personnalisés.

**Nouvelles props:**
- `personalizedAmounts?: number[]`: Montants personnalisés basés sur l'historique
- `isPersonalized?: boolean`: Indique si les montants sont personnalisés

**Comportement:**
- Utilise `personalizedAmounts` s'ils sont disponibles, sinon utilise `form.suggestedAmounts`
- Affiche un indicateur "✨ Personnalisé" si `isPersonalized` est `true`

### Page Publique : Formulaire de Don (mis à jour)

**Fichier:** `apps/web/src/app/[locale]/don/[slug]/page.tsx`

La page publique du formulaire de don a été mise à jour pour charger automatiquement les montants personnalisés.

**Fonctionnalités:**
- Détecte quand l'utilisateur saisit son email dans le formulaire
- Attend 1 seconde après la dernière frappe (debounce) pour éviter trop de requêtes
- Charge les montants personnalisés via `getDonationAmountSuggestions`
- Met à jour automatiquement les montants affichés dans `AmountSelector`

## Flux d'Utilisation

### 1. Donateur Anonyme

1. L'utilisateur accède au formulaire de don
2. Les montants par défaut du formulaire sont affichés (ex: [25, 50, 100, 250, 500])
3. L'utilisateur peut sélectionner un montant ou en saisir un personnalisé

### 2. Donateur Connecté (avec historique)

1. L'utilisateur accède au formulaire de don
2. Les montants par défaut sont affichés initialement
3. L'utilisateur saisit son email dans le formulaire
4. Après 1 seconde, les montants personnalisés sont chargés automatiquement
5. Les montants suggérés sont mis à jour avec des valeurs basées sur l'historique
6. Un indicateur "✨ Personnalisé" apparaît pour indiquer que les montants sont personnalisés

### 3. Donateur Connecté (sans historique)

1. L'utilisateur saisit son email
2. Le système détecte qu'il n'a pas d'historique de dons
3. Les montants par défaut restent affichés (pas de personnalisation)

## Exemples

### Exemple 1 : Donateur avec Historique

**Historique du donateur:**
- Don moyen: 75 CAD
- Plus gros don: 200 CAD
- Dernier don: 100 CAD

**Montants suggérés générés:**
- 50 CAD (70% du min)
- 75 CAD (don moyen)
- 100 CAD (dernier don)
- 200 CAD (plus gros don)
- 240 CAD (120% du max)

### Exemple 2 : Donateur avec Historique Limité

**Historique du donateur:**
- 2 dons de 50 CAD chacun
- Don moyen: 50 CAD
- Plus gros don: 50 CAD
- Dernier don: 50 CAD

**Montants suggérés générés:**
- 35 CAD (70% de 50)
- 50 CAD (don moyen/max)
- 60 CAD (120% de 50)
- + montants par défaut pour compléter

### Exemple 3 : Donateur Anonyme

**Montants suggérés:**
- Utilise les montants par défaut du formulaire (ex: [25, 50, 100, 250, 500])

## Configuration

### Montants par Défaut du Formulaire

Les montants par défaut sont configurés lors de la création/édition du formulaire de don dans le dashboard.

**Valeurs par défaut:** [25, 50, 100, 250, 500] CAD

### Personnalisation

La personnalisation est automatique et ne nécessite aucune configuration supplémentaire. Elle fonctionne dès qu'un donateur saisit son email dans le formulaire.

## Performance

- **Debounce**: Un délai de 1 seconde est appliqué après la saisie de l'email pour éviter trop de requêtes
- **Cache**: Les montants personnalisés sont mis en cache dans l'état du composant
- **Fallback**: En cas d'erreur, les montants par défaut sont utilisés automatiquement

## Checklist de Vérification

- [x] L'action `getDonationAmountSuggestions` retourne des montants personnalisés pour les donateurs connectés
- [x] L'action retourne les montants par défaut pour les donateurs anonymes
- [x] Les montants suggérés s'affichent correctement sur le formulaire de don
- [x] L'indicateur "Personnalisé" s'affiche quand les montants sont personnalisés
- [x] Le debounce fonctionne correctement pour éviter trop de requêtes
- [x] Les erreurs sont gérées gracieusement avec fallback sur les montants par défaut

## Notes Techniques

1. **Arrondi**: Tous les montants sont arrondis à 5 près pour une meilleure UX (ex: 73 → 75, 97 → 100)

2. **Limite de dons**: Seuls les 20 derniers dons sont analysés pour des raisons de performance

3. **Validation d'email**: Une validation regex est effectuée avant de charger les montants personnalisés

4. **Extensibilité**: Le système peut être étendu pour :
   - Prendre en compte d'autres facteurs (fréquence, tendance, etc.)
   - Utiliser des modèles de machine learning pour des recommandations plus précises
   - Ajouter des montants suggérés basés sur des segments de donateurs
   - Personnaliser selon la campagne ou le formulaire spécifique

5. **Accessibilité**: L'indicateur "Personnalisé" utilise un emoji pour une meilleure visibilité, mais pourrait être remplacé par une icône accessible si nécessaire

## Prochaines Étapes

- [ ] Ajouter des tests unitaires pour la logique de calcul des montants
- [ ] Implémenter un cache côté serveur pour améliorer les performances
- [ ] Ajouter des métriques pour mesurer l'impact de la personnalisation sur les conversions
- [ ] Permettre la configuration de la stratégie de personnalisation (agressive, modérée, conservatrice)
- [ ] Intégrer avec des modèles de machine learning pour des recommandations plus précises
