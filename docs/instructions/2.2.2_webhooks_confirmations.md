# Instructions Détaillées pour Cursor - Étape 2.2.2

**Phase:** 2 - Collecte  
**Étape:** 2.2 - Module Traitement des Paiements  
**Fonctionnalité:** 2.2.2 - Webhooks et Confirmations  
**Prérequis:** Étape 2.2.1 complétée

---

## Contexte

Nous créons les routes API pour recevoir les webhooks de Stripe et PayPal. Ces webhooks sont essentiels pour confirmer les paiements de manière asynchrone et sécurisée.

**Référence cahier des charges:** Section 6.2 - Confirmation des Transactions

---

## 1. Routes API pour les Webhooks

### Webhook Stripe

**Créer:** `/apps/web/app/api/webhooks/stripe/route.ts`

- Vérifier la signature du webhook avec le secret de Stripe
- Gérer les événements `payment_intent.succeeded`, `payment_intent.failed`, et `charge.refunded`
- Mettre à jour le statut du `PaymentIntent` dans la base de données
- Créer une nouvelle `Donation` si le paiement a réussi

### Webhook PayPal

**Créer:** `/apps/web/app/api/webhooks/paypal/route.ts`

- Vérifier la signature du webhook avec l'ID du webhook PayPal
- Gérer les événements `PAYMENT.CAPTURE.COMPLETED` et `PAYMENT.CAPTURE.DENIED`
- Mettre à jour le statut du `PaymentIntent` dans la base de données
- Créer une nouvelle `Donation` si le paiement a réussi

---

## 2. Logique de Confirmation

Le flow de confirmation doit être le suivant :

1.  Réception du webhook
2.  Vérification de la signature
3.  Mise à jour du `PaymentIntent`
4.  Création de la `Donation`
5.  Mise à jour du `Donator`
6.  Émission du reçu fiscal
7.  Envoi de l'email de confirmation

---

## 3. Vérifications Importantes

- ✅ Les routes API pour les webhooks sont créées
- ✅ La vérification de la signature fonctionne pour les deux passerelles
- ✅ Les événements de paiement sont correctement gérés
- ✅ La base de données est mise à jour après chaque événement

---

## 4. Prochaine Étape

Une fois cette étape complétée, Manus préparera les instructions pour **2.2.3 - Émission des Reçus Fiscaux**.
