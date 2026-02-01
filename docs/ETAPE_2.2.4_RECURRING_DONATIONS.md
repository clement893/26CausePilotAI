# Instructions Détaillées pour Cursor - Étape 2.2.4

**Phase:** 2 - Collecte  
**Étape:** 2.2 - Module Traitement des Paiements  
**Fonctionnalité:** 2.2.4 - Gestion des Dons Récurrents  
**Prérequis:** Étape 2.2.3 complétée

---

## Contexte

Nous ajoutons la possibilité pour les donateurs de faire des dons récurrents (abonnements). Cela inclut la création des abonnements, la gestion des paiements récurrents, et une interface pour que les donateurs et les administrateurs puissent gérer ces abonnements.

**Référence cahier des charges:** Section 5.2.3 - Dons Récurrents

---

## 1. Fonctionnalités

- **Création d'abonnement** lors de la soumission d'un formulaire avec `isRecurring=true`
- **Webhooks** pour chaque paiement récurrent réussi ou échoué
- **Interface de gestion des abonnements** pour les administrateurs (`/dashboard/abonnements`)
- **Portail donateur** pour que les donateurs puissent gérer leurs propres abonnements (pause, reprise, annulation)
- **Emails de rappel** avant chaque prélèvement
- **Retry automatique** en cas d'échec de paiement

---

## 2. Composants

- **SubscriptionTable** - Table pour lister les abonnements
- **SubscriptionCard** - Carte pour afficher les détails d'un abonnement
- **SubscriptionActions** - Boutons pour gérer un abonnement (pause, reprise, annulation)

---

## 3. Actions Serveur

- **createSubscriptionAction** - Crée un nouvel abonnement
- **pauseSubscriptionAction** - Met en pause un abonnement
- **cancelSubscriptionAction** - Annule un abonnement

---

## 4. Vérifications Importantes

- ✅ La création d'abonnement fonctionne pour Stripe et PayPal
- ✅ Les paiements récurrents sont correctement traités
- ✅ L'interface de gestion des abonnements est fonctionnelle
- ✅ Les emails de rappel sont envoyés

---

## 5. Prochaine Étape

Une fois cette étape complétée, Manus préparera les instructions pour **2.2.5 - Échecs et Remboursements**.
