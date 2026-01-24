# 🔧 Résolution : Erreur "A database error occurred"

## 🎯 Problème

Lors de la création d'un donateur, vous obtenez l'erreur :
```
A database error occurred
InternalServerError: A database error occurred
```

## 🔍 Cause

Les tables de la base de données de l'organisation n'existent pas encore. Les migrations doivent être exécutées sur **chaque base de données d'organisation** séparément.

**Important :** Les donateurs sont stockés dans la base de données de l'organisation, PAS dans la base de données principale du backend.

---

## ✅ Solution Rapide

### Option 1 : Via l'API (Recommandé)

Exécutez les migrations via l'endpoint API :

```bash
POST /api/v1/organizations/{organization_id}/database/migrate
```

**Avec curl :**
```bash
curl -X POST \
  "https://modelebackend-production-f855.up.railway.app/api/v1/organizations/ff52c391-a91a-44f4-8d0c-9db5d51385f5/database/migrate" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json"
```

**Note :** Nécessite les droits SuperAdmin.

### Option 2 : Via Script Python

Exécutez le script de migration :

```bash
cd backend
python scripts/migrate_organizations.py
```

Pour une organisation spécifique :
```bash
python scripts/migrate_organizations.py --organization-id ff52c391-a91a-44f4-8d0c-9db5d51385f5
```

---

## 📋 Étapes Détaillées

### 1. Identifier l'Organisation

L'`organization_id` est visible dans l'URL de l'erreur :
```
/api/v1/organizations/ff52c391-a91a-44f4-8d0c-9db5d51385f5/donors
```

### 2. Vérifier les Tables Existantes

```bash
GET /api/v1/organizations/{organization_id}/database/tables
```

### 3. Exécuter les Migrations

```bash
POST /api/v1/organizations/{organization_id}/database/migrate
```

### 4. Vérifier à Nouveau

```bash
GET /api/v1/organizations/{organization_id}/database/tables
```

Vous devriez maintenant voir toutes les tables :
- `donors`
- `donations`
- `donor_segments`
- `donor_tags`
- `donor_communications`
- `campaigns`
- `recurring_donations`
- etc.

### 5. Réessayer

Créez un donateur à nouveau. Cela devrait fonctionner maintenant.

---

## 🔄 Migration Automatique

Pour les nouvelles organisations créées avec `create_database=True`, les migrations sont exécutées automatiquement.

Pour les organisations existantes, vous devez exécuter les migrations manuellement une fois.

---

## 📝 Migrations à Exécuter

Les migrations suivantes doivent être appliquées sur chaque base de données d'organisation :

1. **`add_donor_tables_001`** - Tables de base
   - `donors`
   - `donations`
   - `payment_methods`
   - `donor_notes`
   - `donor_activities`

2. **`add_donor_crm_002`** - Tables CRM (nouvelles)
   - `donor_segments`
   - `donor_segment_assignments`
   - `donor_tags`
   - `donor_tag_assignments`
   - `donor_communications`
   - `campaigns`
   - `recurring_donations`

---

## 🚨 Si le Problème Persiste

1. **Vérifiez les logs du backend** pour l'erreur exacte
2. **Vérifiez la connexion** à la base de données de l'organisation
3. **Vérifiez les permissions** de la base de données
4. **Contactez le support** avec les logs d'erreur complets

---

## 📚 Documentation Complète

Voir `docs/MIGRATION_ORGANISATIONS.md` pour plus de détails.
