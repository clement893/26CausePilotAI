# Instructions Détaillées pour Cursor - Étape 3.1.3

**Phase:** 3 - Marketing & Communications  
**Étape:** 3.1 - Module Campagnes Email  
**Fonctionnalité:** 3.1.3 - Interface de Gestion des Campagnes  
**Prérequis:** Étape 3.1.2 complétée

---

## Contexte

Nous créons l'interface pour gérer les campagnes email. Cela inclut la liste des campagnes, la création, la planification, et l'analyse des statistiques.

**Référence cahier des charges:** Section 8.1 - Gestion des Campagnes Email

---

## 1. Page Liste des Campagnes

**Créée:** `/apps/web/src/app/[locale]/dashboard/marketing/campagnes/page.tsx`

### Structure de la Page

- **Header** avec KPIs (Total campagnes, Taux d'ouverture moyen, Taux de clics moyen)
- **Bouton** "Créer une campagne"
- **Table** des campagnes avec colonnes : Nom, Statut, Audience, Envoyé le, Ouvertures, Clics, Actions
- **Filtres** par statut
- **Pagination**

---

## 2. Page Création/Édition de Campagne

**Créée:** `/apps/web/src/app/[locale]/dashboard/marketing/campagnes/new/page.tsx`

### Wizard en 4 Étapes

1. **Configuration:** Nom, sujet, expéditeur (nom + email)
2. **Template:** Sélectionner un template créé dans l'éditeur
3. **Audience:** Sélectionner une audience (segment)
4. **Planification:** Envoyer maintenant ou planifier pour plus tard

---

## 3. Page Statistiques de Campagne

**Créée:** `/apps/web/src/app/[locale]/dashboard/marketing/campagnes/[id]/stats/page.tsx`

- **Graphiques** d'évolution des ouvertures et clics (recharts LineChart)
- **Carte** des clics (heatmap placeholder, à brancher sur tracking)
- **Liste** des donateurs/destinataires avec statut ouvert/cliqué

---

## 4. Actions Serveur

- `listEmailCampaignsAction` - Liste campagnes + KPIs, filtres, pagination
- `createEmailCampaignAction` - Crée une campagne (DRAFT ou SCHEDULED)
- `sendEmailCampaignAction` - Marque la campagne comme envoyée (SENT, sentAt, stats)
- `getCampaignStatsAction` - Statistiques pour la page stats
- `listAudiencesAction` - Liste des audiences (pour le wizard)

---

## 5. Vérifications Importantes

- ✅ La création de campagne fonctionne (wizard 4 étapes)
- ✅ L'envoi (immédiat et planifié) fonctionne
- ✅ Les statistiques sont correctes (KPIs, graphiques, liste destinataires)

---

## 6. Prochaine Étape

Une fois cette étape complétée, Manus passera au Module 3.2 - Segmentation Avancée.
