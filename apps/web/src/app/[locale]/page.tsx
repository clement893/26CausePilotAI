/**
 * Home Page - Cause Pilot
 * Modern marketing landing page for fundraising and donor management platform powered by AI
 */

'use client';

import { type ReactNode } from 'react';
import { Stats, CTA } from '@/components/sections';
import { Container, Card, Badge, Grid } from '@/components/ui';
import ButtonLink from '@/components/ui/ButtonLink';
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
  Heart,
  ArrowRight,
  Star,
  Play,
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
    iconColor: 'bg-emerald-50 dark:bg-emerald-900/20 text-[#1a4d2e] dark:text-emerald-400',
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
    iconColor: 'bg-orange-50 dark:bg-orange-900/20 text-[#cc5500] dark:text-orange-400',
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
    iconColor: 'bg-emerald-50 dark:bg-emerald-900/20 text-[#2d5016] dark:text-emerald-400',
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
    iconColor: 'bg-orange-50 dark:bg-orange-900/20 text-[#b45309] dark:text-orange-400',
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
    iconColor: 'bg-emerald-50 dark:bg-emerald-900/20 text-[#1a4d2e] dark:text-emerald-400',
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
    iconColor: 'bg-orange-50 dark:bg-orange-900/20 text-[#cc5500] dark:text-orange-400',
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
    iconColor: 'bg-emerald-50 dark:bg-emerald-900/20 text-[#2d5016] dark:text-emerald-400',
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
    iconColor: 'bg-orange-50 dark:bg-orange-900/20 text-[#b45309] dark:text-orange-400',
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
      {/* Modern Hero Section - Dark Green & Burnt Orange Branding */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a4d2e] via-[#2d5016] to-[#153d23] dark:from-[#0f2e1a] dark:via-[#1a4d2e] dark:to-[#0a1f12]">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <Container className="relative z-10 text-center text-white">
          <Badge variant="default" className="mb-6 bg-white/20 backdrop-blur-sm text-white border-white/30">
            <Sparkles className="w-4 h-4 mr-2" />
            Propulsé par l'Intelligence Artificielle
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight animate-fade-in">
            Transformez votre
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cc5500] via-[#fb923c] to-[#fdba74]">
              collecte de fonds
            </span>
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-emerald-50 mb-10 max-w-4xl mx-auto font-light leading-relaxed">
            La plateforme de fundraising la plus intelligente.
            Augmentez vos dons de <span className="font-bold text-[#cc5500]">35% en moyenne</span> grâce à l'IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <ButtonLink
              href="/auth/register"
              size="lg"
              variant="default"
              className="bg-[#cc5500] text-white hover:bg-[#b34a00] text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all"
            >
              <Heart className="w-5 h-5 mr-2" />
              Démarrer gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </ButtonLink>
            <ButtonLink
              href="/dashboard"
              size="lg"
              variant="outline"
              className="border-2 border-[#cc5500] text-[#cc5500] hover:bg-[#cc5500]/10 text-lg px-8 py-6 backdrop-blur-sm"
            >
              <Play className="w-5 h-5 mr-2" />
              Voir la démo
            </ButtonLink>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#cc5500]" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#cc5500]" />
              <span>Installation en 5 min</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#cc5500]" />
              <span>Support 24/7</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-muted/30">
        <Container>
          <p className="text-center text-muted-foreground mb-8 text-sm uppercase tracking-wider font-semibold">
            Ils nous font confiance
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            {['Croix-Rouge', 'Unicef', 'WWF', 'Médecins Sans Frontières'].map((org, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">{org}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <Stats />

      {/* Core Value Proposition */}
      <section className="py-24 bg-background">
        <Container>
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4">
              Pourquoi Cause Pilot ?
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Une plateforme complète
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1a4d2e] to-[#2d5016]">
                de fundraising
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tout ce dont vous avez besoin pour gérer vos campagnes, vos donateurs et maximiser votre impact social
            </p>
          </div>

          <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="loose">
            {featureCategories.slice(0, 6).map((category, index) => (
              <Card key={index} hover className="flex flex-col h-full group transition-all hover:shadow-xl">
                <div className="mb-6">
                  <div className={`inline-flex p-4 rounded-2xl ${category.iconColor} group-hover:scale-110 transition-transform`}>
                    {category.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{category.title}</h3>
                <p className="text-muted-foreground mb-6">{category.description}</p>
                <ul className="space-y-3 flex-1">
                  {category.features.slice(0, 4).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{feature.title}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-orange-50 dark:from-muted dark:to-muted">
        <Container>
          <div className="text-center mb-16">
            <Badge variant="success" className="mb-4">
              Témoignages
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Ce que disent nos clients
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Plus de 5000 organisations nous font confiance
            </p>
          </div>

          <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
            {[
              {
                name: 'Marie Dubois',
                role: 'Directrice, Association Espoir',
                content: 'Cause Pilot a transformé notre manière de collecter. Nous avons augmenté nos dons de 42% en seulement 6 mois!',
                rating: 5,
              },
              {
                name: 'Jean Martin',
                role: 'Responsable Fundraising, Fondation Avenir',
                content: 'L\'IA nous aide à mieux comprendre nos donateurs. Les prédictions sont incroyablement précises.',
                rating: 5,
              },
              {
                name: 'Sophie Laurent',
                role: 'CEO, ONG Solidarité',
                content: 'Interface intuitive et équipe support réactive. Un outil indispensable pour toute organisation.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#cc5500] text-[#cc5500]" />
                  ))}
                </div>
                <p className="text-foreground mb-6 text-lg italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-background">
        <Container>
          <div className="text-center mb-16">
            <Badge variant="warning" className="mb-4">
              Avantages
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Pourquoi choisir Cause Pilot ?
            </h2>
          </div>

          <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal">
            <Card hover className="text-center p-8 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-[#1a4d2e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">IA Avancée</h3>
              <p className="text-muted-foreground">
                Optimisez vos campagnes avec l'intelligence artificielle
              </p>
            </Card>

            <Card hover className="text-center p-8 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-[#cc5500]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">+35% de dons</h3>
              <p className="text-muted-foreground">
                Augmentez vos collectes grâce à nos algorithmes
              </p>
            </Card>

            <Card hover className="text-center p-8 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-[#2d5016]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Installation rapide</h3>
              <p className="text-muted-foreground">
                Démarrez en moins de 5 minutes
              </p>
            </Card>

            <Card hover className="text-center p-8 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageSquare className="w-8 h-8 text-[#b45309]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Support 24/7</h3>
              <p className="text-muted-foreground">
                Une équipe dédiée pour vous accompagner
              </p>
            </Card>

            <Card hover className="text-center p-8 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-[#1a4d2e]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Multi-pays</h3>
              <p className="text-muted-foreground">
                Collectez dans 40+ pays
              </p>
            </Card>

            <Card hover className="text-center p-8 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-8 h-8 text-[#cc5500]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Frais réduits</h3>
              <p className="text-muted-foreground">
                Les tarifs les plus compétitifs
              </p>
            </Card>

            <Card hover className="text-center p-8 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-[#2d5016]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Planification</h3>
              <p className="text-muted-foreground">
                Planifiez vos campagnes à l'avance
              </p>
            </Card>

            <Card hover className="text-center p-8 group">
              <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-8 h-8 text-[#b45309]" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">100% Sécurisé</h3>
              <p className="text-muted-foreground">
                Conformité RGPD totale
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