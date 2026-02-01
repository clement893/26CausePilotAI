'use client';

import { Suspense } from 'react';
import { Card, Alert, Badge, Container, Loading } from '@/components/ui';

function GoogleOAuthDiagnosticContent() {
  // Get NEXTAUTH_URL from environment (client-side accessible)
  const nextAuthUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  // NextAuth generates the callback URL automatically
  const expectedRedirectUri = `${nextAuthUrl}/api/auth/callback/google`;
  
  // Check if we're in production (HTTPS)
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

      {/* Current Configuration */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuration actuelle</h2>
        <div className="space-y-4">
          <div>
            <span className="text-gray-400 text-sm">URL de base détectée :</span>
            <div className="mt-1 p-3 bg-[#1C1C26] rounded">
              <code className="text-sm text-white break-all">{nextAuthUrl}</code>
            </div>
          </div>
          
          <div>
            <span className="text-gray-400 text-sm">URI de redirection attendu par NextAuth :</span>
            <div className="mt-1 p-3 bg-[#1C1C26] rounded">
              <code className="text-sm text-white break-all font-mono">{expectedRedirectUri}</code>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              ⚠️ Cette URI doit être ajoutée EXACTEMENT dans Google Cloud Console
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
              <code className="text-sm text-white break-all font-mono">{expectedRedirectUri}</code>
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
              {expectedRedirectUri}/
            </code>
            <p className="text-xs text-gray-400 mt-1">❌ Slash supplémentaire à la fin</p>
          </div>
          
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
            <code className="text-xs text-red-400 break-all">
              {expectedRedirectUri.replace('/api/auth/callback/google', '/api/auth/callback/Google')}
            </code>
            <p className="text-xs text-gray-400 mt-1">❌ Mauvaise casse (Google au lieu de google)</p>
          </div>

          {isProduction && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded">
              <code className="text-xs text-red-400 break-all">
                {expectedRedirectUri.replace('https://', 'http://')}
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
              NEXTAUTH_URL={nextAuthUrl}
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
