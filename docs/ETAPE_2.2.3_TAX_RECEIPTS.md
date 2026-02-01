# Instructions Détaillées pour Cursor - Étape 2.2.3

**Phase:** 2 - Collecte  
**Étape:** 2.2 - Module Traitement des Paiements  
**Fonctionnalité:** 2.2.3 - Émission des Reçus Fiscaux  
**Prérequis:** Étape 2.2.2 complétée

---

## Contexte

Nous créons le système de génération et d'envoi automatique des reçus fiscaux après chaque don réussi. Les reçus doivent être conformes aux réglementations locales (Canada, USA, France).

**Référence cahier des charges:** Section 7.1 - Génération de Reçus Fiscaux

---

## 1. Fichiers de Génération de PDF

### Générateur de Reçus

**Créer:** `/apps/web/lib/receipts/generator.ts`

- Créer une fonction `generateReceipt` qui prend les informations du don et du donateur, et génère un PDF
- Utiliser une bibliothèque comme `jspdf` pour créer le PDF
- Uploader le PDF sur un service de stockage comme AWS S3

### Templates de Reçus

**Créer:** `/apps/web/lib/receipts/templates/canada.ts`  
**Créer:** `/apps/web/lib/receipts/templates/usa.ts`  
**Créer:** `/apps/web/lib/receipts/templates/france.ts`

- Chaque template doit contenir les informations légales spécifiques à chaque pays (numéro d'enregistrement, mentions légales, etc.)

---

## 2. Action d'Émission de Reçu

**Créer:** `/apps/web/app/actions/receipts/issue-receipt.ts`

- Créer une action `issueReceiptAction` qui est appelée après un don réussi
- Cette action appelle le générateur de PDF, sauvegarde le reçu, et envoie un email au donateur avec le reçu en pièce jointe

---

## 3. Dépendances NPM

```bash
npm install jspdf @aws-sdk/client-s3
```

---

## 4. Vérifications Importantes

- ✅ La génération de PDF fonctionne
- ✅ Les templates de reçus sont conformes aux réglementations
- ✅ L'envoi d'email avec le reçu en pièce jointe fonctionne

---

## 5. Prochaine Étape

Une fois cette étape complétée, Manus préparera les instructions pour **2.2.4 - Gestion des Dons Récurrents**.
