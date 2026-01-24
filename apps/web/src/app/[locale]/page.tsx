/**
 * Home Page - Cause Pilot
 * Landing page for fundraising and donor management platform powered by AI
 */

'use client';

import { type ReactNode } from 'react';
import { Hero, Stats, TechStack, CTA } from '@/components/sections';
import { Container, Card, Badge, Grid } from '@/components/ui';
import {
  Users,
  BarChart3,
  Brain,
  Target,
  Mail,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  Sparkles,
  DollarSign,
  CheckCircle2,
  MessageSquare,
  Calendar,
  CreditCard,
} from 'lucide-react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface FeatureCategory {
  title: string;
  icon: ReactNode;
  description: string;
  features: Array<{
    title: string;
    description: string;
  }>;
  badgeVariant: BadgeVariant;
  iconColor: string;
}

const featureCategories: FeatureCategory[] = [
  {
    title: 'Intelligence Artificielle',
    icon: <Brain className="w-6 h-6" />,
    description: 'IA avancée pour optimiser vos campagnes de collecte',
    badgeVariant: 'info',
    iconColor: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    features: [
      { title: 'Prédictions de dons', description: 'Anticipez les comportements des donateurs avec l\'IA' },
      { title: 'Segmentation intelligente', description: 'Segmentez automatiquement vos donateurs' },
      { title: 'Recommandations personnalisées', description: 'Suggestions de campagnes adaptées' },
      { title: 'Analyse prédictive', description: 'Identifiez les meilleurs moments pour solliciter' },
      { title: 'Optimisation des montants', description: 'Proposez les montants de dons optimaux' },
      { title: 'Détection des tendances', description: 'Identifiez les patterns de dons automatiquement' },
    ],
  },
  {
    title: 'Gestion des Donateurs',
    icon: <Users className="w-6 h-6" />,
    description: 'Base de données complète et CRM intégré',
    badgeVariant: 'success',
    iconColor: 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400',
    features: [
      { title: 'Profils détaillés', description: 'Historique complet de chaque donateur' },
      { title: 'Segmentation avancée', description: 'Créez des segments personnalisés' },
      { title: 'Scoring des donateurs', description: 'Évaluez le potentiel de chaque donateur' },
      { title: 'Suivi des interactions', description: 'Historique complet des communications' },
      { title: 'Gestion des prospects', description: 'Pipeline de conversion des leads' },
      { title: 'Fidélisation', description: 'Programmes de rétention automatisés' },
    ],
  },
  {
    title: 'Campagnes de Fundraising',
    icon: <Target className="w-6 h-6" />,
    description: 'Créez et gérez vos campagnes de collecte',
    badgeVariant: 'warning',
    iconColor: 'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400',
    features: [
      { title: 'Campagnes multi-canaux', description: 'Email, SMS, réseaux sociaux, web' },
      { title: 'Pages de collecte', description: 'Landing pages optimisées pour la conversion' },
      { title: 'Dons récurrents', description: 'Gestion des abonnements mensuels' },
      { title: 'Peer-to-peer', description: 'Campagnes de collecte collaborative' },
      { title: 'Événements', description: 'Gestion complète d\'événements de collecte' },
      { title: 'Challenges et défis', description: 'Gamification de la collecte de fonds' },
    ],
  },
  {
    title: 'Analytics & Rapports',
    icon: <BarChart3 className="w-6 h-6" />,
    description: 'Tableaux de bord et insights en temps réel',
    badgeVariant: 'info',
    iconColor: 'bg-info-50 dark:bg-info-900/20 text-info-600 dark:text-info-400',
    features: [
      { title: 'Dashboard en temps réel', description: 'Suivi instantané de vos KPIs' },
      { title: 'Rapports personnalisables', description: 'Créez vos propres rapports' },
      { title: 'Analyse ROI', description: 'Mesurez le retour sur investissement' },
      { title: 'Visualisations avancées', description: 'Graphiques et tableaux interactifs' },
      { title: 'Exports de données', description: 'Exportez vos données en CSV, Excel, PDF' },
      { title: 'Insights IA', description: 'Recommandations basées sur vos données' },
    ],
  },
  {
    title: 'Communication & Marketing',
    icon: <Mail className="w-6 h-6" />,
    description: 'Outils de communication multi-canaux',
    badgeVariant: 'default',
    iconColor: 'bg-secondary-50 dark:bg-secondary-900/20 text-secondary-600 dark:text-secondary-400',
    features: [
      { title: 'Campagnes email', description: 'Envoyez des emails personnalisés en masse' },
      { title: 'Templates professionnels', description: 'Bibliothèque de modèles d\'emails' },
      { title: 'A/B Testing', description: 'Testez et optimisez vos messages' },
      { title: 'Automatisation', description: 'Workflows automatisés de communication' },
      { title: 'SMS & notifications', description: 'Envoyez des SMS et notifications push' },
      { title: 'Intégration réseaux sociaux', description: 'Publiez sur tous vos canaux sociaux' },
    ],
  },
  {
    title: 'Paiements & Transactions',
    icon: <CreditCard className="w-6 h-6" />,
    description: 'Système de paiement sécurisé et flexible',
    badgeVariant: 'success',
    iconColor: 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400',
    features: [
      { title: 'Paiements en ligne', description: 'Acceptez les dons par carte et virements' },
      { title: 'Multi-devises', description: 'Support de toutes les devises principales' },
      { title: 'Reçus fiscaux', description: 'Génération automatique de reçus' },
      { title: 'Dons récurrents', description: 'Prélèvements automatiques mensuels' },
      { title: 'Sécurité PCI-DSS', description: 'Conformité totale aux normes de sécurité' },
      { title: 'Rapprochement bancaire', description: 'Réconciliation automatique des paiements' },
    ],
  },
  {
    title: 'Formulaires & Intégrations',
    icon: <Sparkles className="w-6 h-6" />,
    description: 'Formulaires intelligents et intégrations tierces',
    badgeVariant: 'warning',
    iconColor: 'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400',
    features: [
      { title: 'Formulaires de dons', description: 'Créez des formulaires optimisés' },
      { title: 'Widgets embarquables', description: 'Intégrez des formulaires sur votre site' },
      { title: 'API complète', description: 'Intégrez avec vos outils existants' },
      { title: 'Zapier & webhooks', description: 'Automatisez avec 5000+ applications' },
      { title: 'Import/Export', description: 'Importez vos données existantes' },
      { title: 'CRM sync', description: 'Synchronisez avec Salesforce, HubSpot, etc.' },
    ],
  },
  {
    title: 'Sécurité & Conformité',
    icon: <Shield className="w-6 h-6" />,
    description: 'Protection des données et conformité RGPD',
    badgeVariant: 'error',
    iconColor: 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400',
    features: [
      { title: 'Conformité RGPD', description: 'Respect total du RGPD et CCPA' },
      { title: 'Chiffrement des données', description: 'Toutes les données sont chiffrées' },
      { title: 'Authentification 2FA', description: 'Sécurité renforcée pour les comptes' },
      { title: 'Audit logs', description: 'Traçabilité complète des actions' },
      { title: 'Backups automatiques', description: 'Sauvegardes quotidiennes chiffrées' },
      { title: 'Gestion des accès', description: 'Permissions granulaires par rôle' },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Hero />

      {/* Stats Section */}
      <Stats />

      {/* Core Features Section */}
      <section className="py-20 bg-background" aria-labelledby="core-features-heading">
        <Container>
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">
              Fonctionnalités Principales
            </Badge>
            <h2
              id="core-features-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-foreground"
            >
              Une plateforme complète de fundraising
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Cause Pilot réunit tous les outils dont vous avez besoin pour gérer vos campagnes de collecte, vos donateurs et maximiser votre impact social
            </p>
          </div>

          <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="loose">
            {featureCategories.map((category, index) => (
              <Card key={index} hover className="flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-lg ${category.iconColor} flex-shrink-0`}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-foreground">{category.title}</h3>
                      <Badge variant={category.badgeVariant} className="text-xs">
                        {category.features.length}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  </div>
                </div>

                <ul className="space-y-3 flex-1">
                  {category.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Tech Stack Section */}
      <TechStack />

      {/* Why Choose Cause Pilot Section */}
      <section className="py-20 bg-muted/30" aria-labelledby="why-choose-heading">
        <Container>
          <div className="text-center mb-16">
            <Badge variant="success" className="mb-4">
              Pourquoi Cause Pilot ?
            </Badge>
            <h2
              id="why-choose-heading"
              className="text-4xl md:text-5xl font-bold mb-4 text-foreground"
            >
              La plateforme la plus complète
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour maximiser l'impact de vos campagnes de collecte
            </p>
          </div>

          <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal">
            <Card hover className="text-center">
              <Brain className="w-10 h-10 mx-auto mb-4 text-primary-500" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">IA Avancée</h3>
              <p className="text-sm text-muted-foreground">
                Optimisez vos campagnes avec l'intelligence artificielle
              </p>
            </Card>

            <Card hover className="text-center">
              <TrendingUp className="w-10 h-10 mx-auto mb-4 text-success-500" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">+35% de dons</h3>
              <p className="text-sm text-muted-foreground">
                Augmentez vos collectes grâce à nos algorithmes
              </p>
            </Card>

            <Card hover className="text-center">
              <Zap className="w-10 h-10 mx-auto mb-4 text-warning-500" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Installation rapide</h3>
              <p className="text-sm text-muted-foreground">
                Démarrez en moins de 5 minutes avec notre onboarding
              </p>
            </Card>

            <Card hover className="text-center">
              <MessageSquare className="w-10 h-10 mx-auto mb-4 text-info-500" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Support 24/7</h3>
              <p className="text-sm text-muted-foreground">
                Une équipe dédiée pour vous accompagner
              </p>
            </Card>

            <Card hover className="text-center">
              <Globe className="w-10 h-10 mx-auto mb-4 text-primary-500" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Multi-pays</h3>
              <p className="text-sm text-muted-foreground">
                Collectez dans 40+ pays et 20+ devises
              </p>
            </Card>

            <Card hover className="text-center">
              <DollarSign className="w-10 h-10 mx-auto mb-4 text-success-500" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Frais réduits</h3>
              <p className="text-sm text-muted-foreground">
                Les frais les plus compétitifs du marché
              </p>
            </Card>

            <Card hover className="text-center">
              <Calendar className="w-10 h-10 mx-auto mb-4 text-secondary-500" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">Planification</h3>
              <p className="text-sm text-muted-foreground">
                Planifiez vos campagnes à l'avance
              </p>
            </Card>

            <Card hover className="text-center">
              <Shield className="w-10 h-10 mx-auto mb-4 text-error-500" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">100% Sécurisé</h3>
              <p className="text-sm text-muted-foreground">
                Conformité RGPD et sécurité bancaire
              </p>
            </Card>
          </Grid>
        </Container>
      </section>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}