# Réorganisation du Menu

**Date:** 1er février 2026

---

## Contexte

Réorganisation du menu de navigation principal pour le rendre plus clair, logique et facile à utiliser, avec regroupement par module fonctionnel et sous-menus.

---

## Nouvelle structure du menu

| Groupe         | Entrées              | Liens                                      |
|----------------|----------------------|--------------------------------------------|
| **Dashboard**  | (lien unique)        | `/dashboard`                                |
| **Collecte**   | Formulaires          | `/dashboard/formulaires`                    |
|                | Campagnes P2P        | `/dashboard/p2p/campagnes`                  |
| **CRM**        | Donateurs            | `/dashboard/donateurs`                      |
|                | Segments             | `/dashboard/base-donateur/segments`        |
| **Marketing**  | Campagnes Email      | `/dashboard/marketing/campagnes`           |
|                | Workflows            | `/dashboard/marketing/workflows`           |
| **Analyse**    | Rapports             | `/dashboard/analytics/rapports`             |
| **Administration** | Utilisateurs     | `/dashboard/administration/users`           |
|                | Paramètres           | `/dashboard/administration/parametres`     |

Les groupes **Admin** (logs, thèmes, configuration) et **SuperAdmin** (organisations, paramètres, gestion, dashboard) restent affichés selon les rôles, sans changement de structure.

---

## Fichier modifié

- `apps/web/src/lib/navigation/index.tsx` : configuration du menu réécrite pour refléter la nouvelle structure. L’affichage des groupes reste conditionné par les modules activés (`base-donateur`, `formulaires`, `campagnes`, `p2p`, `analytics`, `administration`).

---

## Pages hors menu

Les pages suivantes restent accessibles par URL directe ou depuis d’autres écrans mais ne figurent plus dans le menu principal : Dons, Statistiques, Abonnements (CRM), Intégrations (formulaires), Campagnes / Courriels / Médias sociaux, Templates email, Segments (marketing), Dashboard Analytics, IA.

---

## Checklist

- [x] Le fichier de configuration du menu est à jour.
- [ ] Le menu s’affiche avec la nouvelle structure (vérification manuelle).
- [x] Tous les liens du menu pointent vers les routes existantes.
- [ ] Affichage responsive / mobile à valider manuellement.
