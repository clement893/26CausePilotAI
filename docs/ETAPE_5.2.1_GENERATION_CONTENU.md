# Étape 5.2.1 : Génération de Contenu avec l'IA

**Date:** 1er février 2026  
**Référence:** Section 12.3 - Génération de Contenu

---

## Vue d'ensemble

La génération de contenu avec l'IA permet aux utilisateurs de générer du contenu (emails, descriptions de campagnes) à partir d'un prompt simple, en utilisant l'API AI du backend (OpenAI ou Anthropic).

---

## Implémentation

### 1. Action Serveur

**Fichier:** `apps/web/src/app/actions/ai/generateContent.ts`

- `generateContent()` : Génère du contenu à partir d'un prompt
- Supporte différents types de contenu : `email`, `campaign_description`, `general`
- Utilise l'API `/api/v1/ai/chat` du backend
- Construit automatiquement un prompt système selon le type de contenu

**Types de contenu :**
- **email** : Génère du contenu d'email marketing avec CTA fort
- **campaign_description** : Génère des descriptions de campagnes engageantes
- **general** : Génération de contenu général

### 2. Composant Modal

**Fichier:** `apps/web/src/components/ai/AIGenerationModal.tsx`

Modale qui permet :
- De saisir un prompt
- De générer du contenu avec l'IA
- D'afficher le contenu généré
- De copier le contenu
- D'insérer le contenu dans l'éditeur

### 3. Composant Bouton

**Fichier:** `apps/web/src/components/ai/AIGenerateButton.tsx`

Bouton compact "IA" qui ouvre la modale de génération. Peut être intégré facilement dans n'importe quel formulaire.

### 4. Intégrations

#### Éditeur d'emails

**Fichier:** `apps/web/src/components/email-editor/InspectorPanel.tsx`

Le bouton "Générer avec l'IA" est intégré dans le panneau d'inspection pour les blocs de type "texte". Cliquer sur le bouton ouvre la modale, et le contenu généré remplace le contenu du bloc texte.

#### Page de création de campagne

**Fichier:** `apps/web/src/app/[locale]/dashboard/marketing/campagnes/new/page.tsx`

Le bouton "Générer avec l'IA" est intégré :
- À côté du champ "Nom de la campagne" (étape 1)
- À côté du champ "Sujet de l'email" (étape 1)

Le contenu généré est automatiquement inséré dans le champ correspondant.

---

## Configuration

### Variables d'environnement

Le backend doit avoir configuré au moins une des clés API suivantes :

```env
# OpenAI (optionnel)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Anthropic (optionnel)
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-haiku-20240307
ANTHROPIC_MAX_TOKENS=1024
ANTHROPIC_TEMPERATURE=0.7
```

Si les deux sont configurées, le système utilise automatiquement celle disponible (mode "auto").

---

## Usage

### Dans l'éditeur d'emails

1. Sélectionner un bloc de type "texte"
2. Cliquer sur le bouton "IA" à côté du label "Contenu"
3. Entrer un prompt (ex: "Écris un email de remerciement pour un don de 100$")
4. Cliquer sur "Générer avec l'IA"
5. Le contenu généré s'affiche dans la modale
6. Cliquer sur "Insérer dans l'éditeur" pour remplacer le contenu du bloc

### Dans la page de création de campagne

1. Aller à l'étape 1 (Configuration)
2. Cliquer sur le bouton "IA" à côté de "Nom de la campagne" ou "Sujet de l'email"
3. Entrer un prompt (ex: "Décris une campagne de collecte de fonds pour aider les sans-abri")
4. Le contenu généré est automatiquement inséré dans le champ

---

## Checklist

- [x] L'action serveur `generateContent` est créée
- [x] Le composant `AIGenerationModal` est créé
- [x] Le composant `AIGenerateButton` est créé
- [x] Le bouton "Générer avec l'IA" est intégré dans l'éditeur d'emails
- [x] Le bouton "Générer avec l'IA" est intégré dans la page de création de campagne
- [x] Le contenu peut être inséré dans l'éditeur
- [ ] Les clés API OpenAI/Anthropic sont configurées (à faire côté backend/env)

---

## Notes

- Le contenu généré peut être du HTML ou du texte brut selon le type de contenu
- Pour les emails, le système génère du contenu optimisé pour le marketing email
- Pour les descriptions de campagnes, le système génère du contenu engageant et inspirant
- Le contenu généré peut être modifié après insertion
- La génération utilise le modèle par défaut configuré dans le backend (gpt-4o-mini ou claude-3-haiku)
