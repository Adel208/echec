# 👨‍💻 Guide du Développeur - Jeu d'Échecs Web

## 🏗️ Architecture du Projet

### 📁 Structure des Dossiers
```
src/
├── components/          # Composants React
│   ├── FinalChessGame.tsx      # 🎮 Jeu principal (UTILISER CELUI-CI)
│   ├── SimpleChessBoard.tsx    # 🏁 Plateau d'échecs
│   ├── ChessSquare.tsx         # ⬜ Case individuelle
│   ├── ChessPiece.tsx          # ♟️ Pièce avec SVG
│   ├── PromotionModal.tsx      # 👑 Modal de promotion
│   ├── GameNotifications.tsx   # 🔔 Système de notifications
│   └── [versions alternatives] # 📚 Autres versions (référence)
├── hooks/               # 🎣 Hooks personnalisés
│   ├── useAdvancedChess.ts     # ♟️ Logique de jeu complète
│   ├── useSimpleAI.ts          # 🤖 Intelligence artificielle
│   ├── useGameStorage.ts       # 💾 Sauvegarde localStorage
│   └── [hooks alternatifs]     # 📚 Autres versions
├── types/               # 📝 Types TypeScript
│   └── chess.ts                # 🎯 Interfaces du jeu
└── tests/               # 🧪 Tests unitaires
    ├── chess.test.ts           # ✅ Tests des règles
    └── setup.ts                # ⚙️ Configuration tests
```

## 🎯 Composants Principaux

### 🎮 FinalChessGame.tsx
**Composant principal à utiliser** - Contient toutes les fonctionnalités :
- Jeu complet avec IA
- Sauvegarde automatique
- Notifications
- Interface complète

### 🏁 SimpleChessBoard.tsx
**Plateau d'échecs réutilisable** :
```typescript
interface SimpleChessBoardProps {
  chess: Chess;                    // Instance chess.js
  selectedSquare: Square | null;   // Case sélectionnée
  onSquareClick: (square: Square) => void;  // Gestionnaire de clic
  getLegalMoves: (square: Square) => Square[];  // Coups légaux
}
```

### 🎣 useAdvancedChess.ts
**Hook principal pour la logique du jeu** :
```typescript
const {
  chess,              // Instance Chess.js
  selectedSquare,     // Case sélectionnée
  gameStatus,         // État du jeu
  moveHistory,        // Historique des coups
  promotionState,     // État de promotion
  selectSquare,       // Sélectionner une case
  getLegalMoves,      // Obtenir coups légaux
  newGame,           // Nouvelle partie
  undoMove,          // Annuler coup
  handlePromotion,   // Gérer promotion
  exportPGN,         // Exporter PGN
  importPGN,         // Importer PGN
} = useAdvancedChess();
```

## 🤖 Système d'IA

### 🧠 Niveaux de Difficulté
```typescript
type AILevel = 1 | 2 | 3 | 4 | 5;

// Niveau 1: Coups aléatoires
// Niveau 2-3: IA intelligente (priorité échec/captures)
// Niveau 4-5: Algorithme minimax (2-3 niveaux)
```

### 🎯 Algorithme Minimax
```typescript
const minimax = (chess: Chess, depth: number, isMaximizing: boolean): number => {
  // Évaluation de position avec système de points
  // Recherche récursive des meilleurs coups
  // Optimisation alpha-beta possible (future amélioration)
}
```

## 💾 Système de Sauvegarde

### 🔄 Sauvegarde Automatique
```typescript
// Sauvegarde après chaque coup si activée
useEffect(() => {
  if (autoSave && moveHistory.length > 0) {
    saveGame(chess, moveHistory, gameMode, aiLevel);
  }
}, [moveHistory.length]);
```

### 📁 Format de Sauvegarde
```typescript
interface GameData {
  fen: string;           // Position FEN
  moveHistory: string[]; // Historique des coups
  gameMode: 'pvp' | 'ai'; // Mode de jeu
  aiLevel: number;       // Niveau IA
  timestamp: number;     // Horodatage
}
```

## 🧪 Tests Unitaires

### 📋 Tests Implémentés
```typescript
describe('Chess Game Logic', () => {
  // ✅ Mouvements de base
  // ✅ Règles spéciales (roque, en passant, promotion)
  // ✅ États de jeu (échec, mat, pat)
  // ✅ Validation des coups
  // ✅ Import/Export PGN
  // ✅ Annulation de coups
});
```

### 🚀 Lancer les Tests
```bash
npm run test           # Tests en mode watch
npm run test:coverage  # Avec couverture de code
npm run test:ui        # Interface graphique
```

## 🎨 Personnalisation du Design

### 🎨 Variables CSS Personnalisées
```css
:root {
  --chess-light: #f0d9b5;    /* Cases claires */
  --chess-dark: #b58863;     /* Cases sombres */
  --chess-highlight: #ffff00; /* Surbrillance */
  --chess-check: #ff6b6b;    /* Échec */
  --chess-lastmove: #9bc53d; /* Dernier coup */
}
```

### 🎭 Classes Tailwind Utilisées
```css
/* Composants principaux */
.bg-white/10.backdrop-blur-sm  /* Panneaux translucides */
.bg-gradient-to-br             /* Arrière-plans dégradés */
.hover:scale-110               /* Animations hover */
.transition-all.duration-300   /* Transitions fluides */
```

## 🔧 Ajout de Nouvelles Fonctionnalités

### 1. 🕐 Ajouter une Horloge
```typescript
// Dans useAdvancedChess.ts
const [timer, setTimer] = useState({
  white: 600000, // 10 minutes en ms
  black: 600000,
  isRunning: false,
  activePlayer: 'w'
});

// Décrémenter le timer
useEffect(() => {
  if (timer.isRunning) {
    const interval = setInterval(() => {
      setTimer(prev => ({
        ...prev,
        [prev.activePlayer]: prev[prev.activePlayer] - 1000
      }));
    }, 1000);
    return () => clearInterval(interval);
  }
}, [timer.isRunning]);
```

### 2. 🎯 Intégrer Stockfish WebAssembly
```typescript
// Créer stockfish-worker.ts
const stockfish = new Worker('/stockfish.wasm.js');

stockfish.postMessage('uci');
stockfish.postMessage(`position fen ${chess.fen()}`);
stockfish.postMessage('go depth 15');

stockfish.onmessage = (event) => {
  if (event.data.includes('bestmove')) {
    const move = event.data.split(' ')[1];
    // Jouer le coup
  }
};
```

### 3. 🌐 Mode Multijoueur
```typescript
// Utiliser WebSocket ou Socket.io
const socket = io('ws://localhost:3001');

socket.on('move', (moveData) => {
  chess.move(moveData);
  // Mettre à jour l'interface
});

const sendMove = (move) => {
  socket.emit('move', move);
};
```

## 🐛 Débogage et Dépannage

### 🔍 Outils de Débogage
```typescript
// Activer les logs de développement
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('Chess position:', chess.fen());
  console.log('Legal moves:', chess.moves());
  console.log('Game state:', gameState);
}
```

### ⚠️ Erreurs Communes
1. **Types chess.js** : Utiliser `import type` pour les types
2. **État asynchrone** : Attention aux mises à jour d'état React
3. **Validation des coups** : Toujours valider avant chess.move()
4. **Mémoire** : Nettoyer les timers et listeners

## 📈 Optimisations Performance

### ⚡ Optimisations React
```typescript
// Mémorisation des composants coûteux
const MemoizedChessBoard = React.memo(SimpleChessBoard);

// Callbacks optimisés
const handleMove = useCallback((from, to) => {
  // Logique de mouvement
}, [chess]);

// Éviter les re-renders inutiles
const pieceProps = useMemo(() => ({
  piece, square, onMove
}), [piece, square]);
```

### 🚀 Optimisations Build
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          chess: ['chess.js'],
        }
      }
    }
  }
});
```

## 🔮 Roadmap Futur

### 🎯 Fonctionnalités Prioritaires
1. **Drag & Drop** - react-dnd déjà configuré
2. **Stockfish WebAssembly** - IA professionnelle
3. **Horloge de jeu** - Modes de temps standard
4. **Mode en ligne** - WebSocket + matchmaking

### 🌟 Améliorations Possibles
- Analyse de parties avec flèches
- Thèmes de plateau personnalisables
- Sons et effets audio
- Replay automatique des parties
- Statistiques avancées
- Mode puzzle/entraînement

---

## 🎉 Contribution

Pour contribuer au projet :
1. Fork le repository
2. Créer une branche feature
3. Ajouter des tests pour les nouvelles fonctionnalités
4. Respecter la structure existante
5. Documenter les changements

**Le code est prêt pour l'extension et la maintenance !** 🚀
