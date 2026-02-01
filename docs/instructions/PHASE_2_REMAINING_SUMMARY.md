# Résumé Condensé - Instructions Phase 2 Restantes

Pour accélérer, voici un résumé des 7 fonctionnalités restantes. Cursor doit se référer au **PHASE_2_PLAN.md** pour les détails complets.

---

## 2.1.3 - Form Builder

**Pages:** `/dashboard/formulaires/new` et `[id]/edit`

**Wizard en 6 étapes:**
1. Infos de base
2. Configuration montants
3. Champs formulaire (drag & drop)
4. Design et branding
5. Messages
6. Paramètres avancés

**Preview en temps réel**

---

## 2.1.4 - Page Publique Formulaire

**Route:** `/don/[slug]`

**Sections:**
- Sélection montant
- Infos donateur
- Paiement (Stripe/PayPal)
- Consentements

**Page merci:** `/don/[slug]/merci`

---

## 2.2.1 - Configuration Passerelles

**Fichiers:**
- `/lib/payment/stripe.ts`
- `/lib/payment/paypal.ts`
- `/lib/payment/index.ts`

**NPM:** `@stripe/stripe-js stripe @paypal/checkout-server-sdk`

---

## 2.2.2 - Webhooks

**Routes:**
- `/api/webhooks/stripe/route.ts`
- `/api/webhooks/paypal/route.ts`

**Flow:** Webhook → Vérif → Update → Create Donation → Receipt → Email

---

## 2.2.3 - Reçus Fiscaux

**Fichiers:**
- `/lib/receipts/generator.ts`
- Templates: Canada, USA, France

**NPM:** `jspdf @aws-sdk/client-s3`

---

## 2.2.4 - Dons Récurrents

**Page:** `/dashboard/abonnements`

**Actions:** create, pause, cancel

**Webhooks** pour paiements récurrents

---

## 2.2.5 - Échecs et Remboursements

**Page:** `/dashboard/dons`

**Fonctionnalités:**
- Retry automatique (3x)
- Remboursements
- Gestion litiges

---

**Ordre recommandé:** 2.1.3 → 2.2.1 → 2.1.4 → 2.2.2 → 2.2.3 → 2.2.4 → 2.2.5
