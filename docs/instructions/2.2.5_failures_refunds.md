# Instructions Détaillées pour Cursor - Étape 2.2.5

**Phase:** 2 - Collecte  
**Étape:** 2.2 - Module Traitement des Paiements  
**Fonctionnalité:** 2.2.5 - Échecs et Remboursements  
**Prérequis:** Étape 2.2.4 complétée

---

## Contexte

Nous mettons en place les mécanismes pour gérer les échecs de paiement, les remboursements, et les litiges (chargebacks). Cela est crucial pour maintenir une bonne relation avec les donateurs et pour la comptabilité.

**Référence cahier des charges:** Section 6.3 - Gestion des Erreurs et Remboursements

---

## 1. Fonctionnalités

- **Retry automatique** des paiements échoués (3 tentatives sur 3 jours)
- **Interface de gestion des dons** (`/dashboard/dons`) avec un bouton "Rembourser"
- **Modal de confirmation** pour les remboursements
- **Interface de gestion des litiges** pour répondre aux chargebacks
- **Notifications par email** pour les administrateurs en cas d'échec de paiement ou de litige

---

## 2. Composants

- **DonationTable** - Table pour lister tous les dons avec leur statut
- **RefundModal** - Modal de confirmation pour les remboursements
- **DisputePanel** - Panneau pour gérer un litige

---

## 3. Actions Serveur

- **refundDonationAction** - Rembourse un don via l'API de Stripe ou PayPal
- **retryPaymentAction** - Tente de recapturer un paiement échoué
- **handleDisputeAction** - Soumet une réponse à un litige

---

## 4. Vérifications Importantes

- ✅ Le retry automatique fonctionne
- ✅ Le remboursement d'un don est possible depuis l'interface
- ✅ Les litiges sont correctement affichés et peuvent être gérés
- ✅ Les notifications par email sont envoyées

---

## 5. Fin de la Phase 2

Cette étape conclut la Phase 2. Une fois complétée, toutes les fonctionnalités de collecte de dons seront en place.
