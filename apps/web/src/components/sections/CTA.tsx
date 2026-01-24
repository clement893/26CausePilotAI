import ButtonLink from '../ui/ButtonLink';
export default function CTA() {
  return (
    <section
      className="py-20 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-muted dark:to-muted"
      aria-labelledby="cta-heading"
    >
      {' '}
      <div className="container mx-auto px-4">
        {' '}
        <div className="max-w-4xl mx-auto text-center">
          {' '}
          <h2 id="cta-heading" className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            {' '}
            Prêt à transformer votre collecte de fonds ?{' '}
          </h2>{' '}
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {' '}
            Rejoignez plus de 5000 organisations qui utilisent Cause Pilot pour maximiser leur impact 
            et augmenter leurs dons de 35% en moyenne.{' '}
          </p>{' '}
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            role="group"
            aria-label="Actions d'appel à l'action"
          >
            {' '}
            <ButtonLink
              href="/auth/register"
              size="lg"
              variant="primary"
              aria-label="Démarrer gratuitement"
            >
              {' '}
              Démarrer gratuitement{' '}
            </ButtonLink>{' '}
            <ButtonLink
              href="/dashboard"
              size="lg"
              variant="secondary"
              aria-label="Voir une démo de la plateforme"
            >
              {' '}
              Voir une démo{' '}
            </ButtonLink>{' '}
            <ButtonLink
              href="/pricing"
              size="lg"
              variant="outline"
              aria-label="Découvrir nos tarifs"
            >
              {' '}
              Découvrir nos tarifs{' '}
            </ButtonLink>{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
