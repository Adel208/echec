import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameUpdate, setGameUpdate] = useState(0);

  // Évaluation de position
  const evaluatePosition = (chess) => {
    let score = 0;
    
    // Valeurs des pièces
    const pieceValues = {
      'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };
    
    // Parcourir toutes les cases
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = chess.get(square);
        
        if (piece) {
          let pieceValue = pieceValues[piece.type];
          
          // Bonus de position pour les pions
          if (piece.type === 'p') {
            if (piece.color === 'w') {
              pieceValue += (7 - i) * 0.1; // Pions avancés valent plus
            } else {
              pieceValue += i * 0.1;
            }
          }
          
          // Bonus pour contrôler le centre
          if ((i >= 3 && i <= 4) && (j >= 3 && j <= 4)) {
            pieceValue += 0.3;
          }
          
          if (piece.color === 'w') {
            score += pieceValue;
          } else {
            score -= pieceValue;
          }
        }
      }
    }
    
    // Bonus/malus pour les situations spéciales
    if (chess.inCheck()) {
      score += chess.turn() === 'w' ? -0.5 : 0.5;
    }
    
    if (chess.isCheckmate()) {
      return chess.turn() === 'w' ? -1000 : 1000;
    }
    
    if (chess.isStalemate() || chess.isDraw()) {
      return 0;
    }
    
    return score;
  };

  // Algorithme Minimax avec élagage Alpha-Beta
  const minimax = (chess, depth, alpha, beta, maximizingPlayer) => {
    if (depth === 0 || chess.isGameOver()) {
      return evaluatePosition(chess);
    }
    
    const moves = chess.moves({ verbose: true });
    
    if (maximizingPlayer) {
      let maxEval = -Infinity;
      for (let move of moves) {
        chess.move(move);
        const eval = minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        maxEval = Math.max(maxEval, eval);
        alpha = Math.max(alpha, eval);
        if (beta <= alpha) break; // Élagage Alpha-Beta
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let move of moves) {
        chess.move(move);
        const eval = minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();
        minEval = Math.min(minEval, eval);
        beta = Math.min(beta, eval);
        if (beta <= alpha) break; // Élagage Alpha-Beta
      }
      return minEval;
    }
  };

  // IA intelligente avec différents niveaux
  const makeSmartAIMove = () => {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return;
    
    let bestMove = null;
    let bestScore = Infinity;
    
    // Profondeur selon le niveau (plus c'est élevé, plus c'est fort)
    const depth = 3; // Niveau assez fort
    
    for (let move of moves) {
      chess.move(move);
      
      // L'IA joue les noirs, donc elle minimise (recherche le score le plus bas)
      const score = minimax(chess, depth - 1, -Infinity, Infinity, true);
      
      chess.undo();
      
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
    // Si aucun coup n'est trouvé, prendre un coup aléatoire
    if (!bestMove) {
      bestMove = moves[Math.floor(Math.random() * moves.length)];
    }
    
    chess.move(bestMove);
    setGameUpdate(prev => prev + 1);
  };

  // IA automatique
  useEffect(() => {
    if (chess.turn() === 'b' && !chess.isGameOver() && !isAIThinking) {
      setIsAIThinking(true);
      setTimeout(() => {
        makeAIMove();
        setIsAIThinking(false);
      }, 1000);
    }
  }, [gameUpdate, isAIThinking]);

  // Créer le plateau
  const createBoard = () => {
    const board = [];
    for (let rank = 8; rank >= 1; rank--) {
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + rank;
        board.push(square);
      }
    }
    return board;
  };

  const squares = createBoard();

  // Symboles des pièces
  const pieceSymbols = {
    'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
    'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟'
  };

  const getPieceSymbol = (square) => {
    const piece = chess.get(square);
    if (!piece) return '';
    return pieceSymbols[piece.color + piece.type] || '';
  };

  // État pour le survol
  const [hoveredSquare, setHoveredSquare] = useState(null);

  // Gérer les clics
  const handleClick = (square) => {
    if (chess.turn() === 'b' || isAIThinking) return;

    if (!selectedSquare) {
      const piece = chess.get(square);
      if (piece && piece.color === 'w') {
        setSelectedSquare(square);
      }
    } else if (selectedSquare === square) {
      setSelectedSquare(null);
    } else {
      try {
        const move = chess.move({ from: selectedSquare, to: square });
        if (move) {
          setSelectedSquare(null);
          setGameUpdate(prev => prev + 1);
        } else {
          setSelectedSquare(null);
        }
      } catch (e) {
        setSelectedSquare(null);
      }
    }
  };

  const newGame = () => {
    chess.reset();
    setSelectedSquare(null);
    setIsAIThinking(false);
    setGameUpdate(prev => prev + 1);
  };

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #1e293b, #7c3aed, #1e293b)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 10px 0' }}>Chess Game</h1>
        <p style={{ fontSize: '1.2rem', margin: '0', color: '#d1d5db' }}>
          {chess.isGameOver() 
            ? (chess.isCheckmate() ? (chess.turn() === 'w' ? 'Black Wins!' : 'White Wins!') : 'Draw!')
            : isAIThinking 
            ? '🤖 AI is thinking...'
            : (chess.turn() === 'w' ? 'Your turn (White)' : 'AI turn (Black)')
          }
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
        {/* Plateau */}
        <div style={{
          background: '#374151',
          padding: '30px',
          borderRadius: '15px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative'
        }}>
          {/* Coordonnées des colonnes (a-h) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '10px',
            paddingLeft: '25px',
            paddingRight: '25px'
          }}>
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
              <div key={letter} style={{
                width: '80px',
                textAlign: 'center',
                color: '#d1d5db',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}>
                {letter}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Coordonnées des rangées (8-1) */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              height: '640px',
              marginRight: '10px'
            }}>
              {[8, 7, 6, 5, 4, 3, 2, 1].map(number => (
                <div key={number} style={{
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#d1d5db',
                  fontWeight: 'bold',
                  fontSize: '1.2rem'
                }}>
                  {number}
                </div>
              ))}
            </div>

            {/* Plateau principal */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 80px)',
              gridTemplateRows: 'repeat(8, 80px)',
              gap: '0',
              border: '3px solid #4b5563',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
            }}>
            {squares.map((square, index) => {
              const isLight = (Math.floor(index / 8) + (index % 8)) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isHovered = hoveredSquare === square;
              
              return (
                <div
                  key={square}
                  onClick={() => handleClick(square)}
                  onMouseEnter={() => setHoveredSquare(square)}
                  onMouseLeave={() => setHoveredSquare(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3.5rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected 
                      ? '#3b82f6' 
                      : isHovered 
                      ? (isLight ? '#fef3c7' : '#d97706')
                      : (isLight ? '#f0d9b5' : '#b58863'),
                    border: isSelected ? '4px solid #1d4ed8' : '1px solid rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    position: 'relative',
                    boxShadow: isSelected 
                      ? '0 0 15px rgba(59, 130, 246, 0.5)' 
                      : isHovered 
                      ? '0 0 10px rgba(0,0,0,0.2)' 
                      : 'inset 0 0 10px rgba(0,0,0,0.1)',
                    transform: isHovered && !isSelected ? 'scale(1.02)' : 'scale(1)',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {getPieceSymbol(square)}
                </div>
              );
            })}
            </div>
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
          <h3 style={{ margin: '0 0 20px 0' }}>Controls</h3>
          
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
              marginBottom: '20px'
            }}
          >
            New Game
          </button>

          <div>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#d1d5db' }}>
              Move History
            </h4>
            <div style={{
              maxHeight: '150px',
              overflowY: 'auto',
              fontSize: '0.8rem',
              background: 'rgba(0,0,0,0.2)',
              padding: '10px',
              borderRadius: '5px'
            }}>
              {chess.history().length === 0 ? (
                <p style={{ margin: '0', color: '#9ca3af' }}>No moves yet</p>
              ) : (
                chess.history().map((move, index) => (
                  <div key={index} style={{ margin: '2px 0' }}>
                    {Math.ceil((index + 1) / 2)}.{index % 2 === 0 ? '' : '..'} {move}
                  </div>
                ))
              )}
            </div>
          </div>

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

          {chess.isGameOver() && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '5px',
              color: '#fcd34d',
              textAlign: 'center'
            }}>
              🏆 Game Over!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
