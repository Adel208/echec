# ♟️ Chess Game - Jeu d'Échecs Web

Un jeu d'échecs moderne et interactif développé avec React, TypeScript et Vite. Ce projet implémente toutes les règles standard des échecs avec une interface utilisateur élégante et responsive.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités Implémentées
- **Plateau interactif** : Clic pour sélectionner et déplacer les pièces
- **Moteur de règles complet** : Utilise chess.js pour la validation des mouvements
- **Toutes les règles d'échecs** : Échec, échec et mat, pat, roque, prise en passant, promotion
- **Interface moderne** : Design responsive avec Tailwind CSS
- **Historique des coups** : Affichage en temps réel des mouvements
- **Contrôles de jeu** : Nouvelle partie, annulation de coup
- **Indicateurs visuels** : Cases légales, échec, dernier coup
- **Accessibilité** : Navigation clavier, labels ARIA

### 🔄 Fonctionnalités en Développement
- **Drag & Drop** : Déplacement des pièces par glisser-déposer
- **IA Stockfish** : Moteur d'IA avec plusieurs niveaux de difficulté
- **Horloge de jeu** : Modes blitz, rapide, classique
- **Sauvegarde** : localStorage et export/import PGN
- **Mode en ligne** : Parties multijoueurs
- **Tests unitaires** : Suite de tests complète

## 🛠️ Technologies Utilisées

- **Frontend** : React 18 + TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS
- **Chess Logic** : chess.js
- **Icons** : Lucide React
- **Future** : Stockfish.wasm, React DnD

## 📦 Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd Echec
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur de développement**
```bash
npm run dev
```

4. **Ouvrir dans le navigateur**
```
http://localhost:5173
```

## 🎮 Comment Jouer

1. **Démarrer une partie** : Cliquez sur "New Game"
2. **Sélectionner une pièce** : Cliquez sur une pièce de votre couleur
3. **Voir les coups légaux** : Les cases disponibles sont surlignées
4. **Effectuer un mouvement** : Cliquez sur une case légale
5. **Annuler un coup** : Utilisez le bouton "Undo Move"

### Contrôles Clavier
- **Tab** : Navigation entre les cases
- **Entrée/Espace** : Sélectionner une pièce ou case
- **Échap** : Désélectionner

## 🏗️ Architecture du Projet

```
src/
├── components/           # Composants React
│   ├── SimpleChessGame.tsx    # Composant principal
│   ├── SimpleChessBoard.tsx   # Plateau de jeu
│   ├── ChessSquare.tsx        # Case du plateau
│   ├── ChessPiece.tsx         # Pièce d'échecs (SVG)
│   └── [autres composants]
├── hooks/               # Hooks personnalisés
│   ├── useSimpleChess.ts      # Logique de jeu simplifiée
│   └── useChessGame.ts        # Logique complète (en dev)
├── types/               # Types TypeScript
│   └── chess.ts
└── styles/
    └── index.css        # Styles globaux + Tailwind
```

## 🧪 Tests

```bash
# Lancer les tests (à venir)
npm run test

# Tests avec couverture
npm run test:coverage
```

## 📋 Scripts Disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production
- `npm run preview` - Aperçu du build
- `npm run lint` - Vérification ESLint
- `npm run test` - Tests unitaires (à venir)

## 🎯 Roadmap

### Phase 1 : Base ✅
- [x] Plateau et pièces fonctionnels
- [x] Règles d'échecs complètes
- [x] Interface utilisateur de base

### Phase 2 : Améliorations 🔄
- [ ] Drag & Drop
- [ ] IA Stockfish intégrée
- [ ] Horloge et modes de temps
- [ ] Sauvegarde et PGN

### Phase 3 : Avancé 📋
- [ ] Mode multijoueur en ligne
- [ ] Analyse de parties
- [ ] Thèmes personnalisables
- [ ] Statistiques de jeu

## 🐛 Problèmes Connus

- Le drag & drop n'est pas encore implémenté
- L'IA n'est pas disponible dans cette version
- Pas de sauvegarde automatique pour le moment

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [chess.js](https://github.com/jhlywa/chess.js) pour la logique d'échecs
- [Tailwind CSS](https://tailwindcss.com/) pour le styling
- [Lucide](https://lucide.dev/) pour les icônes
- [Vite](https://vitejs.dev/) pour l'outil de build

---

**Développé avec ❤️ pour les amateurs d'échecs**
