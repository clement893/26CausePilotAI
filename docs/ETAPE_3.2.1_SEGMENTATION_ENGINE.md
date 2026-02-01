# Instructions Détaillées pour Cursor - Étape 3.2.1

**Phase:** 3 - Marketing & Communications  
**Étape:** 3.2 - Module Segmentation Avancée  
**Fonctionnalité:** 3.2.1 - Moteur de Segmentation  
**Prérequis:** Module 3.1 complété

---

## Contexte

Nous créons le cœur de la personnalisation : un moteur de segmentation qui permet de créer des audiences basées sur des règles complexes. Cet outil permettra de cibler les communications avec une grande précision.

**Référence cahier des charges:** Section 9.1 - Segmentation Avancée des Donateurs

---

## 1. Page de Création de Segment

**Créée:** `/apps/web/src/app/[locale]/dashboard/marketing/segments/new/page.tsx`

### Structure de la Page

- **Nom** et **description** du segment
- **Type** de segment (Statique ou Dynamique)
- **Constructeur de règles** (pour les segments dynamiques)
  - Groupe de conditions avec logique ET/OU
  - Conditions individuelles (ex: "Total des dons > 500" ET "Date du dernier don dans les 30 derniers jours")
  - Ajout/suppression de conditions
- **Compteur en temps réel** du nombre de donateurs dans le segment (débounce 500 ms)

---

## 2. Composants Réutilisables

- **RuleBuilder** – Interface pour construire les règles (logique AND/OR, liste de conditions, bouton "Ajouter une condition")
- **ConditionRow** – Une ligne pour une condition (champ, opérateur, valeur) avec suppression

---

## 3. Actions Serveur

- `createSegmentAction` – Crée une Audience (STATIC ou DYNAMIC) avec règles JSON
- `evaluateSegmentAction` – Compte les donateurs correspondant aux règles (temps réel)

---

## 4. Champs et opérateurs supportés

- **Champs** : Total des dons, Nombre de dons, Date du dernier don, Date du premier don, Segment (VIP, Active…), Score (0-100), Pays, Langue préférée, Désinscrit email
- **Opérateurs** : égal à, différent de, supérieur à, inférieur à, contient (chaîne), avant/après (date), dans les X derniers jours (date)

---

## 5. Vérifications Importantes

- ✅ Le constructeur de règles est fonctionnel (RuleBuilder + ConditionRow)
- ✅ Le compteur en temps réel est précis (evaluateSegmentAction avec débounce)
- ✅ La sauvegarde du segment fonctionne (createSegmentAction → Audience)

---

## 6. Prochaine Étape

Une fois cette étape complétée, Manus préparera les instructions pour **3.2.2 - Segments Dynamiques et Statiques**.
