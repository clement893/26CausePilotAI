import ButtonLink from '../ui/ButtonLink';
import { Heart, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export default function CTA() {
  return (
    <section
      className="relative py-32 overflow-hidden bg-[#0A0A0F]"
      aria-labelledby="cta-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Card with glassmorphism */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            
            <div className="relative bg-[#13131A]/90 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-gray-800/50 text-center">
              {/* Badge */}
              <div className="inline-flex mb-8">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Rejoignez 5,000+ organisations
                  </span>
                </span>
              </div>

              <h2 id="cta-heading" className="text-5xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight">
                <span className="text-white block mb-2">Prêt à transformer</span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  votre collecte de fonds ?
                </span>
              </h2>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Maximisez votre impact et augmentez vos dons de{' '}
                <span className="font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">35% en moyenne</span>{' '}
                grâce à l'IA.
              </p>
              
              <div
                className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
                role="group"
                aria-label="Actions d'appel à l'action"
              >
                <ButtonLink
                  href="/auth/register"
                  size="lg"
                  variant="primary"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-10 py-6 shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 font-bold"
                  aria-label="Démarrer gratuitement"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Démarrer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </ButtonLink>
                
                <ButtonLink
                  href="/dashboard"
                  size="lg"
                  variant="outline"
                  className="border-2 border-gray-700 hover:border-blue-500 text-white hover:bg-blue-500/10 text-lg px-10 py-6 backdrop-blur-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Voir une démo de la plateforme"
                >
                  Voir une démo
                </ButtonLink>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-8 text-gray-300">
                <div className="flex items-center gap-2 group/item">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center group-hover/item:bg-green-500/30 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Sans carte bancaire</span>
                </div>
                <div className="flex items-center gap-2 group/item">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center group-hover/item:bg-green-500/30 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Essai gratuit 14 jours</span>
                </div>
                <div className="flex items-center gap-2 group/item">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center group-hover/item:bg-green-500/30 transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  </div>
                  <span>Annulation à tout moment</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
