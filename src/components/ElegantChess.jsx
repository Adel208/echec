import React, { useState, useEffect } from 'react';
import { Chess } from 'chess.js';

export const ElegantChess = () => {
  const [chess] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameUpdate, setGameUpdate] = useState(0);
  const [hoveredSquare, setHoveredSquare] = useState(null);

  // Évaluation de position (même algorithme intelligent)
  const evaluatePosition = (chess) => {
    let score = 0;
    const pieceValues = {
      'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const square = String.fromCharCode(97 + j) + (8 - i);
        const piece = chess.get(square);
        
        if (piece) {
          let pieceValue = pieceValues[piece.type];
          
          if (piece.type === 'p') {
            if (piece.color === 'w') {
              pieceValue += (7 - i) * 0.1;
            } else {
              pieceValue += i * 0.1;
            }
          }
          
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

  // Minimax avec Alpha-Beta
  const minimax = (chess, depth, alpha, beta, maximizingPlayer) => {
    if (depth === 0 || chess.isGameOver()) {
      return evaluatePosition(chess);
    }
    
    const moves = chess.moves({ verbose: true });
    
    if (maximizingPlayer) {
      let maxEvaluation = -Infinity;
      for (let move of moves) {
        chess.move(move);
        const evaluation = minimax(chess, depth - 1, alpha, beta, false);
        chess.undo();
        maxEvaluation = Math.max(maxEvaluation, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEvaluation;
    } else {
      let minEvaluation = Infinity;
      for (let move of moves) {
        chess.move(move);
        const evaluation = minimax(chess, depth - 1, alpha, beta, true);
        chess.undo();
        minEvaluation = Math.min(minEvaluation, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEvaluation;
    }
  };

  // IA intelligente
  const makeSmartAIMove = () => {
    const moves = chess.moves({ verbose: true });
    if (moves.length === 0) return;
    
    let bestMove = null;
    let bestScore = Infinity;
    const depth = 3;
    
    for (let move of moves) {
      chess.move(move);
      const score = minimax(chess, depth - 1, -Infinity, Infinity, true);
      chess.undo();
      
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    
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
        makeSmartAIMove();
        setIsAIThinking(false);
      }, 1200);
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

  // Symboles des pièces avec meilleur contraste
  const pieceSymbols = {
    'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
    'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟'
  };

  const getPieceSymbol = (square) => {
    const piece = chess.get(square);
    if (!piece) return '';
    return pieceSymbols[piece.color + piece.type] || '';
  };

  const getPieceColor = (square) => {
    const piece = chess.get(square);
    if (!piece) return '';
    return piece.color === 'w' ? '#ffffff' : '#000000';
  };

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
      padding: '0',
      background: 'linear-gradient(135deg, #2c3e50, #34495e)',
      minHeight: '100vh',
      color: '#ecf0f1',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      {/* Header élégant */}
      <div style={{
        background: 'linear-gradient(90deg, #1a1a1a, #2c2c2c)',
        padding: '20px 0',
        borderBottom: '3px solid #3498db',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ 
            fontSize: '3rem', 
            margin: '0', 
            background: 'linear-gradient(45deg, #ffffff, #bdc3c7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}>
            ♔ CHESS MASTER ♛
          </h1>
          <div style={{
            fontSize: '1.3rem',
            margin: '10px 0',
            padding: '10px 20px',
            background: chess.isGameOver() 
              ? 'linear-gradient(45deg, #e74c3c, #c0392b)'
              : isAIThinking 
              ? 'linear-gradient(45deg, #f39c12, #e67e22)'
              : chess.turn() === 'w' 
              ? 'linear-gradient(45deg, #ecf0f1, #bdc3c7)'
              : 'linear-gradient(45deg, #2c3e50, #34495e)',
            color: chess.turn() === 'w' && !chess.isGameOver() && !isAIThinking ? '#2c3e50' : '#ffffff',
            borderRadius: '25px',
            display: 'inline-block',
            fontWeight: 'bold',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}>
            {chess.isGameOver() 
              ? (chess.isCheckmate() ? 
                  (chess.turn() === 'w' ? '🏆 BLACK WINS!' : '🏆 WHITE WINS!') 
                  : '🤝 DRAW GAME')
              : isAIThinking 
              ? '🤖 AI CALCULATING...'
              : chess.turn() === 'w' 
              ? '⚪ WHITE TO MOVE' 
              : '⚫ BLACK TO MOVE (AI)'
            }
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '40px', 
        padding: '30px 20px',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
      }}>
        {/* Plateau principal */}
        <div style={{
          background: 'linear-gradient(145deg, #34495e, #2c3e50)',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          border: '2px solid #3498db'
        }}>
          {/* Coordonnées colonnes */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-around',
            marginBottom: '15px',
            paddingLeft: '30px',
            paddingRight: '30px'
          }}>
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
              <div key={letter} style={{
                width: '90px',
                textAlign: 'center',
                color: '#3498db',
                fontWeight: 'bold',
                fontSize: '1.4rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
              }}>
                {letter.toUpperCase()}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Coordonnées rangées */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              height: '720px',
              marginRight: '15px'
            }}>
              {[8, 7, 6, 5, 4, 3, 2, 1].map(number => (
                <div key={number} style={{
                  height: '90px',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#3498db',
                  fontWeight: 'bold',
                  fontSize: '1.4rem',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {number}
                </div>
              ))}
            </div>

            {/* Échiquier */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(8, 90px)',
              gridTemplateRows: 'repeat(8, 90px)',
              gap: '0',
              border: '4px solid #2c3e50',
              borderRadius: '12px',
              boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
              overflow: 'hidden'
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
                    fontSize: '4rem',
                    cursor: 'pointer',
                    backgroundColor: isSelected 
                      ? '#3498db' 
                      : isHovered 
                      ? (isLight ? '#f8f9fa' : '#6c757d')
                      : (isLight ? '#f1f2f6' : '#57606f'),
                    border: isSelected ? '3px solid #2980b9' : '1px solid rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    userSelect: 'none',
                    position: 'relative',
                    boxShadow: isSelected 
                      ? '0 0 20px rgba(52, 152, 219, 0.6), inset 0 0 20px rgba(255,255,255,0.1)' 
                      : isHovered 
                      ? '0 0 15px rgba(0,0,0,0.3)' 
                      : 'inset 0 2px 4px rgba(0,0,0,0.1)',
                    transform: isHovered && !isSelected ? 'scale(1.05)' : 'scale(1)',
                    fontWeight: 'bold',
                    color: getPieceColor(square),
                    textShadow: getPieceColor(square) === '#ffffff' 
                      ? '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)' 
                      : '2px 2px 4px rgba(255,255,255,0.8), 0 0 8px rgba(255,255,255,0.3)'
                  }}
                >
                  {getPieceSymbol(square)}
                  {/* Indicateur de case */}
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '4px',
                    fontSize: '0.7rem',
                    color: isLight ? '#7f8c8d' : '#bdc3c7',
                    fontWeight: 'normal',
                    opacity: 0.6
                  }}>
                    {square}
                  </div>
                </div>
              );
            })}
            </div>
          </div>
        </div>

        {/* Panel de contrôle moderne */}
        <div style={{
          background: 'linear-gradient(145deg, #2c3e50, #34495e)',
          padding: '25px',
          borderRadius: '20px',
          width: '320px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          border: '2px solid #3498db'
        }}>
          <h3 style={{ 
            margin: '0 0 25px 0', 
            color: '#3498db',
            fontSize: '1.5rem',
            textAlign: 'center',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            🎮 GAME CONTROL
          </h3>
          
          <button
            onClick={newGame}
            style={{
              width: '100%',
              padding: '15px',
              background: 'linear-gradient(45deg, #27ae60, #2ecc71)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              marginBottom: '25px',
              fontWeight: 'bold',
              boxShadow: '0 6px 20px rgba(46, 204, 113, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(46, 204, 113, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 6px 20px rgba(46, 204, 113, 0.3)';
            }}
          >
            🆕 NEW GAME
          </button>

          {/* Status des joueurs */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid rgba(52, 152, 219, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#3498db', textAlign: 'center' }}>
              👥 PLAYERS
            </h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{
                background: chess.turn() === 'w' ? 'rgba(52, 152, 219, 0.3)' : 'transparent',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #ecf0f1',
                textAlign: 'center',
                flex: 1,
                marginRight: '5px'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⚪</div>
                <div style={{ fontWeight: 'bold', color: '#ffffff' }}>YOU</div>
                <div style={{ fontSize: '0.8rem', color: '#bdc3c7' }}>White</div>
              </div>
              
              <div style={{
                background: chess.turn() === 'b' ? 'rgba(52, 152, 219, 0.3)' : 'transparent',
                padding: '10px',
                borderRadius: '8px',
                border: '2px solid #2c3e50',
                textAlign: 'center',
                flex: 1,
                marginLeft: '5px'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>⚫</div>
                <div style={{ fontWeight: 'bold', color: '#ffffff' }}>AI</div>
                <div style={{ fontSize: '0.8rem', color: '#bdc3c7' }}>Black</div>
              </div>
            </div>
          </div>

          {/* Historique des coups */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '15px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid rgba(52, 152, 219, 0.3)'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#3498db', fontSize: '1rem' }}>
              📝 MOVE HISTORY
            </h4>
            <div style={{
              maxHeight: '150px',
              overflowY: 'auto',
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              {chess.history().length === 0 ? (
                <p style={{ margin: '0', color: '#7f8c8d', fontStyle: 'italic' }}>
                  No moves yet...
                </p>
              ) : (
                chess.history().map((move, index) => (
                  <div key={index} style={{ 
                    margin: '3px 0',
                    color: index % 2 === 0 ? '#ffffff' : '#bdc3c7'
                  }}>
                    <span style={{ color: '#3498db', fontWeight: 'bold' }}>
                      {Math.ceil((index + 1) / 2)}.
                    </span>
                    {index % 2 === 0 ? '' : '..'} {move}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Status alerts */}
          {isAIThinking && (
            <div style={{
              padding: '15px',
              background: 'linear-gradient(45deg, #f39c12, #e67e22)',
              border: '2px solid #d35400',
              borderRadius: '12px',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '15px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(243, 156, 18, 0.3)'
            }}>
              🧠 AI THINKING...
            </div>
          )}

          {chess.inCheck() && (
            <div style={{
              padding: '15px',
              background: 'linear-gradient(45deg, #e74c3c, #c0392b)',
              border: '2px solid #a93226',
              borderRadius: '12px',
              color: '#ffffff',
              textAlign: 'center',
              marginBottom: '15px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
            }}>
              ⚠️ CHECK!
            </div>
          )}

          {chess.isGameOver() && (
            <div style={{
              padding: '15px',
              background: 'linear-gradient(45deg, #8e44ad, #9b59b6)',
              border: '2px solid #7d3c98',
              borderRadius: '12px',
              color: '#ffffff',
              textAlign: 'center',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(142, 68, 173, 0.3)'
            }}>
              🏁 GAME OVER!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
