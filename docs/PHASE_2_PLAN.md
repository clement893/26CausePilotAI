# Plan Phase 2 - Collecte

**Date:** 1er février 2026  
**Durée estimée:** Mois 4-6  
**Prérequis:** Phase 1 complétée et validée

---

## Objectif de la Phase 2

Permettre à la plateforme de **recevoir des dons** en ligne de manière sécurisée, flexible et optimisée. Cette phase est le cœur fonctionnel de l'application de collecte de fonds.

**Référence cahier des charges:** Section 5 - Module Formulaires de Don

---

## Modules de la Phase 2

### Module 2.1 : Formulaires de Don

Création et gestion de formulaires de don personnalisables.

### Module 2.2 : Traitement des Paiements

Intégration des passerelles de paiement et gestion des transactions.

---

## Décomposition Détaillée

### Étape 2.1 : Module Formulaires de Don

#### **2.1.1 - Modèle de Données pour les Formulaires**

**Objectif:** Créer les modèles Prisma pour les formulaires de don et leurs configurations.

**Modèles à créer:**

1. **DonationForm** - Le formulaire de don
   - Informations de base (titre, description, slug)
   - Configuration (montants suggérés, montant min/max, devise)
   - Design (couleurs, logo, image de fond)
   - Champs personnalisés (JSON)
   - Statut (draft, published, archived)
   - Organisation (multi-tenant)

2. **DonationFormSubmission** - Soumission d'un formulaire
   - Formulaire lié
   - Donateur lié (ou création automatique)
   - Montant
   - Fréquence (one-time, monthly, yearly)
   - Données du formulaire (JSON)
   - Statut (pending, completed, failed)

3. **PaymentIntent** - Intention de paiement
   - Soumission liée
   - Passerelle (stripe, paypal, moneris)
   - ID externe (payment intent ID)
   - Montant
   - Statut (created, processing, succeeded, failed)
   - Métadonnées

**Relations:**
- Organization → DonationForms (1:N)
- DonationForm → Submissions (1:N)
- DonationFormSubmission → Donator (N:1)
- DonationFormSubmission → Donation (1:1)
- DonationFormSubmission → PaymentIntent (1:1)

#### **2.1.2 - Interface de Gestion des Formulaires**

**Objectif:** Créer l'interface pour lister, créer, modifier et gérer les formulaires de don.

**Pages à créer:**

1. **Liste des formulaires** (`/dashboard/formulaires`)
   - Table avec tous les formulaires
   - Colonnes : Nom, Statut, Montant collecté, Nb de dons, Taux de conversion, Actions
   - Filtres : Statut (All, Published, Draft, Archived)
   - Recherche par nom
   - Bouton "Créer un formulaire"
   - Actions : Voir, Modifier, Dupliquer, Archiver, Supprimer

2. **Statistiques par formulaire**
   - 4 KPI cards :
     - Montant total collecté
     - Nombre de dons
     - Taux de conversion (soumissions/vues)
     - Montant moyen par don

**Composants:**
- FormTable
- FormKPICards
- FormFilters
- FormStatusBadge

#### **2.1.3 - Créateur de Formulaire (Form Builder)**

**Objectif:** Créer un éditeur visuel pour construire des formulaires de don personnalisés.

**Page à créer:** `/dashboard/formulaires/new` et `/dashboard/formulaires/[id]/edit`

**Structure du Form Builder:**

**Étape 1 : Informations de Base**
- Titre du formulaire
- Description
- Slug (URL-friendly)
- Image de couverture

**Étape 2 : Configuration des Montants**
- Type de don : Montant fixe ou libre
- Montants suggérés (ex: 25, 50, 100, 250, 500)
- Montant minimum
- Montant maximum
- Devise (CAD, USD, EUR)
- Autoriser les dons récurrents (checkbox)
- Fréquences disponibles (monthly, quarterly, yearly)

**Étape 3 : Champs du Formulaire**
- **Champs obligatoires** (non modifiables) :
  - Email
  - Prénom
  - Nom
  - Montant
- **Champs optionnels** (activables) :
  - Téléphone
  - Adresse complète
  - Profession
  - Employeur
  - Message personnel
  - Dédier le don à quelqu'un
  - Rester anonyme
- **Champs personnalisés** (ajoutables) :
  - Type : Text, Number, Select, Checkbox, Textarea
  - Label
  - Placeholder
  - Requis (boolean)
  - Options (pour select)

**Étape 4 : Design et Branding**
- Couleur principale (color picker)
- Logo (upload)
- Image de fond (upload)
- Police de caractères (select)
- Style de bouton (solid, outline, gradient)

**Étape 5 : Messages et Remerciements**
- Message de bienvenue (au-dessus du formulaire)
- Message de remerciement (après don)
- Email de confirmation (template)
- Redirection après don (URL optionnelle)

**Étape 6 : Paramètres Avancés**
- Activer les consentements RGPD/PIPEDA
- Texte des consentements personnalisé
- Activer le captcha (reCAPTCHA)
- Limiter le nombre de dons
- Date de début et de fin (optionnel)
- Objectif de collecte (optionnel)

**Preview en temps réel:**
- Panneau de preview à droite
- Mise à jour en temps réel lors des modifications
- Testable directement

**Fonctionnalités:**
- Drag & drop pour réorganiser les champs
- Validation en temps réel
- Sauvegarde automatique (draft)
- Bouton "Publier"

#### **2.1.4 - Page Publique du Formulaire**

**Objectif:** Créer la page publique où les donateurs remplissent le formulaire.

**Page à créer:** `/don/[slug]` (route publique, pas de `[locale]`)

**Structure de la Page:**

**Layout:**
- Header avec logo de l'organisation
- Image de couverture (si configurée)
- Titre et description du formulaire
- Barre de progression (si objectif défini)

**Formulaire:**
- Section 1 : Sélection du montant
  - Boutons pour montants suggérés
  - Input pour montant personnalisé
  - Toggle pour don récurrent
  - Sélecteur de fréquence (si récurrent)
- Section 2 : Informations du donateur
  - Tous les champs configurés
  - Validation en temps réel
- Section 3 : Paiement
  - Sélecteur de méthode (Stripe, PayPal)
  - Intégration Stripe Elements (carte bancaire)
  - Ou bouton PayPal
- Section 4 : Consentements
  - Checkboxes pour les consentements
  - Liens vers politique de confidentialité et CGU

**Fonctionnalités:**
- Responsive (mobile-first)
- Validation côté client (Zod)
- Loading states pendant le paiement
- Gestion des erreurs
- Redirection vers page de remerciement

**Page de Remerciement:** `/don/[slug]/merci`
- Message de remerciement personnalisé
- Récapitulatif du don
- Bouton "Télécharger le reçu"
- Bouton "Partager sur les réseaux sociaux"
- Suggestion de partage pour campagne P2P

---

### Étape 2.2 : Module Traitement des Paiements

#### **2.2.1 - Configuration des Passerelles de Paiement**

**Objectif:** Configurer Stripe et PayPal pour accepter les paiements.

**Fichiers à créer:**

1. **Configuration Stripe** (`/lib/payment/stripe.ts`)
   - Initialisation du client Stripe
   - Création de Payment Intent
   - Confirmation de paiement
   - Gestion des erreurs

2. **Configuration PayPal** (`/lib/payment/paypal.ts`)
   - Initialisation du SDK PayPal
   - Création d'ordre
   - Capture de paiement
   - Gestion des erreurs

3. **Interface unifiée** (`/lib/payment/index.ts`)
   - Abstraction des passerelles
   - Méthode `createPayment()`
   - Méthode `confirmPayment()`
   - Méthode `refundPayment()`

**Variables d'environnement:**
```env
# Stripe
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
```

#### **2.2.2 - Webhooks et Confirmations**

**Objectif:** Gérer les webhooks des passerelles pour confirmer les paiements.

**Routes API à créer:**

1. **Webhook Stripe** (`/api/webhooks/stripe/route.ts`)
   - Vérification de la signature
   - Gestion des événements :
     - `payment_intent.succeeded`
     - `payment_intent.failed`
     - `charge.refunded`
   - Mise à jour de la base de données
   - Création du don
   - Envoi de l'email de confirmation

2. **Webhook PayPal** (`/api/webhooks/paypal/route.ts`)
   - Vérification de la signature
   - Gestion des événements :
     - `PAYMENT.CAPTURE.COMPLETED`
     - `PAYMENT.CAPTURE.DENIED`
   - Mise à jour de la base de données
   - Création du don
   - Envoi de l'email de confirmation

**Logique de traitement:**
1. Recevoir le webhook
2. Vérifier la signature (sécurité)
3. Extraire les données de paiement
4. Mettre à jour le `PaymentIntent` (statut)
5. Créer le `Donation` si succès
6. Mettre à jour le `Donator` (totalDonations, donationCount, etc.)
7. Créer une `Activity` pour traçabilité
8. Émettre le reçu fiscal
9. Envoyer l'email de confirmation
10. Déclencher les workflows automatisés (Phase 3)

#### **2.2.3 - Émission Automatique de Reçus Fiscaux**

**Objectif:** Générer et envoyer automatiquement les reçus fiscaux après chaque don.

**Fichiers à créer:**

1. **Générateur de reçus** (`/lib/receipts/generator.ts`)
   - Template PDF pour reçu fiscal
   - Génération avec données du don
   - Numéro de reçu unique
   - Conformité fiscale (Canada, USA, France)

2. **Action d'émission** (`/app/actions/donations/issue-receipt.ts`)
   - Génération du PDF
   - Upload vers S3 (ou stockage local)
   - Mise à jour du `Donation` (receiptUrl, receiptNumber)
   - Envoi par email

**Template de reçu:**
- Logo de l'organisation
- Informations de l'organisation (nom, adresse, numéro d'enregistrement)
- Informations du donateur
- Montant du don
- Date du don
- Numéro de reçu unique
- Signature (optionnelle)
- Mentions légales

**Conformité:**
- **Canada:** Numéro d'enregistrement d'organisme de bienfaisance
- **USA:** 501(c)(3) tax-exempt status
- **France:** Reçu Cerfa n°11580

#### **2.2.4 - Gestion des Dons Récurrents**

**Objectif:** Supporter les abonnements pour les dons récurrents.

**Modèle à ajouter:**

```prisma
model Subscription {
  id          String   @id @default(cuid())
  
  // Donateur
  donatorId   String
  donator     Donator  @relation(fields: [donatorId], references: [id], onDelete: Cascade)
  
  // Formulaire
  formId      String
  form        DonationForm @relation(fields: [formId], references: [id], onDelete: Cascade)
  
  // Configuration
  amount      Decimal  @db.Decimal(10, 2)
  currency    String   @default("CAD")
  frequency   String   // monthly, quarterly, yearly
  
  // Passerelle
  gateway     String   // stripe, paypal
  subscriptionId String // ID externe (Stripe subscription ID)
  
  // Statut
  status      String   @default("active") // active, paused, cancelled
  
  // Dates
  startDate   DateTime @default(now())
  nextPaymentDate DateTime
  endDate     DateTime?
  
  // Relations
  donations   Donation[] // Tous les dons générés par cet abonnement
  
  // Organisation
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([donatorId])
  @@index([formId])
  @@index([organizationId])
  @@index([status])
  @@map("subscriptions")
}
```

**Fonctionnalités:**
- Création d'abonnement Stripe/PayPal
- Gestion des paiements récurrents automatiques
- Webhooks pour chaque paiement récurrent
- Interface pour gérer les abonnements (pause, annulation)
- Email de rappel avant chaque prélèvement
- Gestion des échecs de paiement (retry)

#### **2.2.5 - Gestion des Échecs et Remboursements**

**Objectif:** Gérer les cas d'échec de paiement et les demandes de remboursement.

**Fonctionnalités:**

1. **Retry automatique** pour échecs de paiement
   - 3 tentatives espacées de 24h
   - Email de notification au donateur
   - Mise à jour du statut

2. **Interface de remboursement**
   - Page de gestion des dons (`/dashboard/dons`)
   - Bouton "Rembourser" sur chaque don
   - Confirmation avec raison
   - Appel API à la passerelle
   - Mise à jour de la base de données
   - Email de confirmation au donateur

3. **Gestion des litiges**
   - Notification des chargebacks Stripe
   - Interface pour répondre aux litiges
   - Documentation automatique

---

## Résumé des Livrables Phase 2

### Modèles Prisma (5 nouveaux)
- DonationForm
- DonationFormSubmission
- PaymentIntent
- Subscription
- (Donation déjà créé en Phase 1)

### Pages (6 pages)
- Liste des formulaires
- Créateur de formulaire (new/edit)
- Page publique du formulaire
- Page de remerciement
- Liste des dons
- Détails d'un don

### Composants (15+)
- FormTable
- FormKPICards
- FormBuilder (avec 6 steps)
- AmountSelector
- PaymentMethodSelector
- StripeCardElement
- PayPalButton
- ConsentCheckboxes
- ReceiptDownloadButton
- SubscriptionManager

### Actions Serveur (10+)
- createForm
- updateForm
- deleteForm
- submitDonationForm
- createPaymentIntent
- confirmPayment
- issueReceipt
- createSubscription
- cancelSubscription
- refundDonation

### Routes API (5)
- /api/webhooks/stripe
- /api/webhooks/paypal
- /api/donations
- /api/forms/[slug]
- /api/receipts/[id]

### Intégrations Externes
- Stripe (paiements one-time + récurrents)
- PayPal (paiements one-time)
- AWS S3 (stockage des reçus)
- Service d'email (confirmation et reçus)

---

## Dépendances NPM

```bash
# Stripe
npm install @stripe/stripe-js stripe

# PayPal
npm install @paypal/checkout-server-sdk

# Génération de PDF
npm install jspdf html2canvas

# Upload de fichiers
npm install @aws-sdk/client-s3

# Emails
npm install nodemailer
npm install -D @types/nodemailer
```

---

## Ordre d'Implémentation Recommandé

1. **2.1.1** - Modèles de données (schéma Prisma)
2. **2.2.1** - Configuration des passerelles de paiement
3. **2.1.2** - Interface de gestion des formulaires
4. **2.1.3** - Créateur de formulaire (Form Builder)
5. **2.1.4** - Page publique du formulaire
6. **2.2.2** - Webhooks et confirmations
7. **2.2.3** - Émission automatique de reçus
8. **2.2.4** - Gestion des dons récurrents
9. **2.2.5** - Gestion des échecs et remboursements

---

## Critères d'Acceptation Phase 2

Conformément au cahier des charges (section 15.3) :

| Fonctionnalité | Critère d'Acceptation |
|:---------------|:----------------------|
| Création de formulaire | Un formulaire complet peut être créé en moins de 10 minutes |
| Traitement de don | Un don est traité en moins de 30 secondes bout-en-bout |
| Émission de reçu | Le reçu est émis automatiquement en moins de 2 minutes |
| Taux de succès paiement | > 95% de réussite (hors échecs bancaires) |
| Conversion | Augmentation de +15% vs formulaire de base |

---

## Prochaine Étape

Je vais maintenant créer les instructions détaillées pour la **première fonctionnalité : 2.1.1 - Modèle de Données pour les Formulaires**.
