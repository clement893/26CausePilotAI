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
    iconColor: 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 text-blue-400',
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
    iconColor: 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400',
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
    iconColor: 'bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-400',
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
    iconColor: 'bg-gradient-to-br from-green-500/20 to-cyan-500/20 text-green-400',
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
    iconColor: 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-400',
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
    iconColor: 'bg-gradient-to-br from-emerald-500/20 to-green-500/20 text-emerald-400',
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
    iconColor: 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-yellow-400',
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
    iconColor: 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-400',
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
    <div className="min-h-screen bg-[#0A0A0F]">
      {/* Modern Hero Section - Premium Dark UI */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0A0A0F]">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-48 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-48 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <Container className="relative z-10 text-center text-white">
          <Badge variant="info" className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-blue-500/20">
            <Sparkles className="w-4 h-4 mr-2 text-blue-400 animate-pulse" />
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Propulsé par l'Intelligence Artificielle
            </span>
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
            <span className="text-white block mb-2">Transformez votre</span>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              collecte de fonds
            </span>
          </h1>

          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-10 max-w-4xl mx-auto font-light leading-relaxed">
            La plateforme de fundraising la plus intelligente.
            <br />
            Augmentez vos dons de{' '}
            <span className="font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">35% en moyenne</span>{' '}
            grâce à l'IA.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <ButtonLink
              href="/auth/register"
              size="lg"
              variant="primary"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8 py-6 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300"
            >
              <Heart className="w-5 h-5 mr-2" />
              Démarrer gratuitement
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </ButtonLink>
            <ButtonLink
              href="/dashboard"
              size="lg"
              variant="outline"
              className="group border-2 border-gray-700 hover:border-blue-500 text-white hover:bg-blue-500/10 text-lg px-8 py-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Voir la démo
            </ButtonLink>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-300">
            <div className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <span>Installation en 5 min</span>
            </div>
            <div className="flex items-center gap-2 group">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              </div>
              <span>Support 24/7</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-[#0A0A0F] border-y border-gray-800/50">
        <Container>
          <p className="text-center text-gray-500 mb-8 text-sm uppercase tracking-wider font-semibold">
            Ils nous font confiance
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {['Croix-Rouge', 'Unicef', 'WWF', 'Médecins Sans Frontières'].map((org, index) => (
              <div key={index} className="text-center group">
                <div className="text-xl font-bold text-gray-600 group-hover:text-gray-400 transition-colors duration-300">{org}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <Stats />

      {/* Core Value Proposition */}
      <section className="py-24 bg-[#0A0A0F] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

        <Container className="relative z-10">
          <div className="text-center mb-16">
            <Badge variant="info" className="mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
              <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Pourquoi Cause Pilot ?
              </span>
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white block mb-2">Une plateforme complète</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                de fundraising
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Tout ce dont vous avez besoin pour gérer vos campagnes, vos donateurs et maximiser votre impact social
            </p>
          </div>

          <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="loose">
            {featureCategories.slice(0, 6).map((category, index) => (
              <Card key={index} hover className="flex flex-col h-full group p-6">
                <div className="mb-6">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <div className="text-blue-400">
                      {category.icon}
                    </div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">{category.title}</h3>
                <p className="text-gray-400 mb-6">{category.description}</p>
                <ul className="space-y-3 flex-1">
                  {category.features.slice(0, 4).map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <span className="text-sm text-gray-300">{feature.title}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-[#13131A] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        <Container className="relative z-10">
          <div className="text-center mb-16">
            <Badge variant="success" className="mb-4 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20">
              <span className="font-semibold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                Témoignages
              </span>
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white block mb-2">Ce que disent</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                nos clients
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Plus de 5,000 organisations nous font confiance
            </p>
          </div>

          <Grid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="normal">
            {[
              {
                name: 'Marie Dubois',
                role: 'Directrice, Association Espoir',
                content: 'Cause Pilot a transformé notre manière de collecter. Nous avons augmenté nos dons de 42% en seulement 6 mois!',
                rating: 5,
                gradient: 'from-blue-500 to-purple-500',
              },
              {
                name: 'Jean Martin',
                role: 'Responsable Fundraising, Fondation Avenir',
                content: 'L\'IA nous aide à mieux comprendre nos donateurs. Les prédictions sont incroyablement précises.',
                rating: 5,
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                name: 'Sophie Laurent',
                role: 'CEO, ONG Solidarité',
                content: 'Interface intuitive et équipe support réactive. Un outil indispensable pour toute organisation.',
                rating: 5,
                gradient: 'from-green-500 to-cyan-500',
              },
            ].map((testimonial, index) => (
              <Card key={index} hover className="p-8 group">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                {/* Quote */}
                <p className="text-gray-300 mb-6 text-lg italic leading-relaxed">"{testimonial.content}"</p>
                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-blue-400 transition-colors duration-300">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-[#0A0A0F] relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-purple-500/5 to-pink-500/5 rounded-full blur-3xl" />

        <Container className="relative z-10">
          <div className="text-center mb-16">
            <Badge variant="warning" className="mb-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <span className="font-semibold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                Avantages
              </span>
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white block mb-2">Pourquoi choisir</span>
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Cause Pilot ?
              </span>
            </h2>
          </div>

          <Grid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="normal">
            {[
              { icon: Brain, title: 'IA Avancée', description: 'Optimisez vos campagnes avec l\'intelligence artificielle', gradient: 'from-blue-500 to-purple-500' },
              { icon: TrendingUp, title: '+35% de dons', description: 'Augmentez vos collectes grâce à nos algorithmes', gradient: 'from-green-500 to-cyan-500' },
              { icon: Zap, title: 'Installation rapide', description: 'Démarrez en moins de 5 minutes', gradient: 'from-yellow-500 to-orange-500' },
              { icon: MessageSquare, title: 'Support 24/7', description: 'Une équipe dédiée pour vous accompagner', gradient: 'from-purple-500 to-pink-500' },
              { icon: Globe, title: 'Multi-pays', description: 'Collectez dans 40+ pays', gradient: 'from-cyan-500 to-blue-500' },
              { icon: DollarSign, title: 'Frais réduits', description: 'Les tarifs les plus compétitifs', gradient: 'from-emerald-500 to-green-500' },
              { icon: Calendar, title: 'Planification', description: 'Planifiez vos campagnes à l\'avance', gradient: 'from-orange-500 to-red-500' },
              { icon: Shield, title: '100% Sécurisé', description: 'Conformité RGPD totale', gradient: 'from-indigo-500 to-violet-500' },
            ].map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} hover className="text-center p-6 group">
                  <div className={`w-14 h-14 mx-auto mb-4 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-400 transition-colors duration-300">{benefit.title}</h3>
                  <p className="text-sm text-gray-400">
                    {benefit.description}
                  </p>
                </Card>
              );
            })}
          </Grid>
        </Container>
      </section>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}