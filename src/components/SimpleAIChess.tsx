import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

export const SimpleAIChess: React.FC = () => {
  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<'pvp' | 'ai'>('ai'); // Commencer directement en mode IA
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // IA simple qui fait des coups aléatoires
  const makeRandomAIMove = () => {
    const moves = chess.moves({ verbose: true });
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      chess.move(randomMove);
      setForceUpdate(prev => prev + 1);
    }
  };

  // IA automatique
  useEffect(() => {
    if (gameMode === 'ai' && chess.turn() === 'b' && !chess.isGameOver() && !isAIThinking) {
      setIsAIThinking(true);
      
      const timeout = setTimeout(() => {
        makeRandomAIMove();
        setIsAIThinking(false);
      }, 1000); // 1 seconde de réflexion

      return () => clearTimeout(timeout);
    }
  }, [forceUpdate, gameMode, isAIThinking]); // Dépendances simples

  // Générer les cases du plateau
  const squares: string[] = [];
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      squares.push(`${String.fromCharCode(97 + file)}${rank}`);
    }
  }

  // Symboles des pièces
  const getPieceSymbol = (piece: any): string => {
    if (!piece) return '';
    const symbols = {
      w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
      b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
    };
    return symbols[piece.color][piece.type] || '';
  };

  // Gérer les clics sur les cases
  const handleSquareClick = (square: string) => {
    // Bloquer si c'est le tour de l'IA
    if (gameMode === 'ai' && (chess.turn() === 'b' || isAIThinking)) {
      return;
    }

    if (!selectedSquare) {
      // Sélectionner une pièce
      const piece = chess.get(square as any);
      if (piece && piece.color === chess.turn()) {
        setSelectedSquare(square);
      }
    } else if (selectedSquare === square) {
      // Désélectionner
      setSelectedSquare(null);
    } else {
      // Essayer de jouer
      try {
        const move = chess.move({ from: selectedSquare as any, to: square as any });
        if (move) {
          setSelectedSquare(null);
          setForceUpdate(prev => prev + 1); // Déclenche l'IA
        } else {
          setSelectedSquare(null);
        }
      } catch {
        setSelectedSquare(null);
      }
    }
  };

  const newGame = () => {
    chess.reset();
    setSelectedSquare(null);
    setIsAIThinking(false);
    setForceUpdate(prev => prev + 1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', background: 'linear-gradient(135deg, #1e293b, #7c3aed, #1e293b)', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Chess vs AI</h1>
        <p style={{ fontSize: '1.2rem', color: '#d1d5db' }}>
          {chess.isGameOver()
            ? `Game Over - ${chess.isCheckmate() ? (chess.turn() === 'w' ? 'Black wins!' : 'White wins!') : 'Draw'}`
            : isAIThinking
            ? '🤖 AI is thinking...'
            : `${chess.turn() === 'w' ? 'Your turn (White)' : 'AI turn (Black)'}`
          }
        </p>
      </div>

      <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {/* Plateau */}
        <div style={{ background: '#374151', padding: '20px', borderRadius: '10px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(8, 1fr)', 
            gap: '0', 
            width: '400px', 
            height: '400px', 
            border: '2px solid #4b5563', 
            borderRadius: '5px' 
          }}>
            {squares.map((square, index) => {
              const piece = chess.get(square as any);
              const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0;
              const isSelected = selectedSquare === square;

              return (
                <div
                  key={square}
                  onClick={() => handleSquareClick(square)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#3b82f6' : (isLight ? '#fef3c7' : '#d97706'),
                    border: isSelected ? '3px solid #1d4ed8' : 'none',
                    transition: 'all 0.2s',
                    opacity: (gameMode === 'ai' && (chess.turn() === 'b' || isAIThinking)) ? 0.7 : 1
                  }}
                >
                  {getPieceSymbol(piece)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contrôles */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          backdropFilter: 'blur(8px)', 
          padding: '20px', 
          borderRadius: '10px', 
          width: '250px',
          height: 'fit-content'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Controls</h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#d1d5db' }}>
              Game Mode
            </label>
            <select 
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value as 'pvp' | 'ai')}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '5px',
                backgroundColor: '#374151',
                color: 'white',
                border: '1px solid #4b5563'
              }}
            >
              <option value="pvp">Player vs Player</option>
              <option value="ai">Player vs AI</option>
            </select>
          </div>

          <button
            onClick={newGame}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            New Game
          </button>

          {/* Historique */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#d1d5db' }}>Move History</h4>
            <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '0.8rem' }}>
              {chess.history().length === 0 ? (
                <p style={{ color: '#9ca3af' }}>No moves yet</p>
              ) : (
                chess.history().map((move, index) => (
                  <div key={index} style={{ marginBottom: '2px' }}>
                    {Math.ceil((index + 1) / 2)}.{index % 2 === 0 ? '' : '..'} {move}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status */}
          {isAIThinking && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '5px',
              color: '#93c5fd',
              textAlign: 'center'
            }}>
              🤖 AI is thinking...
            </div>
          )}

          {chess.inCheck() && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '5px',
              color: '#fca5a5',
              textAlign: 'center'
            }}>
              ⚠️ Check!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
