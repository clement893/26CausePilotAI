# Instructions Détaillées pour Cursor - Étape 3.1.1

**Phase:** 3 - Marketing & Communications  
**Étape:** 3.1 - Module Campagnes Email  
**Fonctionnalité:** 3.1.1 - Modèle de Données Marketing  
**Prérequis:** Phase 2 complétée

---

## Contexte

Nous créons les modèles de données nécessaires pour gérer les campagnes email, les templates, et les audiences. Ces modèles sont la base de tout le module marketing.

**Référence cahier des charges:** Section 8.1 - Gestion des Campagnes Email

---

## 1. Nouveaux Modèles Prisma

### Modèle EmailCampaign

- `id`, `name`, `subject`, `fromName`, `fromEmail`
- `status` (enum: DRAFT, SCHEDULED, SENDING, SENT, CANCELED)
- `scheduledAt`, `sentAt`
- `templateId`, `audienceId`
- `stats` (JSON: sent, delivered, opened, clicked, bounced, unsubscribed)

### Modèle EmailTemplate

- `id`, `name`, `description`
- `content` (JSON, pour l'éditeur drag & drop)
- `html` (String, généré à partir du contenu)
- `thumbnail` (String, URL de l'image)

### Modèle Audience

- `id`, `name`, `description`
- `type` (enum: STATIC, DYNAMIC)
- `rules` (JSON, pour les segments dynamiques)
- `donatorIds` (String[], pour les segments statiques) — implémenté via relation many-to-many `donators`

---

## 2. Mises à Jour de Modèles Existants

### Modèle Donator

- Ajouter `emailCampaigns` (relation plusieurs-à-plusieurs)
- Ajouter `unsubscribedAt` (DateTime?)

---

## 3. Vérifications Importantes

- ✅ Les nouveaux modèles sont créés
- ✅ Les relations sont correctes
- ✅ Le modèle Donator est mis à jour

---

## 4. Prochaine Étape

Une fois cette étape complétée, Manus préparera les instructions pour **3.1.2 - Éditeur d'Emails (Drag & Drop)**.
