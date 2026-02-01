# Instructions Détaillées pour Cursor - Étape 3.3.2

**Phase:** 3 - Marketing & Communications  
**Étape:** 3.3 - Module Communications Multi-Canal  
**Fonctionnalité:** 3.3.2 - Automatisation (Workflows)  
**Prérequis:** Étape 3.3.1 complétée

---

## Contexte

Éditeur de workflows visuel pour automatiser des séquences d'actions marketing (déclencheurs, actions, connexion des nœuds).

**Référence cahier des charges:** Section 10.2 - Automatisation des Communications

---

## 1. Page de l'Éditeur de Workflows

**Créée:** `/apps/web/src/app/[locale]/dashboard/marketing/workflows/[id]/edit/page.tsx`

### Structure de la Page

- **Zone de travail** infinie (canvas) avec pan & zoom
- **Panneau de déclencheurs** (ex: Nouveau donateur, Anniversaire de don)
- **Panneau d'actions** (ex: Envoyer un email, Envoyer un SMS, Attendre X jours, Ajouter à un segment)
- **Drag & drop** des nœuds sur le canvas
- **Connexion** des nœuds pour créer des séquences
- **Boutons** Activer / Désactiver, sauvegarde automatique

---

## 2. Composants Réutilisables

- **WorkflowEditor** – Éditeur principal (ReactFlow, canvas, panneaux)
- **NodePalette** – Panneau déclencheurs et actions
- **WorkflowNode** – Nœud personnalisé (déclencheur ou action)

---

## 3. Dépendances NPM

- `@xyflow/react` – Éditeur de graphes (remplace react-flow-renderer)

---

## 4. Actions Serveur

- `createWorkflowAction` – Création d’un workflow
- `getWorkflowAction` – Récupération d’un workflow
- `updateWorkflowAction` – Mise à jour (nodes, edges)
- `activateWorkflowAction` – Activer / désactiver
- `listWorkflowsAction` – Liste des workflows
- `executeWorkflowAction` – Exécution (stub pour cron job)

---

## 5. Schéma Prisma

- **Workflow** : `id`, `organizationId`, `name`, `status` (DRAFT | ACTIVE), `nodes` (JSON), `edges` (JSON), `createdAt`, `updatedAt`.

---

## 6. Vérifications Importantes

- ✅ L’éditeur de workflows est fonctionnel (canvas, drag & drop, connexions)
- ✅ La sauvegarde et l’activation d’un workflow fonctionnent
- ⏳ L’exécution réelle des actions (executeWorkflowAction) reste à brancher

---

## 7. Fin de la Phase 3

Cette étape conclut la Phase 3. Toutes les fonctionnalités de marketing et de communication sont en place.
