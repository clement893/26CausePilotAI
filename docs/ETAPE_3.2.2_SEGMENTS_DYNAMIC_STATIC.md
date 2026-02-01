# Instructions Détaillées pour Cursor - Étape 3.2.2

**Phase:** 3 - Marketing & Communications  
**Étape:** 3.2 - Module Segmentation Avancée  
**Fonctionnalité:** 3.2.2 - Segments Dynamiques et Statiques  
**Prérequis:** Étape 3.2.1 complétée

---

## Contexte

Nous créons l'interface pour lister et gérer les segments créés avec le moteur de segmentation. Cette page permet de voir la taille de chaque segment, de les modifier, et de les utiliser dans les campagnes.

**Référence cahier des charges:** Section 9.2 - Gestion des Segments

---

## 1. Page Liste des Segments

**Créée:** `/apps/web/src/app/[locale]/dashboard/marketing/segments/page.tsx`

### Structure de la Page

- **Header** avec le nombre total de segments
- **Bouton** "Créer un segment"
- **Table** des segments avec colonnes : Nom, Type (Statique/Dynamique), Nombre de donateurs, Créé le, Actions
- **Filtres** par type (Statique / Dynamique)
- **Pagination** (10 par page)
- **Actions** : Rafraîchir (segments dynamiques), Supprimer (avec confirmation)

---

## 2. Actions Serveur

- `getSegmentsAction` – Liste des segments avec filtre par type, pagination, total
- `deleteSegmentAction` – Suppression d’un segment (Audience) après vérification organisation
- `refreshSegmentAction` – Recalcule la taille d’un segment dynamique (évalue les règles, met à jour `cachedDonatorCount`)

---

## 3. Schéma Prisma

- **Audience** : champ optionnel `cachedDonatorCount` (Int) pour stocker le nombre de donateurs des segments dynamiques (mis à jour à la création et au clic « Rafraîchir »).

---

## 4. Vérifications Importantes

- ✅ La liste des segments s’affiche correctement (table, total, filtres, pagination)
- ✅ La suppression d’un segment fonctionne (avec modal de confirmation)
- ✅ Le rafraîchissement d’un segment dynamique met à jour le nombre de donateurs

---

## 5. Prochaine Étape

Une fois cette étape complétée, Manus passera au Module 3.3 - Communications Multi-Canal.
