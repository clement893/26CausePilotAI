# 🔧 Guide de correction : Erreur Google OAuth redirect_uri_mismatch

## Correction rapide (production)

1. **Dans votre hébergeur (Railway, Vercel, etc.)** : ajoutez la variable d'environnement  
   `NEXTAUTH_URL` = l’URL publique de votre app **sans slash final**  
   (ex. `https://votre-app.railway.app` ou `https://votre-domaine.com`).

2. **Dans Google Cloud Console** :  
   [Credentials](https://console.cloud.google.com/apis/credentials) → votre **OAuth 2.0 Client ID** → **Authorized redirect URIs** → ajoutez **exactement** :  
   `https://votre-app.railway.app/api/auth/callback/google`  
   (remplacez par votre vraie URL + `/api/auth/callback/google`).

3. **Vérifier l’URI côté serveur** : ouvrez dans le navigateur  
   `https://votre-app.railway.app/api/auth/redirect-uri`  
   et copiez la valeur `redirect_uri` dans Google Console.  
   Vous pouvez aussi utiliser la page **Diagnostic Google OAuth** : `/auth/google/diagnostic`.

4. Sauvegardez dans Google Console, attendez 2–5 minutes, puis réessayez la connexion avec Google.

---

## Problème

Vous rencontrez l'erreur :
```
Erreur 400 : redirect_uri_mismatch
Accès bloqué : la demande de cette appli n'est pas valide
```

Cette erreur signifie que l'URI de redirection configuré dans Google Cloud Console ne correspond pas exactement à celui utilisé par NextAuth.

## Solution

### 1. Déterminer votre URL de redirection

NextAuth génère automatiquement l'URI de redirection au format :
```
{NEXTAUTH_URL}/api/auth/callback/google
```

**Exemples :**
- En développement : `http://localhost:3000/api/auth/callback/google`
- En production : `https://votre-domaine.com/api/auth/callback/google`

### 2. Vérifier votre variable d'environnement NEXTAUTH_URL

Assurez-vous que `NEXTAUTH_URL` est correctement configurée dans vos variables d'environnement :

**Fichier `.env.local` ou variables d'environnement de production :**
```env
NEXTAUTH_URL=https://votre-domaine.com
# OU pour le développement local :
NEXTAUTH_URL=http://localhost:3000
```

⚠️ **Important :**
- Ne mettez **PAS** de slash (`/`) à la fin de `NEXTAUTH_URL`
- Utilisez `https://` en production (pas `http://`)
- L'URL doit correspondre exactement à votre domaine de production

### 3. Configurer Google Cloud Console

1. **Accédez à Google Cloud Console**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com/)
   - Sélectionnez votre projet

2. **Ouvrez les identifiants OAuth**
   - Menu latéral → **APIs & Services** → **Credentials**
   - Cliquez sur votre **OAuth 2.0 Client ID**

3. **Ajoutez les URI de redirection autorisés**
   
   Dans la section **"Authorized redirect URIs"**, ajoutez **exactement** :
   
   ```
   https://votre-domaine.com/api/auth/callback/google
   ```
   
   ⚠️ **Points importants :**
   - L'URI doit correspondre **exactement** (pas d'espace, pas de slash supplémentaire)
   - Utilisez `https://` en production
   - Ajoutez aussi l'URI de développement si vous testez localement :
     ```
     http://localhost:3000/api/auth/callback/google
     ```

4. **Sauvegardez les modifications**
   - Cliquez sur **Save**
   - ⏱️ Les modifications peuvent prendre quelques minutes à se propager

### 4. Vérifier la configuration

**Format correct :**
```
✅ https://votre-domaine.com/api/auth/callback/google
✅ http://localhost:3000/api/auth/callback/google
```

**Formats incorrects (ne fonctionneront PAS) :**
```
❌ https://votre-domaine.com/api/auth/callback/google/
❌ https://votre-domaine.com/api/auth/callback/Google
❌ https://votre-domaine.com/api/auth/callback/google?param=value
❌ http://votre-domaine.com/api/auth/callback/google (en production)
```

### 5. Redémarrer l'application

Après avoir modifié les variables d'environnement ou la configuration Google :
1. Redémarrez votre application Next.js
2. Videz le cache du navigateur si nécessaire
3. Réessayez la connexion Google

## Vérification rapide

Pour vérifier que tout est correctement configuré :

1. **Vérifiez NEXTAUTH_URL** :
   ```bash
   # Dans votre terminal
   echo $NEXTAUTH_URL
   # OU dans votre fichier .env.local
   cat .env.local | grep NEXTAUTH_URL
   ```

2. **Vérifiez dans Google Cloud Console** :
   - Les URI de redirection doivent correspondre exactement
   - Vérifiez qu'il n'y a pas d'espaces ou de caractères supplémentaires

3. **Testez la connexion** :
   - Allez sur `/auth/login`
   - Cliquez sur "Se connecter avec Google"
   - Vous devriez être redirigé vers Google sans erreur

## Cas spécifiques

### Application déployée sur Railway/Vercel

Si votre application est déployée :

1. **Vérifiez l'URL de production** :
   - Railway : `https://votre-app.railway.app`
   - Vercel : `https://votre-app.vercel.app`
   - Ou votre domaine personnalisé

2. **Configurez NEXTAUTH_URL** dans les variables d'environnement de votre plateforme :
   ```
   NEXTAUTH_URL=https://votre-app.railway.app
   ```

3. **Ajoutez l'URI dans Google Cloud Console** :
   ```
   https://votre-app.railway.app/api/auth/callback/google
   ```

### Application avec domaine personnalisé

Si vous utilisez un domaine personnalisé :

1. **NEXTAUTH_URL** doit être votre domaine complet :
   ```
   NEXTAUTH_URL=https://www.votre-domaine.com
   ```

2. **URI de redirection dans Google Cloud Console** :
   ```
   https://www.votre-domaine.com/api/auth/callback/google
   ```

## Dépannage supplémentaire

### Si l'erreur persiste

1. **Vérifiez les logs** :
   - Regardez les logs de votre application pour voir l'URI exact utilisé
   - Vérifiez les logs Google Cloud Console pour voir l'URI reçu

2. **Vérifiez le cache** :
   - Les modifications dans Google Cloud Console peuvent prendre jusqu'à 5 minutes
   - Attendez quelques minutes et réessayez

3. **Vérifiez les variables d'environnement** :
   - Assurez-vous que `NEXTAUTH_URL` est bien définie
   - Redémarrez l'application après modification

4. **Testez avec curl** :
   ```bash
   # Vérifiez que votre endpoint NextAuth répond
   curl https://votre-domaine.com/api/auth/providers
   ```

## Support

Si le problème persiste après avoir suivi ces étapes :

1. Vérifiez les logs de votre application
2. Vérifiez les logs Google Cloud Console
3. Contactez le support avec :
   - L'URL exacte de votre application
   - L'URI de redirection configuré dans Google Cloud Console
   - Les logs d'erreur complets
