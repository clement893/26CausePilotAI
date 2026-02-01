# Instructions Condensées Phase 2 - Fonctionnalités Restantes

Pour accélérer la préparation, voici un résumé condensé des 7 instructions restantes. Cursor pourra se référer au PHASE_2_PLAN.md pour les détails complets.

---

## 2.1.3 - Form Builder (Créateur de Formulaire)

**Pages:** `/dashboard/formulaires/new` et `/dashboard/formulaires/[id]/edit`

**Structure:** Multi-step wizard en 6 étapes avec preview en temps réel

**Étapes:**
1. Informations de base (titre, description, slug, image)
2. Configuration montants (type, suggérés, min/max, récurrence)
3. Champs formulaire (obligatoires, optionnels, personnalisés avec drag & drop)
4. Design (couleur, logo, police, style bouton)
5. Messages (bienvenue, remerciement, email, redirection)
6. Paramètres avancés (consentements, captcha, limites, dates, objectif)

**Composants:** FormBuilderWizard, StepIndicator, FieldEditor, ColorPicker, ImageUploader, PreviewPanel

**Actions:** createFormAction, updateFormAction, uploadImageAction

---

## 2.1.4 - Page Publique du Formulaire

**Page:** `/don/[slug]` (route publique, pas de [locale])

**Structure:**
- Header avec logo organisation
- Image de couverture
- Titre et description
- Barre de progression (si objectif)
- Section 1: Sélection montant (boutons + custom + récurrence)
- Section 2: Informations donateur (tous champs configurés)
- Section 3: Paiement (Stripe Elements ou PayPal)
- Section 4: Consentements

**Page de remerciement:** `/don/[slug]/merci`

**Composants:** AmountSelector, DonatorInfoForm, PaymentSection, ConsentCheckboxes, ProgressBar

**Actions:** submitDonationFormAction, trackFormViewAction

---

## 2.2.1 - Configuration Passerelles de Paiement

**Fichiers:**
- `/lib/payment/stripe.ts` - Client Stripe, createPaymentIntent, confirmPayment
- `/lib/payment/paypal.ts` - SDK PayPal, createOrder, capturePayment
- `/lib/payment/index.ts` - Interface unifiée

**Env variables:**
```
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
```

**NPM:** `npm install @stripe/stripe-js stripe @paypal/checkout-server-sdk`

---

## 2.2.2 - Webhooks et Confirmations

**Routes API:**
- `/api/webhooks/stripe/route.ts` - Vérif signature, gestion événements
- `/api/webhooks/paypal/route.ts` - Vérif signature, gestion événements

**Événements Stripe:**
- payment_intent.succeeded
- payment_intent.failed
- charge.refunded

**Événements PayPal:**
- PAYMENT.CAPTURE.COMPLETED
- PAYMENT.CAPTURE.DENIED

**Logique:** Webhook → Vérif → Update PaymentIntent → Create Donation → Update Donator → Issue Receipt → Send Email

---

## 2.2.3 - Émission Reçus Fiscaux

**Fichiers:**
- `/lib/receipts/generator.ts` - Génération PDF
- `/lib/receipts/templates/canada.ts` - Template Canada
- `/lib/receipts/templates/usa.ts` - Template USA
- `/lib/receipts/templates/france.ts` - Template France

**Action:** issueReceiptAction

**Template inclut:**
- Logo organisation
- Infos organisation (nom, adresse, numéro enregistrement)
- Infos donateur
- Montant, date, numéro reçu unique
- Signature, mentions légales

**NPM:** `npm install jspdf @aws-sdk/client-s3`

---

## 2.2.4 - Gestion Dons Récurrents

**Fonctionnalités:**
- Création abonnement Stripe/PayPal lors de soumission avec isRecurring=true
- Webhooks pour chaque paiement récurrent
- Interface gestion abonnements: `/dashboard/abonnements`
- Actions: pause, resume, cancel
- Email rappel avant prélèvement
- Retry automatique si échec

**Composants:** SubscriptionTable, SubscriptionCard, SubscriptionActions

**Actions:** createSubscriptionAction, pauseSubscriptionAction, cancelSubscriptionAction

---

## 2.2.5 - Échecs et Remboursements

**Fonctionnalités:**
- Retry automatique (3 tentatives, 24h d'intervalle)
- Page gestion dons: `/dashboard/dons`
- Bouton "Rembourser" avec confirmation
- Interface litiges (chargebacks)

**Composants:** DonationTable, RefundModal, DisputePanel

**Actions:** refundDonationAction, retryPaymentAction, handleDisputeAction

---

## Ordre d'Implémentation Recommandé

1. 2.1.3 - Form Builder
2. 2.2.1 - Configuration passerelles
3. 2.1.4 - Page publique
4. 2.2.2 - Webhooks
5. 2.2.3 - Reçus fiscaux
6. 2.2.4 - Dons récurrents
7. 2.2.5 - Échecs et remboursements

---

**Note:** Cursor doit se référer au PHASE_2_PLAN.md pour les spécifications complètes de chaque fonctionnalité.
