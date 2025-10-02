# 🚀 Guide de Déploiement - Jeu d'Échecs Web

## 📋 Prérequis

- Node.js 18+ installé
- npm ou yarn
- Compte sur une plateforme de déploiement (Netlify, Vercel, etc.)

## 🛠️ Préparation du Build

### 1. Installation des dépendances
```bash
cd /Users/admin/Desktop/Echec
npm install
```

### 2. Tests (optionnel mais recommandé)
```bash
npm run test
```

### 3. Build de production
```bash
npm run build
```

### 4. Aperçu local
```bash
npm run preview
```

## 🌐 Options de Déploiement

### Option 1 : Netlify (Recommandé)

1. **Via l'interface web Netlify :**
   - Aller sur [netlify.com](https://netlify.com)
   - Drag & drop le dossier `dist/` après le build
   - Ou connecter le repository GitHub

2. **Via Netlify CLI :**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

### Option 2 : Vercel

1. **Via l'interface web Vercel :**
   - Aller sur [vercel.com](https://vercel.com)
   - Importer le projet depuis GitHub
   - Configuration automatique détectée

2. **Via Vercel CLI :**
```bash
npm install -g vercel
vercel --prod
```

### Option 3 : GitHub Pages

1. **Configuration dans package.json :**
```json
{
  "homepage": "https://username.github.io/echec",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

2. **Installation et déploiement :**
```bash
npm install --save-dev gh-pages
npm run deploy
```

## ⚙️ Configuration de Production

### Variables d'environnement (si nécessaire)
Créer un fichier `.env.production` :
```
VITE_APP_NAME=Professional Chess Game
VITE_APP_VERSION=1.0.0
```

### Optimisations Vite
Le fichier `vite.config.ts` est déjà optimisé pour la production :
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
  }
})
```

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev          # Serveur de développement

# Production
npm run build        # Build de production
npm run preview      # Aperçu du build

# Tests
npm run test         # Tests unitaires
npm run test:ui      # Interface de tests
npm run test:coverage # Couverture de tests

# Qualité
npm run lint         # Vérification ESLint
```

## 📁 Structure du Build

Après `npm run build`, le dossier `dist/` contient :
```
dist/
├── index.html           # Point d'entrée
├── assets/
│   ├── index-[hash].js  # JavaScript minifié
│   └── index-[hash].css # CSS minifié
└── vite.svg            # Assets statiques
```

## 🌍 Configuration DNS (Domaine personnalisé)

### Pour Netlify :
1. Aller dans Site Settings > Domain Management
2. Ajouter un domaine personnalisé
3. Configurer les DNS selon les instructions

### Pour Vercel :
1. Aller dans Project Settings > Domains
2. Ajouter le domaine
3. Configurer les enregistrements DNS

## 🔒 HTTPS et Sécurité

- ✅ HTTPS automatique sur Netlify/Vercel
- ✅ Headers de sécurité configurés
- ✅ Minification et compression automatiques
- ✅ Cache optimisé pour les assets

## 📊 Monitoring et Analytics

### Google Analytics (optionnel)
Ajouter dans `index.html` :
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🚀 Déploiement Automatique

### GitHub Actions (exemple)
Créer `.github/workflows/deploy.yml` :
```yaml
name: Deploy to Netlify
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: netlify/actions/deploy@master
        with:
          publish-dir: './dist'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🐛 Dépannage

### Problèmes courants :

1. **Build échoue :**
   - Vérifier les erreurs TypeScript : `npm run build`
   - Corriger les warnings ESLint : `npm run lint`

2. **Assets non trouvés :**
   - Vérifier le chemin de base dans `vite.config.ts`
   - S'assurer que tous les imports sont corrects

3. **Performance :**
   - Activer la compression gzip sur le serveur
   - Utiliser un CDN pour les assets statiques

## ✅ Checklist de Déploiement

- [ ] Tests passent : `npm run test`
- [ ] Build réussit : `npm run build`
- [ ] Aperçu fonctionne : `npm run preview`
- [ ] Pas d'erreurs console
- [ ] Responsive testé sur mobile
- [ ] Fonctionnalités principales testées
- [ ] Performance acceptable (< 3s de chargement)
- [ ] HTTPS activé
- [ ] Domaine configuré (si applicable)

## 🎉 Post-Déploiement

1. **Tester le site en production**
2. **Partager l'URL avec les utilisateurs**
3. **Monitorer les performances**
4. **Collecter les retours utilisateurs**

---

## 🌟 Félicitations !

Votre jeu d'échecs web professionnel est maintenant déployé et accessible au monde entier ! 🎮♟️

**URL de démonstration :** `https://votre-site.netlify.app`
