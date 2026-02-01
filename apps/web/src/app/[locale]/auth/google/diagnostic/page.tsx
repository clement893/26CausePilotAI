'use client';

import { Suspense, useEffect, useState } from 'react';
import { Card, Alert, Badge, Container, Loading } from '@/components/ui';

interface RedirectUriResponse {
  redirect_uri: string;
  base_url: string;
  message: string;
}

function GoogleOAuthDiagnosticContent() {
  // Client-side fallback for display when API not yet loaded
  const clientFallback =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const clientRedirectUri = `${clientFallback}/api/auth/callback/google`;

  const [serverRedirect, setServerRedirect] = useState<RedirectUriResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/redirect-uri')
      .then((res) => res.json())
      .then((data: RedirectUriResponse) => {
        setServerRedirect(data);
        setError(null);
      })
      .catch(() => setError('Impossible de récupérer l’URI côté serveur'))
      .finally(() => setLoading(false));
  }, []);

  const redirectUri = serverRedirect?.redirect_uri ?? clientRedirectUri;
  const baseUrl = serverRedirect?.base_url ?? clientFallback;

  const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  return (
    <Container className="py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">🔍 Diagnostic Google OAuth</h1>
        <p className="text-gray-400">
          Vérifiez votre configuration Google OAuth pour résoudre l'erreur redirect_uri_mismatch
        </p>
      </div>

      {/* Redirect URI used by the server - this is what Google must have */}
      <Card className="mb-6 border-2 border-amber-500/50">
        <h2 className="text-xl font-semibold mb-2">✅ URI à ajouter dans Google Cloud Console</h2>
        <p className="text-sm text-gray-400 mb-4">
          C’est l’URI que NextAuth envoie à Google. Elle doit être ajoutée <strong>à l’identique</strong> dans les « Authorized redirect URIs ».
        </p>
        {loading ? (
          <Loading />
        ) : error ? (
          <Alert variant="warning">
            {error}. Utilisez l’URI ci-dessous et assurez-vous que <code>NEXTAUTH_URL</code> est défini côté serveur (ex. variable d’environnement sur Railway/Vercel).
          </Alert>
        ) : null}
        <div className="mt-2 p-4 bg-[#1C1C26] rounded border border-amber-500/30">
          <code className="text-sm text-amber-200 break-all font-mono select-all" title="Cliquez pour sélectionner">
            {redirectUri}
          </code>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Base URL utilisée côté serveur : <code className="text-gray-400">{baseUrl}</code>
        </p>
      </Card>

      {/* Current Configuration */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration</h2>
        <div className="space-y-4">
          <div>
            <span className="text-gray-400 text-sm">En production, définir :</span>
            <div className="mt-1 p-3 bg-[#1C1C26] rounded">
              <code className="text-sm text-white break-all">NEXTAUTH_URL={baseUrl}</code>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Sans slash final. Ex. Railway/Vercel : ajoutez cette variable dans le dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-sm">Environnement :</span>
            <Badge variant={isProduction ? 'success' : 'warning'}>
              {isProduction ? 'Production (HTTPS)' : isLocalhost ? 'Développement (HTTP)' : 'Inconnu'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">📋 Instructions de configuration</h2>
        <div className="space-y-4 text-sm">
          <div>
            <h3 className="font-semibold text-white mb-2">1. Ouvrez Google Cloud Console</h3>
            <ol className="list-decimal list-inside ml-2 space-y-1 text-gray-300">
              <li>Allez sur <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Cloud Console</a></li>
              <li>Sélectionnez votre projet</li>
              <li>Menu latéral → <strong>APIs & Services</strong> → <strong>Credentials</strong></li>
              <li>Cliquez sur votre <strong>OAuth 2.0 Client ID</strong></li>
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">2. Ajoutez l'URI de redirection</h3>
            <p className="text-gray-300 mb-2">
              Dans la section <strong>"Authorized redirect URIs"</strong>, ajoutez :
            </p>
            <div className="p-3 bg-[#1C1C26] rounded border border-blue-500/30">
              <code className="text-sm text-white break-all font-mono">{redirectUri}</code>
            </div>
            <Alert variant="warning" className="mt-3">
              <strong>Important :</strong> L'URI doit correspondre EXACTEMENT (pas d'espace, pas de slash supplémentaire)
            </Alert>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-2">3. Sauvegardez et attendez</h3>
            <ul className="list-disc list-inside ml-2 space-y-1 text-gray-300">
              <li>Cliquez sur <strong>Save</strong></li>
              <li>Attendez 2-5 minutes pour que les modifications se propagent</li>
              <li>Redémarrez votre application si nécessaire</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Common Mistakes */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">❌ Erreurs courantes</h2>
        <div className="space-y-3 text-sm">
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
            <code className="text-xs text-red-400 break-all">
              {redirectUri}/
            </code>
            <p className="text-xs text-gray-400 mt-1">❌ Slash supplémentaire à la fin</p>
          </div>
          
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
            <code className="text-xs text-red-400 break-all">
              {redirectUri.replace('/api/auth/callback/google', '/api/auth/callback/Google')}
            </code>
            <p className="text-xs text-gray-400 mt-1">❌ Mauvaise casse (Google au lieu de google)</p>
          </div>

          {isProduction && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
              <code className="text-xs text-red-400 break-all">
                {redirectUri.replace('https://', 'http://')}
              </code>
              <p className="text-xs text-gray-400 mt-1">❌ HTTP au lieu de HTTPS en production</p>
            </div>
          )}
        </div>
      </Card>

      {/* Environment Variables Check */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">🔧 Vérification des variables d'environnement</h2>
        <Alert variant="info" className="mb-4">
          Assurez-vous que <code className="text-xs">NEXTAUTH_URL</code> est correctement configurée.
          Elle doit correspondre à votre domaine sans slash à la fin.
        </Alert>
        
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-400">Variable attendue :</span>
            <code className="ml-2 text-xs bg-[#1C1C26] px-2 py-1 rounded">
              NEXTAUTH_URL={baseUrl}
            </code>
          </div>
          
          <div className="mt-4">
            <span className="text-gray-400">Exemples corrects :</span>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-gray-300">
              <li><code className="text-xs">NEXTAUTH_URL=https://votre-domaine.com</code></li>
              <li><code className="text-xs">NEXTAUTH_URL=http://localhost:3000</code> (dev)</li>
            </ul>
          </div>

          <div className="mt-4">
            <span className="text-gray-400">Exemples incorrects :</span>
            <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-gray-300">
              <li><code className="text-xs">NEXTAUTH_URL=https://votre-domaine.com/</code> ❌ (slash à la fin)</li>
              <li><code className="text-xs">NEXTAUTH_URL=http://votre-domaine.com</code> ❌ (HTTP en production)</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Help Link */}
      <div className="mt-6 text-center">
        <Alert variant="info">
          Pour plus de détails, consultez le{' '}
          <a 
            href="/docs/google-oauth-fix" 
            className="text-blue-400 hover:underline font-semibold"
          >
            guide complet de résolution
          </a>
        </Alert>
      </div>
    </Container>
  );
}

export default function GoogleOAuthDiagnosticPage() {
  return (
    <Suspense
      fallback={
        <Container className="py-8">
          <div className="text-center">
            <Loading />
          </div>
        </Container>
      }
    >
      <GoogleOAuthDiagnosticContent />
    </Suspense>
  );
}
