import ButtonLink from '../ui/ButtonLink';
import { Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function CTA() {
  return (
    <section
      className="relative py-32 overflow-hidden bg-gradient-to-br from-[#1a4d2e] via-[#2d5016] to-[#153d23] dark:from-[#0f2e1a] dark:via-[#1a4d2e] dark:to-[#0a1f12]"
      aria-labelledby="cta-heading"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h2 id="cta-heading" className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-tight">
            Prêt à transformer
            <br />
            votre collecte de fonds ?
          </h2>
          
          <p className="text-xl md:text-2xl text-emerald-50 mb-12 max-w-3xl mx-auto leading-relaxed">
            Rejoignez plus de <span className="font-bold text-[#cc5500]">5000 organisations</span> qui utilisent Cause Pilot 
            pour maximiser leur impact et augmenter leurs dons de <span className="font-bold text-[#cc5500]">35% en moyenne</span>.
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
              className="bg-[#cc5500] text-white hover:bg-[#b34a00] text-lg px-10 py-7 shadow-2xl hover:shadow-3xl transition-all font-bold"
              aria-label="Démarrer gratuitement"
            >
              <Heart className="w-5 h-5 mr-2" />
              Démarrer gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </ButtonLink>
            
            <ButtonLink
              href="/dashboard"
              size="lg"
              variant="outline"
              className="border-2 border-[#cc5500] text-[#cc5500] hover:bg-[#cc5500]/10 text-lg px-10 py-7 backdrop-blur-sm font-semibold"
              aria-label="Voir une démo de la plateforme"
            >
              Voir une démo
            </ButtonLink>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#cc5500]" />
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#cc5500]" />
              <span>Essai gratuit 14 jours</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#cc5500]" />
              <span>Annulation à tout moment</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
