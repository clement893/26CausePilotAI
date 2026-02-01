# Composants Donateurs / Donors

**Référence :** Audit Turborepo (`docs/AUDIT_TURBOREPO_ET_ORGANISATION.md`)

---

## État actuel

- **`components/donators/`** : composants métier pour la base donateurs (liste, profil, stats, dons, notes, etc.) — utilisés par les pages `/dashboard/donateurs` et le CRM donateurs.
- **`components/donors/`** : ensemble de composants (donors) pouvant recouper partiellement le domaine « donateur » ; à vérifier selon les usages (ex. pages anglophones ou anciennes pages).

Pour éviter la duplication et la confusion, il est recommandé de :

1. **Vérifier les usages** : quelles pages ou features utilisent `donors/` vs `donators/`.
2. **Décider** : soit fusionner (tout sous `donators/` avec un alias ou réexport), soit séparer clairement (ex. `donors/` = UI générique, `donators/` = CRM / métier).
3. **Documenter** ici la convention retenue une fois le choix fait.

Aucune fusion ou suppression n’a été faite automatiquement ; ce fichier sert de rappel pour un nettoyage ultérieur.
